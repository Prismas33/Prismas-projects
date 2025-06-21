package com.scanluckpro.domain

import android.content.Context
import android.graphics.BitmapFactory
import com.scanluckpro.data.*
import com.scanluckpro.ml.*
import com.scanluckpro.pdf.PdfExporter
import com.scanluckpro.integration.CloudIntegration
import com.scanluckpro.integration.WebhookPayload
import com.scanluckpro.utils.CompressionUtils
import java.io.File
import java.util.*

class ScanDocumentUseCase(
    private val database: AppDatabase,
    private val context: Context
) {
    suspend fun execute(
        imagePaths: List<String>,
        documentName: String,
        ocrLanguage: OcrProcessor.LanguageMode = OcrProcessor.LanguageMode.LATIN,
        correctPerspective: Boolean = true
    ): Result<Document> {
        return try {
            val document = Document(
                name = documentName,
                pageCount = imagePaths.size
            )
            
            // Salva documento
            database.documentDao().insertDocument(document)
            
            val ocrTexts = mutableListOf<String>()
            
            // Processa cada página
            imagePaths.forEachIndexed { index, imagePath ->
                val bitmap = BitmapFactory.decodeFile(imagePath)
                
                // Correção de perspectiva se solicitada
                val correctedBitmap = if (correctPerspective) {
                    PerspectiveCorrector.correctPerspective(bitmap)
                } else {
                    bitmap
                }
                
                // OCR
                val ocrResult = OcrProcessor.recognizeText(context, correctedBitmap, ocrLanguage)
                ocrTexts.add(ocrResult.fullText)
                
                // Salva página
                val page = DocumentPage(
                    documentId = document.id,
                    pageNumber = index + 1,
                    imagePath = imagePath,
                    ocrText = ocrResult.fullText
                )
                database.documentPageDao().insertPage(page)
                
                // Indexa para busca
                if (ocrResult.fullText.isNotEmpty()) {
                    val searchIndex = SearchIndex(
                        documentId = document.id,
                        pageId = page.id,
                        content = ocrResult.fullText,
                        contentType = "ocr"
                    )
                    database.searchIndexDao().insertSearchIndex(searchIndex)
                }
            }
            
            // Atualiza documento com texto completo
            val updatedDocument = document.copy(
                ocrText = ocrTexts.joinToString("\n"),
                updatedAt = System.currentTimeMillis()
            )
            database.documentDao().updateDocument(updatedDocument)
            
            Result.success(updatedDocument)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class ExportDocumentUseCase(
    private val database: AppDatabase,
    private val context: Context
) {
    suspend fun execute(
        documentId: String,
        format: ExportFormat,
        outputDir: File,
        options: ExportOptions
    ): Result<List<String>> {
        return try {
            val document = database.documentDao().getDocumentById(documentId)
                ?: return Result.failure(Exception("Documento não encontrado"))
            
            val pages = database.documentPageDao().getPagesByDocumentId(documentId)
            val imagePaths = pages.map { it.imagePath }
            val ocrTexts = pages.map { it.ocrText }
            
            val exportedFiles = when (format) {
                ExportFormat.PDF -> {
                    val outputFile = File(outputDir, "${options.fileName}.pdf")
                    val success = PdfExporter.exportToPdf(
                        context, imagePaths, outputFile, 
                        options.includeOcrText, ocrTexts, options.compressionQuality
                    )
                    if (success) listOf(outputFile.absolutePath) else emptyList()
                }
                ExportFormat.JPEG -> {
                    PdfExporter.exportToJpeg(imagePaths, outputDir, options.compressionQuality)
                }
                ExportFormat.TXT -> {
                    val outputFile = File(outputDir, "${options.fileName}.txt")
                    val success = PdfExporter.exportToText(ocrTexts, outputFile)
                    if (success) listOf(outputFile.absolutePath) else emptyList()
                }
                else -> emptyList()
            }
            
            Result.success(exportedFiles)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class SearchDocumentsUseCase(
    private val database: AppDatabase
) {
    suspend fun execute(query: String): Result<List<Document>> {
        return try {
            val documents = if (query.isBlank()) {
                database.documentDao().getAllDocuments()
            } else {
                // Busca nos documentos e no índice de busca
                val directMatches = database.documentDao().searchDocuments(query)
                val indexMatches = database.searchIndexDao().searchDocumentIds(query)
                
                val indexDocuments = indexMatches.mapNotNull { docId ->
                    database.documentDao().getDocumentById(docId)
                }
                
                (directMatches + indexDocuments).distinctBy { it.id }
            }
            
            Result.success(documents)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class BatchScanUseCase(
    private val database: AppDatabase,
    private val context: Context
) {
    suspend fun execute(
        imagePaths: List<String>,
        batchName: String,
        ocrLanguage: OcrProcessor.LanguageMode = OcrProcessor.LanguageMode.LATIN
    ): Result<Document> {
        return try {
            val document = Document(
                name = "$batchName (${imagePaths.size} páginas)",
                pageCount = imagePaths.size
            )
            
            database.documentDao().insertDocument(document)
            
            val allOcrText = mutableListOf<String>()
            
            imagePaths.forEachIndexed { index, imagePath ->
                val bitmap = BitmapFactory.decodeFile(imagePath)
                val correctedBitmap = PerspectiveCorrector.correctPerspective(bitmap)
                val ocrResult = OcrProcessor.recognizeText(context, correctedBitmap, ocrLanguage)
                
                allOcrText.add(ocrResult.fullText)
                
                val page = DocumentPage(
                    documentId = document.id,
                    pageNumber = index + 1,
                    imagePath = imagePath,
                    ocrText = ocrResult.fullText
                )
                database.documentPageDao().insertPage(page)
                
                // Indexa para busca
                if (ocrResult.fullText.isNotEmpty()) {
                    val searchIndex = SearchIndex(
                        documentId = document.id,
                        pageId = page.id,
                        content = ocrResult.fullText,
                        contentType = "ocr"
                    )
                    database.searchIndexDao().insertSearchIndex(searchIndex)
                }
            }
            
            val updatedDocument = document.copy(
                ocrText = allOcrText.joinToString("\n"),
                updatedAt = System.currentTimeMillis()
            )
            database.documentDao().updateDocument(updatedDocument)
            
            Result.success(updatedDocument)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class AutomationUseCase(
    private val context: Context
) {
    suspend fun execute(
        document: Document,
        exportedFilePaths: List<String>,
        automationConfig: AutomationConfig
    ): Result<Boolean> {
        return try {
            when (automationConfig.type) {
                AutomationType.WEBHOOK -> {
                    val payload = WebhookPayload(
                        event = "document_exported",
                        timestamp = System.currentTimeMillis(),
                        documentName = document.name,
                        pageCount = document.pageCount,
                        ocrText = document.ocrText,
                        format = automationConfig.format,
                        userId = automationConfig.userId
                    )
                    
                    val success = CloudIntegration.sendWebhook(automationConfig.webhookUrl, payload)
                    Result.success(success)
                }
                AutomationType.CLOUD_UPLOAD -> {
                    var allSuccess = true
                    exportedFilePaths.forEach { filePath ->
                        val success = when (automationConfig.cloudProvider) {
                            "drive" -> CloudIntegration.uploadToDrive(context, filePath, document.name)
                            "dropbox" -> CloudIntegration.uploadToDropbox(context, filePath, document.name)
                            else -> false
                        }
                        if (!success) allSuccess = false
                    }
                    Result.success(allSuccess)
                }
                AutomationType.SHARE -> {
                    exportedFilePaths.forEach { filePath ->
                        when (automationConfig.shareTarget) {
                            "whatsapp" -> CloudIntegration.shareViaWhatsApp(context, filePath, document.name)
                            "email" -> CloudIntegration.shareViaEmail(context, filePath, document.name)
                            "telegram" -> CloudIntegration.shareViaTelegram(context, filePath, document.name)
                            else -> CloudIntegration.shareViaIntent(context, filePath, document.name)
                        }
                    }
                    Result.success(true)
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

data class AutomationConfig(
    val type: AutomationType,
    val webhookUrl: String = "",
    val cloudProvider: String = "",
    val shareTarget: String = "",
    val format: String = "",
    val userId: String = ""
)

enum class AutomationType {
    WEBHOOK, CLOUD_UPLOAD, SHARE
}

enum class ExportFormat {
    PDF, JPEG, PNG, TXT
}

data class ExportOptions(
    val format: ExportFormat,
    val includeOcrText: Boolean = false,
    val compressionQuality: Int = 80,
    val fileName: String = "scan_${System.currentTimeMillis()}"
)

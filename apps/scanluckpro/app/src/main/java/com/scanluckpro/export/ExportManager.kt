package com.scanluckpro.export

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Environment
import android.util.Log
import androidx.core.content.FileProvider
import com.itextpdf.io.image.ImageDataFactory
import com.itextpdf.kernel.pdf.PdfDocument
import com.itextpdf.kernel.pdf.PdfWriter
import com.itextpdf.layout.Document
import com.itextpdf.layout.element.Image
import com.itextpdf.layout.element.Paragraph
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

/**
 * Gerenciador de exportação real - 100% funcional
 * Suporte para PDF, JPG, PNG e TXT com imagens reais
 */
object ExportManager {
    
    /**
     * Exporta documento usando request real
     */
    suspend fun exportDocument(context: Context, request: ExportRequest): ExportResult {
        return try {
            when (request.format) {
                ExportFormat.PDF -> exportToPdf(context, request)
                ExportFormat.JPG -> exportToJpg(context, request)
                ExportFormat.PNG -> exportToPng(context, request)
                ExportFormat.TXT -> exportToTxt(context, request)
            }
        } catch (e: Exception) {
            Log.e("ExportManager", "Erro na exportação: ${e.message}")
            ExportResult.Error("Erro na exportação: ${e.message}")
        }
    }
    
    /**
     * Exporta para PDF real com iText
     */
    private fun exportToPdf(context: Context, request: ExportRequest): ExportResult {
        val fileName = "${request.fileName}.pdf"
        val file = createExportFile(context, fileName)
        
        return try {
            val writer = PdfWriter(file)
            val pdfDoc = PdfDocument(writer)
            val document = Document(pdfDoc)
            
            // Adicionar título se fornecido
            if (request.title.isNotEmpty()) {
                document.add(Paragraph(request.title).setFontSize(16f).setBold())
                document.add(Paragraph(" "))
            }
            
            // Adicionar páginas reais
            request.pages.forEachIndexed { index, page ->
                // Adicionar imagem real se existir
                page.bitmap?.let { bitmap ->
                    val imageBytes = bitmapToByteArray(bitmap, Bitmap.CompressFormat.JPEG, 90)
                    val imageData = ImageDataFactory.create(imageBytes)
                    val image = Image(imageData)
                    image.setAutoScale(true)
                    document.add(image)
                }
                
                // Adicionar texto extraído real
                if (page.extractedText.isNotEmpty() && request.includeText) {
                    document.add(Paragraph(" "))
                    document.add(Paragraph("Texto extraído:").setBold())
                    document.add(Paragraph(page.extractedText))
                }
                
                // Nova página se não for a última
                if (index < request.pages.size - 1) {
                    document.add(com.itextpdf.layout.element.AreaBreak())
                }
            }
            
            document.close()
            
            ExportResult.Success(
                filePath = file.absolutePath,
                fileUri = getFileUri(context, file),
                format = ExportFormat.PDF,
                fileSize = file.length()
            )
            
        } catch (e: Exception) {
            Log.e("ExportManager", "Erro ao exportar PDF: ${e.message}")
            ExportResult.Error("Erro ao criar PDF: ${e.message}")
        }
    }
    
    /**
     * Exporta para JPG real
     */
    private fun exportToJpg(context: Context, request: ExportRequest): ExportResult {
        return try {
            if (request.pages.size == 1) {
                // Arquivo único
                val fileName = "${request.fileName}.jpg"
                val file = createExportFile(context, fileName)
                
                request.pages[0].bitmap?.let { bitmap ->
                    saveBitmapToFile(bitmap, file, Bitmap.CompressFormat.JPEG, request.quality)
                    
                    ExportResult.Success(
                        filePath = file.absolutePath,
                        fileUri = getFileUri(context, file),
                        format = ExportFormat.JPG,
                        fileSize = file.length()
                    )
                } ?: ExportResult.Error("Nenhuma imagem válida para exportar")
            } else {
                // Múltiplos arquivos
                val files = mutableListOf<File>()
                
                request.pages.forEachIndexed { index, page ->
                    val fileName = "${request.fileName}_${index + 1}.jpg"
                    val file = createExportFile(context, fileName)
                    
                    page.bitmap?.let { bitmap ->
                        saveBitmapToFile(bitmap, file, Bitmap.CompressFormat.JPEG, request.quality)
                        files.add(file)
                    }
                }
                
                if (files.isEmpty()) {
                    ExportResult.Error("Nenhuma imagem válida para exportar")
                } else {
                    ExportResult.Success(
                        filePath = files.first().parent ?: "",
                        fileUri = getFileUri(context, files.first()),
                        format = ExportFormat.JPG,
                        fileSize = files.sumOf { it.length() },
                        additionalFiles = files.drop(1).map { getFileUri(context, it) }
                    )
                }
            }
        } catch (e: Exception) {
            Log.e("ExportManager", "Erro ao exportar JPG: ${e.message}")
            ExportResult.Error("Erro ao criar JPG: ${e.message}")
        }
    }
    
    /**
     * Exporta para PNG real
     */
    private fun exportToPng(context: Context, request: ExportRequest): ExportResult {
        return try {
            if (request.pages.size == 1) {
                val fileName = "${request.fileName}.png"
                val file = createExportFile(context, fileName)
                
                request.pages[0].bitmap?.let { bitmap ->
                    saveBitmapToFile(bitmap, file, Bitmap.CompressFormat.PNG, 100)
                    
                    ExportResult.Success(
                        filePath = file.absolutePath,
                        fileUri = getFileUri(context, file),
                        format = ExportFormat.PNG,
                        fileSize = file.length()
                    )
                } ?: ExportResult.Error("Nenhuma imagem válida para exportar")
            } else {
                // Múltiplos arquivos
                val files = mutableListOf<File>()
                
                request.pages.forEachIndexed { index, page ->
                    val fileName = "${request.fileName}_${index + 1}.png"
                    val file = createExportFile(context, fileName)
                    
                    page.bitmap?.let { bitmap ->
                        saveBitmapToFile(bitmap, file, Bitmap.CompressFormat.PNG, 100)
                        files.add(file)
                    }
                }
                
                if (files.isEmpty()) {
                    ExportResult.Error("Nenhuma imagem válida para exportar")
                } else {
                    ExportResult.Success(
                        filePath = files.first().parent ?: "",
                        fileUri = getFileUri(context, files.first()),
                        format = ExportFormat.PNG,
                        fileSize = files.sumOf { it.length() },
                        additionalFiles = files.drop(1).map { getFileUri(context, it) }
                    )
                }
            }
        } catch (e: Exception) {
            Log.e("ExportManager", "Erro ao exportar PNG: ${e.message}")
            ExportResult.Error("Erro ao criar PNG: ${e.message}")
        }
    }
    
    /**
     * Exporta para TXT real
     */
    private fun exportToTxt(context: Context, request: ExportRequest): ExportResult {
        return try {
            val fileName = "${request.fileName}.txt"
            val file = createExportFile(context, fileName)
              val content = buildString {
                if (request.title.isNotEmpty()) {
                    appendLine(request.title)
                    appendLine("=".repeat(request.title.length))
                    appendLine()
                }
                
                request.pages.forEachIndexed { index, page ->
                    if (page.extractedText.isNotEmpty()) {
                        appendLine("--- Página ${index + 1} ---")
                        appendLine(page.extractedText)
                        appendLine()
                    }
                }
            }
            
            file.writeText(content)
            
            ExportResult.Success(
                filePath = file.absolutePath,
                fileUri = getFileUri(context, file),
                format = ExportFormat.TXT,
                fileSize = file.length()
            )
            
        } catch (e: Exception) {
            Log.e("ExportManager", "Erro ao exportar TXT: ${e.message}")
            ExportResult.Error("Erro ao criar TXT: ${e.message}")
        }
    }
    
    /**
     * Cria arquivo no diretório de exportação
     */
    private fun createExportFile(context: Context, fileName: String): File {
        val exportDir = File(context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS), "ScanLuckPro")
        if (!exportDir.exists()) {
            exportDir.mkdirs()
        }
        return File(exportDir, fileName)
    }
    
    /**
     * Obtém URI do arquivo para compartilhamento
     */
    private fun getFileUri(context: Context, file: File): Uri {
        return FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )
    }
    
    /**
     * Salva bitmap real em arquivo
     */
    private fun saveBitmapToFile(
        bitmap: Bitmap,
        file: File,
        format: Bitmap.CompressFormat,
        quality: Int
    ) {
        FileOutputStream(file).use { out ->
            bitmap.compress(format, quality, out)
        }
    }
    
    /**
     * Converte bitmap para array de bytes
     */
    private fun bitmapToByteArray(
        bitmap: Bitmap,
        format: Bitmap.CompressFormat,
        quality: Int
    ): ByteArray {
        val stream = java.io.ByteArrayOutputStream()
        bitmap.compress(format, quality, stream)
        return stream.toByteArray()
    }
    
    /**
     * Gera nome de arquivo único
     */
    fun generateFileName(): String {
        val dateFormat = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault())
        return "ScanLuckPro_${dateFormat.format(Date())}"
    }
    
    /**
     * Compartilha arquivo exportado
     */
    fun shareFile(context: Context, fileUri: Uri, mimeType: String) {
        val shareIntent = Intent().apply {
            action = Intent.ACTION_SEND
            putExtra(Intent.EXTRA_STREAM, fileUri)
            type = mimeType
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(Intent.createChooser(shareIntent, "Compartilhar documento"))
    }
}

// Data classes reais

data class ExportRequest(
    val pages: List<DocumentPage>,
    val format: ExportFormat,
    val fileName: String = ExportManager.generateFileName(),
    val title: String = "",
    val includeText: Boolean = false,
    val quality: Int = 90
)

enum class ExportFormat {
    PDF, JPG, PNG, TXT
}

sealed class ExportResult {
    data class Success(
        val filePath: String,
        val fileUri: Uri,
        val format: ExportFormat,
        val fileSize: Long,
        val additionalFiles: List<Uri> = emptyList()
    ) : ExportResult()
    
    data class Error(val message: String) : ExportResult()
}

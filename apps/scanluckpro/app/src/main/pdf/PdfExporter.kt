package com.scanluckpro.pdf

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.pdf.PdfDocument
import android.util.Log
import com.itextpdf.io.image.ImageDataFactory
import com.itextpdf.kernel.pdf.PdfWriter
import com.itextpdf.kernel.pdf.PdfDocument as ITextPdfDocument
import com.itextpdf.layout.Document
import com.itextpdf.layout.element.Image
import com.itextpdf.layout.element.Paragraph
import java.io.*

object PdfExporter {
    
    fun exportToPdf(
        context: Context, 
        imagePaths: List<String>, 
        outputFile: File,
        includeOcrText: Boolean = false,
        ocrTexts: List<String> = emptyList(),
        compressionQuality: Int = 80
    ): Boolean {
        return try {
            val writer = PdfWriter(outputFile)
            val pdfDoc = ITextPdfDocument(writer)
            val document = Document(pdfDoc)
            
            imagePaths.forEachIndexed { index, imagePath ->
                // Adicionar imagem
                val bitmap = BitmapFactory.decodeFile(imagePath)
                val compressedImagePath = compressImage(bitmap, compressionQuality)
                val imageData = ImageDataFactory.create(compressedImagePath)
                val image = Image(imageData)
                
                // Ajustar tamanho da imagem para caber na página
                image.setAutoScale(true)
                document.add(image)
                
                // Adicionar texto OCR se solicitado
                if (includeOcrText && index < ocrTexts.size && ocrTexts[index].isNotEmpty()) {
                    document.add(Paragraph("\n--- Texto Extraído ---"))
                    document.add(Paragraph(ocrTexts[index]))
                }
                
                // Nova página para próxima imagem (exceto última)
                if (index < imagePaths.size - 1) {
                    document.add(com.itextpdf.layout.element.AreaBreak())
                }
            }
            
            document.close()
            true
        } catch (e: Exception) {
            Log.e("PdfExporter", "Erro ao exportar PDF", e)
            false
        }
    }
    
    fun exportToJpeg(
        imagePaths: List<String>,
        outputDir: File,
        quality: Int = 90
    ): List<String> {
        val exportedFiles = mutableListOf<String>()
        
        imagePaths.forEachIndexed { index, imagePath ->
            try {
                val bitmap = BitmapFactory.decodeFile(imagePath)
                val outputFile = File(outputDir, "scan_page_${index + 1}.jpg")
                
                FileOutputStream(outputFile).use { out ->
                    bitmap.compress(Bitmap.CompressFormat.JPEG, quality, out)
                }
                
                exportedFiles.add(outputFile.absolutePath)
            } catch (e: Exception) {
                Log.e("PdfExporter", "Erro ao exportar JPEG $index", e)
            }
        }
        
        return exportedFiles
    }
    
    fun exportToText(ocrTexts: List<String>, outputFile: File): Boolean {
        return try {
            outputFile.writeText(ocrTexts.joinToString("\n\n--- Nova Página ---\n\n"))
            true
        } catch (e: Exception) {
            Log.e("PdfExporter", "Erro ao exportar TXT", e)
            false
        }
    }
    
    private fun compressImage(bitmap: Bitmap, quality: Int): String {
        val tempFile = File.createTempFile("compressed_", ".jpg")
        FileOutputStream(tempFile).use { out ->
            bitmap.compress(Bitmap.CompressFormat.JPEG, quality, out)
        }
        return tempFile.absolutePath
    }
}

data class ExportOptions(
    val format: ExportFormat,
    val includeOcrText: Boolean = false,
    val compressionQuality: Int = 80,
    val fileName: String = "scan_${System.currentTimeMillis()}"
)

enum class ExportFormat {
    PDF, JPEG, PNG, TXT
}

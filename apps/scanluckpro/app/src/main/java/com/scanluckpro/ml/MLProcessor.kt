package com.scanluckpro.ml

import android.graphics.Bitmap
import android.graphics.Rect
import android.util.Log
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/**
 * Processador ML Kit - OCR e Detecção de Códigos
 * - Reconhecimento de texto offline
 * - Detecção de QR Code e códigos de barras
 * - Busca inteligente em documentos
 */
object MLProcessor {
    
    /**
     * Extrai texto de uma imagem usando ML Kit OCR
     */
    suspend fun extractText(bitmap: Bitmap): TextExtractionResult {
        return try {
            val image = InputImage.fromBitmap(bitmap, 0)
            val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
            
            val result = suspendCancellableCoroutine { continuation ->
                recognizer.process(image)
                    .addOnSuccessListener { visionText ->
                        continuation.resume(visionText)
                    }
                    .addOnFailureListener { exception ->
                        continuation.resumeWithException(exception)
                    }
            }
            
            val extractedText = result.textBlocks.joinToString("\\n") { block ->
                block.text
            }
            
            val textBlocks = result.textBlocks.map { block ->
                TextBlock(
                    text = block.text,
                    boundingBox = block.boundingBox ?: Rect(),
                    confidence = 0.9f, // ML Kit não fornece confidence diretamente
                    lines = block.lines.map { line ->
                        TextLine(
                            text = line.text,
                            boundingBox = line.boundingBox ?: Rect(),
                            confidence = 0.9f
                        )
                    }
                )
            }
            
            TextExtractionResult(
                fullText = extractedText,
                textBlocks = textBlocks,
                isSuccess = true,
                confidence = calculateOverallConfidence(textBlocks),
                wordCount = extractedText.split("\\s+").size,
                error = null
            )
            
        } catch (e: Exception) {
            Log.e("MLProcessor", "Erro no OCR: ${e.message}")
            TextExtractionResult(
                fullText = "",
                textBlocks = emptyList(),
                isSuccess = false,
                confidence = 0f,
                wordCount = 0,
                error = e.message
            )
        }
    }
    
    /**
     * Detecta códigos de barras e QR codes
     */
    suspend fun detectCodes(bitmap: Bitmap): CodeDetectionResult {
        return try {
            val image = InputImage.fromBitmap(bitmap, 0)
            val scanner = BarcodeScanning.getClient()
            
            val barcodes = suspendCancellableCoroutine { continuation ->
                scanner.process(image)
                    .addOnSuccessListener { barcodes ->
                        continuation.resume(barcodes)
                    }
                    .addOnFailureListener { exception ->
                        continuation.resumeWithException(exception)
                    }
            }
            
            val detectedCodes = barcodes.map { barcode ->
                DetectedCode(
                    rawValue = barcode.rawValue ?: "",
                    displayValue = barcode.displayValue ?: "",
                    format = mapBarcodeFormat(barcode.format),
                    boundingBox = barcode.boundingBox ?: Rect(),
                    cornerPoints = barcode.cornerPoints?.toList() ?: emptyList()
                )
            }
            
            CodeDetectionResult(
                codes = detectedCodes,
                isSuccess = detectedCodes.isNotEmpty(),
                error = null
            )
            
        } catch (e: Exception) {
            Log.e("MLProcessor", "Erro na detecção de códigos: ${e.message}")
            CodeDetectionResult(
                codes = emptyList(),
                isSuccess = false,
                error = e.message
            )
        }
    }
    
    /**
     * Busca inteligente em texto extraído
     */
    fun searchInText(
        extractedText: String, 
        query: String, 
        caseSensitive: Boolean = false
    ): SearchResult {
        return try {
            val searchText = if (caseSensitive) extractedText else extractedText.lowercase()
            val searchQuery = if (caseSensitive) query else query.lowercase()
            
            val matches = mutableListOf<TextMatch>()
            var startIndex = 0
            
            while (true) {
                val index = searchText.indexOf(searchQuery, startIndex)
                if (index == -1) break
                
                matches.add(
                    TextMatch(
                        text = extractedText.substring(index, index + query.length),
                        startIndex = index,
                        endIndex = index + query.length,
                        context = getContextAroundMatch(extractedText, index, query.length)
                    )
                )
                
                startIndex = index + 1
            }
            
            SearchResult(
                matches = matches,
                totalMatches = matches.size,
                searchQuery = query,
                isSuccess = true
            )
            
        } catch (e: Exception) {
            Log.e("MLProcessor", "Erro na busca: ${e.message}")
            SearchResult(
                matches = emptyList(),
                totalMatches = 0,
                searchQuery = query,
                isSuccess = false
            )
        }
    }
    
    /**
     * Calcula confiança geral dos blocos de texto
     */
    private fun calculateOverallConfidence(textBlocks: List<TextBlock>): Float {
        return if (textBlocks.isEmpty()) {
            0f
        } else {
            textBlocks.map { it.confidence }.average().toFloat()
        }
    }
    
    /**
     * Mapeia formato de código de barras
     */
    private fun mapBarcodeFormat(format: Int): String {
        return when (format) {
            Barcode.FORMAT_QR_CODE -> "QR Code"
            Barcode.FORMAT_CODE_128 -> "Code 128"
            Barcode.FORMAT_CODE_39 -> "Code 39"
            Barcode.FORMAT_CODE_93 -> "Code 93"
            Barcode.FORMAT_EAN_13 -> "EAN-13"
            Barcode.FORMAT_EAN_8 -> "EAN-8"
            Barcode.FORMAT_UPC_A -> "UPC-A"
            Barcode.FORMAT_UPC_E -> "UPC-E"
            Barcode.FORMAT_PDF417 -> "PDF417"
            Barcode.FORMAT_AZTEC -> "Aztec"
            Barcode.FORMAT_DATA_MATRIX -> "Data Matrix"
            else -> "Desconhecido"
        }
    }
    
    /**
     * Obtém contexto ao redor de uma correspondência
     */
    private fun getContextAroundMatch(text: String, matchIndex: Int, matchLength: Int): String {
        val contextLength = 50
        val start = maxOf(0, matchIndex - contextLength)
        val end = minOf(text.length, matchIndex + matchLength + contextLength)
        
        return text.substring(start, end).trim()
    }
}

// Data classes para resultados

data class TextExtractionResult(
    val fullText: String,
    val textBlocks: List<TextBlock>,
    val isSuccess: Boolean,
    val confidence: Float,
    val wordCount: Int,
    val error: String?
)

data class TextBlock(
    val text: String,
    val boundingBox: Rect,
    val confidence: Float,
    val lines: List<TextLine>
)

data class TextLine(
    val text: String,
    val boundingBox: Rect,
    val confidence: Float
)

data class CodeDetectionResult(
    val codes: List<DetectedCode>,
    val isSuccess: Boolean,
    val error: String?
)

data class DetectedCode(
    val rawValue: String,
    val displayValue: String,
    val format: String,
    val boundingBox: Rect,
    val cornerPoints: List<android.graphics.Point>
)

data class SearchResult(
    val matches: List<TextMatch>,
    val totalMatches: Int,
    val searchQuery: String,
    val isSuccess: Boolean
)

data class TextMatch(
    val text: String,
    val startIndex: Int,
    val endIndex: Int,
    val context: String
)

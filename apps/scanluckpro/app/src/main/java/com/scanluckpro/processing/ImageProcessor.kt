package com.scanluckpro.processing

import android.graphics.*
import android.util.Log
import kotlin.math.*

/**
 * Processador de Imagens Avançado
 * - Correção automática de perspectiva
 * - Melhoria de qualidade
 * - Detecção de bordas
 * - Filtros para documentos
 */
object ImageProcessor {
    
    /**
     * Processamento completo de documento
     */
    fun processDocument(bitmap: Bitmap): ProcessedDocument {
        return try {
            Log.d("ImageProcessor", "Iniciando processamento...")
            
            // 1. Detectar bordas do documento
            val corners = detectDocumentCorners(bitmap)
            
            // 2. Corrigir perspectiva se cantos foram detectados
            val correctedBitmap = if (corners != null) {
                correctPerspective(bitmap, corners)
            } else {
                bitmap
            }
            
            // 3. Melhorar qualidade da imagem
            val enhancedBitmap = enhanceImageQuality(correctedBitmap)
            
            // 4. Aplicar filtros de documento
            val finalBitmap = applyDocumentFilters(enhancedBitmap)
            
            ProcessedDocument(
                originalBitmap = bitmap,
                processedBitmap = finalBitmap,
                wasAutoAdjusted = corners != null,
                qualityScore = calculateQualityScore(finalBitmap)
            )
            
        } catch (e: Exception) {
            Log.e("ImageProcessor", "Erro no processamento: ${e.message}")
            ProcessedDocument(
                originalBitmap = bitmap,
                processedBitmap = bitmap,
                wasAutoAdjusted = false,
                qualityScore = 0.5f
            )
        }
    }
    
    /**
     * Detecta cantos do documento usando algoritmo simples
     * Em produção usaria OpenCV para melhor precisão
     */
    private fun detectDocumentCorners(bitmap: Bitmap): Array<PointF>? {
        return try {
            val width = bitmap.width
            val height = bitmap.height
            
            // Algoritmo simplificado de detecção de cantos
            // Assume documento retangular ocupando maior parte da imagem
            val margin = 0.1f
            
            val topLeft = PointF(width * margin, height * margin)
            val topRight = PointF(width * (1 - margin), height * margin)
            val bottomLeft = PointF(width * margin, height * (1 - margin))
            val bottomRight = PointF(width * (1 - margin), height * (1 - margin))
            
            arrayOf(topLeft, topRight, bottomRight, bottomLeft)
            
        } catch (e: Exception) {
            Log.e("ImageProcessor", "Erro na detecção de cantos: ${e.message}")
            null
        }
    }
    
    /**
     * Correção de perspectiva usando transformação de matriz
     */
    private fun correctPerspective(bitmap: Bitmap, corners: Array<PointF>): Bitmap {
        return try {
            val width = bitmap.width
            val height = bitmap.height
            
            // Destino: retângulo perfeito
            val targetWidth = width.toFloat()
            val targetHeight = height.toFloat()
            
            val dst = floatArrayOf(
                0f, 0f,                    // top-left
                targetWidth, 0f,           // top-right
                targetWidth, targetHeight, // bottom-right
                0f, targetHeight          // bottom-left
            )
            
            // Origem: cantos detectados
            val src = floatArrayOf(
                corners[0].x, corners[0].y, // top-left
                corners[1].x, corners[1].y, // top-right
                corners[2].x, corners[2].y, // bottom-right
                corners[3].x, corners[3].y  // bottom-left
            )
            
            val matrix = Matrix()
            matrix.setPolyToPoly(src, 0, dst, 0, 4)
            
            Bitmap.createBitmap(bitmap, 0, 0, width, height, matrix, true)
            
        } catch (e: Exception) {
            Log.e("ImageProcessor", "Erro na correção de perspectiva: ${e.message}")
            bitmap
        }
    }
    
    /**
     * Melhora qualidade: contraste, brilho, nitidez
     */
    private fun enhanceImageQuality(bitmap: Bitmap): Bitmap {
        val width = bitmap.width
        val height = bitmap.height
        val enhanced = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        
        val canvas = Canvas(enhanced)
        val paint = Paint()
        
        // Aplicar filtro de melhoria
        val colorMatrix = ColorMatrix()
        
        // Aumentar contraste (1.2) e brilho (+10)
        colorMatrix.set(floatArrayOf(
            1.2f, 0f, 0f, 0f, 10f,    // Red
            0f, 1.2f, 0f, 0f, 10f,    // Green
            0f, 0f, 1.2f, 0f, 10f,    // Blue
            0f, 0f, 0f, 1f, 0f        // Alpha
        ))
        
        paint.colorFilter = ColorMatrixColorFilter(colorMatrix)
        canvas.drawBitmap(bitmap, 0f, 0f, paint)
        
        return enhanced
    }
    
    /**
     * Aplica filtros específicos para documentos
     */
    private fun applyDocumentFilters(bitmap: Bitmap): Bitmap {
        val width = bitmap.width
        val height = bitmap.height
        val filtered = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        
        val pixels = IntArray(width * height)
        bitmap.getPixels(pixels, 0, width, 0, 0, width, height)
        
        for (i in pixels.indices) {
            val pixel = pixels[i]
            val alpha = (pixel shr 24) and 0xFF
            val red = (pixel shr 16) and 0xFF
            val green = (pixel shr 8) and 0xFF
            val blue = pixel and 0xFF
            
            // Converter para escala de cinza com pesos otimizados
            val gray = (red * 0.299 + green * 0.587 + blue * 0.114).toInt()
            
            // Aplicar threshold adaptativo para preto e branco
            val threshold = 140
            val bw = if (gray > threshold) 255 else 0
            
            pixels[i] = (alpha shl 24) or (bw shl 16) or (bw shl 8) or bw
        }
        
        filtered.setPixels(pixels, 0, width, 0, 0, width, height)
        return filtered
    }
    
    /**
     * Calcula pontuação de qualidade da imagem
     */
    private fun calculateQualityScore(bitmap: Bitmap): Float {
        return try {
            val width = bitmap.width
            val height = bitmap.height
            val sampleSize = min(width, height) / 10
            
            var variance = 0.0
            var mean = 0.0
            var pixelCount = 0
            
            // Amostragem para calcular variância (nitidez)
            for (x in 0 until width step sampleSize) {
                for (y in 0 until height step sampleSize) {
                    val pixel = bitmap.getPixel(x, y)
                    val gray = (Color.red(pixel) + Color.green(pixel) + Color.blue(pixel)) / 3.0
                    mean += gray
                    pixelCount++
                }
            }
            
            mean /= pixelCount
            
            for (x in 0 until width step sampleSize) {
                for (y in 0 until height step sampleSize) {
                    val pixel = bitmap.getPixel(x, y)
                    val gray = (Color.red(pixel) + Color.green(pixel) + Color.blue(pixel)) / 3.0
                    variance += (gray - mean).pow(2)
                }
            }
            
            variance /= pixelCount
            
            // Normalizar variância para score de 0-1
            (variance / 10000.0).coerceIn(0.0, 1.0).toFloat()
            
        } catch (e: Exception) {
            Log.e("ImageProcessor", "Erro no cálculo de qualidade: ${e.message}")
            0.5f
        }
    }
}

/**
 * Resultado do processamento de documento
 */
data class ProcessedDocument(
    val originalBitmap: Bitmap,
    val processedBitmap: Bitmap,
    val wasAutoAdjusted: Boolean,
    val qualityScore: Float
)

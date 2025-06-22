package com.scanluckpro.ml

import android.graphics.Bitmap
import android.graphics.Matrix
import android.util.Log
import kotlin.math.*

/**
 * Processador de documentos focado em digitalização como CamScanner
 * - Captura da câmera
 * - Correção de perspectiva
 * - Melhoria de qualidade da imagem
 * - Filtros para documentos
 */
object DocumentProcessor {
    
    /**
     * Processa uma imagem de documento: melhoria e correção de perspectiva
     * Funciona como o CamScanner - apenas processamento de imagem
     */
    fun processImage(bitmap: Bitmap): Bitmap {
        return try {
            Log.d("DocumentProcessor", "Iniciando processamento da imagem...")
            
            // 1. Melhorar contraste e brilho
            val enhancedBitmap = enhanceImageQuality(bitmap)
            
            // 2. Detectar e corrigir perspectiva básica
            val correctedBitmap = correctPerspective(enhancedBitmap)
            
            // 3. Aplicar filtros para melhorar legibilidade do documento
            val finalBitmap = applyDocumentFilters(correctedBitmap)
            
            Log.d("DocumentProcessor", "Processamento concluído com sucesso")
            finalBitmap
            
        } catch (e: Exception) {
            Log.e("DocumentProcessor", "Erro no processamento: ${e.message}")
            bitmap // Retorna original se houver erro
        }
    }
    
    /**
     * Melhora qualidade da imagem (contraste, brilho, nitidez)
     */
    private fun enhanceImageQuality(bitmap: Bitmap): Bitmap {
        val width = bitmap.width
        val height = bitmap.height
        val enhanced = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        
        val pixels = IntArray(width * height)
        bitmap.getPixels(pixels, 0, width, 0, 0, width, height)
        
        for (i in pixels.indices) {
            val pixel = pixels[i]
            val alpha = (pixel shr 24) and 0xFF
            var red = (pixel shr 16) and 0xFF
            var green = (pixel shr 8) and 0xFF
            var blue = pixel and 0xFF
            
            // Aumentar contraste
            red = ((red - 128) * 1.2f + 128).coerceIn(0f, 255f).toInt()
            green = ((green - 128) * 1.2f + 128).coerceIn(0f, 255f).toInt()
            blue = ((blue - 128) * 1.2f + 128).coerceIn(0f, 255f).toInt()
            
            pixels[i] = (alpha shl 24) or (red shl 16) or (green shl 8) or blue
        }
        
        enhanced.setPixels(pixels, 0, width, 0, 0, width, height)
        return enhanced
    }
    
    /**
     * Correção básica de perspectiva (simulação - OpenCV seria melhor)
     */
    private fun correctPerspective(bitmap: Bitmap): Bitmap {
        // Implementação básica - em produção usaria OpenCV
        // Por agora, aplica rotação se necessário e redimensiona
        
        val width = bitmap.width
        val height = bitmap.height
        
        // Se a imagem for muito larga, pode estar na horizontal
        if (width > height * 1.5) {
            // Rotacionar 90 graus
            val matrix = Matrix()
            matrix.postRotate(90f)
            return Bitmap.createBitmap(bitmap, 0, 0, width, height, matrix, true)
        }
        
        return bitmap
    }    
    /**
     * Aplica filtros para documentos (preto e branco, melhoria de contraste)
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
            
            // Converter para escala de cinza
            val gray = (red * 0.299 + green * 0.587 + blue * 0.114).toInt()
            
            // Aplicar threshold para preto e branco (melhora legibilidade)
            val bw = if (gray > 128) 255 else 0
            
            pixels[i] = (alpha shl 24) or (bw shl 16) or (bw shl 8) or bw
        }
        
        filtered.setPixels(pixels, 0, width, 0, 0, width, height)
        return filtered
    }
}

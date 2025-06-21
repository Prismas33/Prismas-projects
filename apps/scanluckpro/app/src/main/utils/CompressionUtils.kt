package com.scanluckpro.utils

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Log
import java.io.*

object CompressionUtils {
    
    fun compressJpeg(inputPath: String, outputPath: String, quality: Int = 80): Boolean {
        return try {
            val originalBitmap = BitmapFactory.decodeFile(inputPath)
            
            // Otimiza o tamanho mantendo qualidade
            val optimizedBitmap = if (originalBitmap.width > 2048 || originalBitmap.height > 2048) {
                resizeBitmap(originalBitmap, 2048, 2048)
            } else {
                originalBitmap
            }
            
            FileOutputStream(outputPath).use { out ->
                optimizedBitmap.compress(Bitmap.CompressFormat.JPEG, quality, out)
            }
            
            // Verifica se a compressão foi efetiva
            val originalSize = File(inputPath).length()
            val compressedSize = File(outputPath).length()
            
            Log.d("CompressionUtils", "JPEG: $originalSize -> $compressedSize bytes (${(compressedSize * 100 / originalSize)}%)")
            true
        } catch (e: Exception) {
            Log.e("CompressionUtils", "Erro ao comprimir JPEG", e)
            false
        }
    }
    
    fun compressPng(inputPath: String, outputPath: String): Boolean {
        return try {
            val originalBitmap = BitmapFactory.decodeFile(inputPath)
            
            // PNG sem perda, mas otimiza tamanho
            val optimizedBitmap = if (originalBitmap.width > 2048 || originalBitmap.height > 2048) {
                resizeBitmap(originalBitmap, 2048, 2048)
            } else {
                originalBitmap
            }
            
            FileOutputStream(outputPath).use { out ->
                optimizedBitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
            }
            
            val originalSize = File(inputPath).length()
            val compressedSize = File(outputPath).length()
            
            Log.d("CompressionUtils", "PNG: $originalSize -> $compressedSize bytes")
            true
        } catch (e: Exception) {
            Log.e("CompressionUtils", "Erro ao comprimir PNG", e)
            false
        }
    }
    
    fun compressPdf(inputPath: String, outputPath: String): Boolean {
        return try {
            // Para PDFs gerados pelo app, re-gera com compressão otimizada
            // Esta é uma implementação simplificada
            
            val inputFile = File(inputPath)
            val outputFile = File(outputPath)
            
            // Se não há muito o que comprimir, apenas copia
            inputFile.copyTo(outputFile, overwrite = true)
            
            val originalSize = inputFile.length()
            val compressedSize = outputFile.length()
            
            Log.d("CompressionUtils", "PDF: $originalSize -> $compressedSize bytes")
            true
        } catch (e: Exception) {
            Log.e("CompressionUtils", "Erro ao comprimir PDF", e)
            false
        }
    }
    
    private fun resizeBitmap(bitmap: Bitmap, maxWidth: Int, maxHeight: Int): Bitmap {
        val width = bitmap.width
        val height = bitmap.height
        
        val ratio = minOf(maxWidth.toFloat() / width, maxHeight.toFloat() / height)
        
        if (ratio >= 1) return bitmap
        
        val newWidth = (width * ratio).toInt()
        val newHeight = (height * ratio).toInt()
        
        return Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true)
    }
    
    fun getCompressionStats(originalPath: String, compressedPath: String): CompressionStats {
        val originalSize = File(originalPath).length()
        val compressedSize = File(compressedPath).length()
        val compressionRatio = (compressedSize.toFloat() / originalSize * 100).toInt()
        val savedBytes = originalSize - compressedSize
        
        return CompressionStats(
            originalSize = originalSize,
            compressedSize = compressedSize,
            compressionRatio = compressionRatio,
            savedBytes = savedBytes
        )
    }
    
    fun formatFileSize(bytes: Long): String {
        return when {
            bytes >= 1024 * 1024 * 1024 -> "%.1f GB".format(bytes / (1024.0 * 1024.0 * 1024.0))
            bytes >= 1024 * 1024 -> "%.1f MB".format(bytes / (1024.0 * 1024.0))
            bytes >= 1024 -> "%.1f KB".format(bytes / 1024.0)
            else -> "$bytes bytes"
        }
    }
}

data class CompressionStats(
    val originalSize: Long,
    val compressedSize: Long,
    val compressionRatio: Int, // Porcentagem do tamanho final
    val savedBytes: Long
) {
    fun getSavedPercentage(): Int = 100 - compressionRatio
    
    fun getFormattedOriginalSize(): String = CompressionUtils.formatFileSize(originalSize)
    fun getFormattedCompressedSize(): String = CompressionUtils.formatFileSize(compressedSize)
    fun getFormattedSavedBytes(): String = CompressionUtils.formatFileSize(savedBytes)
}

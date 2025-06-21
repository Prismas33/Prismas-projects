package com.scanluckpro.ml

import android.content.Context
import android.graphics.Bitmap
import android.util.Log
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import com.google.mlkit.vision.text.chinese.ChineseTextRecognizerOptions
import com.google.mlkit.vision.text.devanagari.DevanagariTextRecognizerOptions
import com.google.mlkit.vision.text.japanese.JapaneseTextRecognizerOptions
import com.google.mlkit.vision.text.korean.KoreanTextRecognizerOptions
import kotlinx.coroutines.tasks.await

object OcrProcessor {
    
    enum class LanguageMode {
        LATIN, CHINESE, DEVANAGARI, JAPANESE, KOREAN
    }
    
    suspend fun recognizeText(
        context: Context, 
        bitmap: Bitmap, 
        language: LanguageMode = LanguageMode.LATIN
    ): OcrResult {
        val image = InputImage.fromBitmap(bitmap, 0)
        
        val recognizer = when (language) {
            LanguageMode.LATIN -> TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
            LanguageMode.CHINESE -> TextRecognition.getClient(ChineseTextRecognizerOptions.Builder().build())
            LanguageMode.DEVANAGARI -> TextRecognition.getClient(DevanagariTextRecognizerOptions.Builder().build())
            LanguageMode.JAPANESE -> TextRecognition.getClient(JapaneseTextRecognizerOptions.Builder().build())
            LanguageMode.KOREAN -> TextRecognition.getClient(KoreanTextRecognizerOptions.Builder().build())
        }
        
        return try {
            val result = recognizer.process(image).await()
            val blocks = result.textBlocks.map { block ->
                TextBlock(
                    text = block.text,
                    boundingBox = block.boundingBox,
                    confidence = block.confidence ?: 0f,
                    lines = block.lines.map { line ->
                        TextLine(
                            text = line.text,
                            boundingBox = line.boundingBox,
                            confidence = line.confidence ?: 0f
                        )
                    }
                )
            }
            
            OcrResult(
                fullText = result.text,
                textBlocks = blocks,
                isSuccess = true,
                language = language
            )
        } catch (e: Exception) {
            Log.e("OcrProcessor", "OCR failed", e)
            OcrResult(
                fullText = "",
                textBlocks = emptyList(),
                isSuccess = false,
                language = language,
                error = e.message
            )
        }
    }
    
    suspend fun detectLanguage(context: Context, bitmap: Bitmap): LanguageMode {
        // Simples detecção de idioma baseada em caracteres
        val latinResult = recognizeText(context, bitmap, LanguageMode.LATIN)
        
        return when {
            latinResult.fullText.any { it in '\u4e00'..'\u9fff' } -> LanguageMode.CHINESE
            latinResult.fullText.any { it in '\u3040'..'\u309f' || it in '\u30a0'..'\u30ff' } -> LanguageMode.JAPANESE
            latinResult.fullText.any { it in '\uac00'..'\ud7af' } -> LanguageMode.KOREAN
            latinResult.fullText.any { it in '\u0900'..'\u097f' } -> LanguageMode.DEVANAGARI
            else -> LanguageMode.LATIN
        }
    }
}

data class OcrResult(
    val fullText: String,
    val textBlocks: List<TextBlock>,
    val isSuccess: Boolean,
    val language: OcrProcessor.LanguageMode,
    val error: String? = null
)

data class TextBlock(
    val text: String,
    val boundingBox: android.graphics.Rect?,
    val confidence: Float,
    val lines: List<TextLine>
)

data class TextLine(
    val text: String,
    val boundingBox: android.graphics.Rect?,
    val confidence: Float
)

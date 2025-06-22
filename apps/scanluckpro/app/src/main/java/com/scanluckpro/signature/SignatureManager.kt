package com.scanluckpro.signature

import android.content.Context
import android.graphics.*
import android.util.Log
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Done
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.io.File
import java.io.FileOutputStream
import java.security.MessageDigest
import java.text.SimpleDateFormat
import java.util.*

/**
 * Dados da assinatura digital
 */
data class DigitalSignature(
    val id: String,
    val bitmap: Bitmap,
    val metadata: SignatureMetadata,
    val filePath: String
)

/**
 * Metadados da assinatura
 */
data class SignatureMetadata(
    val signerName: String,
    val timestamp: Long,
    val hash: String,
    val deviceInfo: String
)

/**
 * Resultado da validação da assinatura
 */
data class ValidationResult(
    val isValid: Boolean,
    val signerName: String,
    val timestamp: Long,
    val deviceInfo: String,
    val message: String
)

/**
 * Posição da assinatura no documento
 */
data class SignaturePosition(
    val horizontal: HorizontalPosition,
    val vertical: VerticalPosition
)

enum class HorizontalPosition { LEFT, CENTER, RIGHT }
enum class VerticalPosition { TOP, CENTER, BOTTOM }

/**
 * Resultado da operação de assinatura
 */
sealed class SignatureResult {
    data class Success(val signature: DigitalSignature) : SignatureResult()
    data class Error(val message: String) : SignatureResult()
}

/**
 * Gerenciador de assinatura digital
 */
object SignatureManager {
    
    /**
     * Cria uma nova assinatura
     */
    fun createSignature(
        context: Context,
        signaturePaths: List<List<Offset>>,
        signerName: String
    ): SignatureResult {
        return try {
            val bitmap = generateSignatureBitmap(signaturePaths)
            val metadata = SignatureMetadata(
                signerName = signerName,
                timestamp = System.currentTimeMillis(),
                hash = generateSignatureHash(bitmap),
                deviceInfo = getDeviceInfo()
            )
            
            val file = saveSignatureToFile(context, bitmap, metadata)
            val signature = DigitalSignature(
                id = UUID.randomUUID().toString(),
                bitmap = bitmap,
                metadata = metadata,
                filePath = file.absolutePath
            )
            
            SignatureResult.Success(signature)
        } catch (e: Exception) {
            Log.e("SignatureManager", "Erro ao criar assinatura: ${e.message}")
            SignatureResult.Error("Erro ao criar assinatura: ${e.message}")
        }
    }
    
    private fun generateSignatureBitmap(paths: List<List<Offset>>): Bitmap {
        val width = 400
        val height = 200
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        
        canvas.drawColor(android.graphics.Color.TRANSPARENT)
        
        val paint = Paint().apply {
            color = android.graphics.Color.BLACK
            strokeWidth = 3f
            style = Paint.Style.STROKE
            strokeCap = Paint.Cap.ROUND
            isAntiAlias = true
        }
        
        paths.forEach { path ->
            if (path.size > 1) {
                for (i in 1 until path.size) {
                    canvas.drawLine(
                        path[i - 1].x, path[i - 1].y,
                        path[i].x, path[i].y,
                        paint
                    )
                }
            }
        }
        
        return bitmap
    }
    
    private fun generateSignatureHash(bitmap: Bitmap): String {
        val stream = java.io.ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
        val bytes = stream.toByteArray()
        
        val digest = MessageDigest.getInstance("SHA-256")
        val hashBytes = digest.digest(bytes)
        
        return hashBytes.joinToString("") { "%02x".format(it) }
    }
    
    private fun saveSignatureToFile(
        context: Context,
        bitmap: Bitmap,
        metadata: SignatureMetadata
    ): File {
        val signatureDir = File(context.getExternalFilesDir(null), "ScanLuckPro/signatures")
        if (!signatureDir.exists()) {
            signatureDir.mkdirs()
        }
        
        val fileName = "signature_${System.currentTimeMillis()}.png"
        val file = File(signatureDir, fileName)
        
        FileOutputStream(file).use { out ->
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
        }
        
        return file
    }
    
    private fun getDeviceInfo(): String {
        return "${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL}"
    }
    
    /**
     * Dialog para captura de assinatura
     */
    @OptIn(ExperimentalMaterial3Api::class)
    @Composable
    fun SignatureDialog(
        onSignatureComplete: (List<List<Offset>>, String) -> Unit,
        onDismiss: () -> Unit
    ) {
        var signerName by remember { mutableStateOf("") }
        var signaturePaths by remember { mutableStateOf(listOf<List<Offset>>()) }
        var currentPath by remember { mutableStateOf(listOf<Offset>()) }
        
        AlertDialog(
            onDismissRequest = onDismiss,
            title = { Text("Assinatura Digital") },
            text = {
                Column {
                    OutlinedTextField(
                        value = signerName,
                        onValueChange = { signerName = it },
                        label = { Text("Nome do signatário") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    Spacer(Modifier.height(16.dp))
                    Text("Desenhe sua assinatura:")
                    Spacer(Modifier.height(8.dp))
                    
                    Card(
                        modifier = Modifier.fillMaxWidth().height(120.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Canvas(
                            modifier = Modifier
                                .fillMaxSize()
                                .pointerInput(Unit) {
                                    detectDragGestures(
                                        onDragStart = { offset ->
                                            currentPath = listOf(offset)
                                        },
                                        onDrag = { _, dragAmount ->
                                            currentPath = currentPath + (currentPath.lastOrNull()?.plus(dragAmount) ?: Offset.Zero)
                                        },
                                        onDragEnd = {
                                            if (currentPath.isNotEmpty()) {
                                                signaturePaths = signaturePaths + listOf(currentPath)
                                                currentPath = emptyList()
                                            }
                                        }
                                    )
                                }
                        ) {
                            (signaturePaths + if (currentPath.isNotEmpty()) listOf(currentPath) else emptyList()).forEach { path ->
                                if (path.size > 1) {
                                    for (i in 0 until path.size - 1) {
                                        drawLine(
                                            color = Color.Black,
                                            start = path[i],
                                            end = path[i + 1],
                                            strokeWidth = 3.dp.toPx(),
                                            cap = StrokeCap.Round
                                        )
                                    }
                                }
                            }
                        }
                    }
                    
                    TextButton(
                        onClick = {
                            signaturePaths = emptyList()
                            currentPath = emptyList()
                        }
                    ) {
                        Text("Limpar")
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (signerName.isNotBlank() && signaturePaths.isNotEmpty()) {
                            onSignatureComplete(signaturePaths, signerName)
                        }
                    },
                    enabled = signerName.isNotBlank() && signaturePaths.isNotEmpty()
                ) {
                    Text("Assinar")
                }
            },
            dismissButton = {
                TextButton(onClick = onDismiss) {
                    Text("Cancelar")
                }
            }
        )
    }
}

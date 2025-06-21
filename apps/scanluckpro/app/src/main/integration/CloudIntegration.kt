package com.scanluckpro.integration

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.io.IOException

object CloudIntegration {
    
    private val client = OkHttpClient()
    
    // Google Drive Integration
    suspend fun uploadToDrive(context: Context, filePath: String, fileName: String): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                // Usar Intent para compartilhar com Google Drive
                val file = File(filePath)
                val uri = Uri.fromFile(file)
                
                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = when (file.extension.lowercase()) {
                        "pdf" -> "application/pdf"
                        "jpg", "jpeg" -> "image/jpeg"
                        "png" -> "image/png"
                        "txt" -> "text/plain"
                        else -> "*/*"
                    }
                    putExtra(Intent.EXTRA_STREAM, uri)
                    putExtra(Intent.EXTRA_SUBJECT, fileName)
                    setPackage("com.google.android.apps.docs") // Google Drive package
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                
                context.startActivity(intent)
                true
            } catch (e: Exception) {
                Log.e("CloudIntegration", "Erro ao enviar para Drive", e)
                false
            }
        }
    }
    
    // Dropbox Integration
    suspend fun uploadToDropbox(context: Context, filePath: String, fileName: String): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val file = File(filePath)
                val uri = Uri.fromFile(file)
                
                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = when (file.extension.lowercase()) {
                        "pdf" -> "application/pdf"
                        "jpg", "jpeg" -> "image/jpeg"
                        "png" -> "image/png"
                        "txt" -> "text/plain"
                        else -> "*/*"
                    }
                    putExtra(Intent.EXTRA_STREAM, uri)
                    putExtra(Intent.EXTRA_SUBJECT, fileName)
                    setPackage("com.dropbox.android") // Dropbox package
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                
                context.startActivity(intent)
                true
            } catch (e: Exception) {
                Log.e("CloudIntegration", "Erro ao enviar para Dropbox", e)
                false
            }
        }
    }
    
    // Webhook para automações (Zapier/IFTTT)
    suspend fun sendWebhook(
        url: String, 
        payload: WebhookPayload
    ): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val json = """
                    {
                        "event": "${payload.event}",
                        "timestamp": ${payload.timestamp},
                        "document": {
                            "name": "${payload.documentName}",
                            "pages": ${payload.pageCount},
                            "ocrText": "${payload.ocrText.take(500)}", // Limita texto
                            "format": "${payload.format}"
                        },
                        "metadata": {
                            "appVersion": "1.0",
                            "deviceModel": "${android.os.Build.MODEL}",
                            "userId": "${payload.userId}"
                        }
                    }
                """.trimIndent()
                
                val requestBody = RequestBody.create(
                    "application/json".toMediaType(),
                    json
                )
                
                val request = Request.Builder()
                    .url(url)
                    .post(requestBody)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("User-Agent", "ScanLuckPro/1.0")
                    .build()
                
                val response = client.newCall(request).execute()
                response.isSuccessful
            } catch (e: Exception) {
                Log.e("CloudIntegration", "Erro ao enviar webhook", e)
                false
            }
        }
    }
    
    // Compartilhamento nativo (WhatsApp, Gmail, etc.)
    fun shareViaIntent(context: Context, filePath: String, fileName: String, appPackage: String? = null) {
        try {
            val file = File(filePath)
            val uri = Uri.fromFile(file)
            
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = when (file.extension.lowercase()) {
                    "pdf" -> "application/pdf"
                    "jpg", "jpeg" -> "image/jpeg"
                    "png" -> "image/png"
                    "txt" -> "text/plain"
                    else -> "*/*"
                }
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_SUBJECT, fileName)
                putExtra(Intent.EXTRA_TEXT, "Documento escaneado com ScanLuck Pro")
                
                appPackage?.let { setPackage(it) }
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            
            val chooser = Intent.createChooser(intent, "Compartilhar documento")
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(chooser)
        } catch (e: Exception) {
            Log.e("CloudIntegration", "Erro ao compartilhar", e)
        }
    }
    
    // Envio por email direto
    fun shareViaEmail(context: Context, filePath: String, fileName: String, emailTo: String = "") {
        try {
            val file = File(filePath)
            val uri = Uri.fromFile(file)
            
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = when (file.extension.lowercase()) {
                    "pdf" -> "application/pdf"
                    "jpg", "jpeg" -> "image/jpeg"
                    "png" -> "image/png"
                    "txt" -> "text/plain"
                    else -> "*/*"
                }
                putExtra(Intent.EXTRA_EMAIL, arrayOf(emailTo))
                putExtra(Intent.EXTRA_SUBJECT, "Documento: $fileName")
                putExtra(Intent.EXTRA_TEXT, "Documento escaneado com ScanLuck Pro.\n\nEnviado de forma segura e privada.")
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            
            context.startActivity(Intent.createChooser(intent, "Enviar por email"))
        } catch (e: Exception) {
            Log.e("CloudIntegration", "Erro ao enviar email", e)
        }
    }
    
    // WhatsApp direto
    fun shareViaWhatsApp(context: Context, filePath: String, fileName: String) {
        shareViaIntent(context, filePath, fileName, "com.whatsapp")
    }
    
    // Telegram direto
    fun shareViaTelegram(context: Context, filePath: String, fileName: String) {
        shareViaIntent(context, filePath, fileName, "org.telegram.messenger")
    }
}

data class WebhookPayload(
    val event: String, // "document_created", "document_exported", etc.
    val timestamp: Long,
    val documentName: String,
    val pageCount: Int,
    val ocrText: String,
    val format: String, // "PDF", "JPEG", "TXT"
    val userId: String
)

object IntegrationPresets {
    // Zapier presets
    const val ZAPIER_GOOGLE_SHEETS = "document_to_sheets"
    const val ZAPIER_SLACK = "document_to_slack"
    const val ZAPIER_NOTION = "document_to_notion"
    
    // IFTTT presets
    const val IFTTT_EMAIL = "document_to_email"
    const val IFTTT_DRIVE = "document_to_drive"
    const val IFTTT_EVERNOTE = "document_to_evernote"
}

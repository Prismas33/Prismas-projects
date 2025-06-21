package com.scanluckpro.ml

import android.content.Context
import android.graphics.Bitmap
import android.util.Log
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import kotlinx.coroutines.tasks.await

object BarcodeProcessor {
    
    suspend fun scanBarcodes(context: Context, bitmap: Bitmap): List<BarcodeResult> {
        return try {
            val image = InputImage.fromBitmap(bitmap, 0)
            val scanner = BarcodeScanning.getClient()
            val result = scanner.process(image).await()
            
            result.map { barcode ->
                BarcodeResult(
                    rawValue = barcode.rawValue ?: "",
                    displayValue = barcode.displayValue ?: "",
                    format = getBarcodeFormat(barcode.format),
                    valueType = getBarcodeValueType(barcode.valueType),
                    boundingBox = barcode.boundingBox,
                    cornerPoints = barcode.cornerPoints?.toList() ?: emptyList(),
                    email = barcode.email?.let {
                        EmailInfo(
                            address = it.address ?: "",
                            subject = it.subject ?: "",
                            body = it.body ?: ""
                        )
                    },
                    phone = barcode.phone?.let {
                        PhoneInfo(
                            number = it.number ?: "",
                            type = it.type
                        )
                    },
                    url = barcode.url?.let {
                        UrlInfo(
                            title = it.title ?: "",
                            url = it.url ?: ""
                        )
                    },
                    wifi = barcode.wifi?.let {
                        WifiInfo(
                            ssid = it.ssid ?: "",
                            password = it.password ?: "",
                            encryptionType = it.encryptionType
                        )
                    },
                    contactInfo = barcode.contactInfo?.let {
                        ContactInfo(
                            name = "${it.name?.first ?: ""} ${it.name?.last ?: ""}".trim(),
                            organization = it.organization ?: "",
                            phones = it.phones?.map { phone -> phone.number ?: "" } ?: emptyList(),
                            emails = it.emails?.map { email -> email.address ?: "" } ?: emptyList(),
                            urls = it.urls ?: emptyList()
                        )
                    }
                )
            }
        } catch (e: Exception) {
            Log.e("BarcodeProcessor", "Erro ao escanear códigos", e)
            emptyList()
        }
    }
    
    private fun getBarcodeFormat(format: Int): String {
        return when (format) {
            Barcode.FORMAT_QR_CODE -> "QR Code"
            Barcode.FORMAT_CODE_128 -> "Code 128"
            Barcode.FORMAT_CODE_39 -> "Code 39"
            Barcode.FORMAT_CODE_93 -> "Code 93"
            Barcode.FORMAT_CODABAR -> "Codabar"
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
    
    private fun getBarcodeValueType(valueType: Int): String {
        return when (valueType) {
            Barcode.TYPE_CONTACT_INFO -> "Contato"
            Barcode.TYPE_EMAIL -> "Email"
            Barcode.TYPE_ISBN -> "ISBN"
            Barcode.TYPE_PHONE -> "Telefone"
            Barcode.TYPE_PRODUCT -> "Produto"
            Barcode.TYPE_SMS -> "SMS"
            Barcode.TYPE_TEXT -> "Texto"
            Barcode.TYPE_URL -> "URL"
            Barcode.TYPE_WIFI -> "WiFi"
            Barcode.TYPE_GEO -> "Localização"
            Barcode.TYPE_CALENDAR_EVENT -> "Evento"
            Barcode.TYPE_DRIVER_LICENSE -> "CNH"
            else -> "Outro"
        }
    }
}

data class BarcodeResult(
    val rawValue: String,
    val displayValue: String,
    val format: String,
    val valueType: String,
    val boundingBox: android.graphics.Rect?,
    val cornerPoints: List<android.graphics.Point>,
    val email: EmailInfo? = null,
    val phone: PhoneInfo? = null,
    val url: UrlInfo? = null,
    val wifi: WifiInfo? = null,
    val contactInfo: ContactInfo? = null
)

data class EmailInfo(
    val address: String,
    val subject: String,
    val body: String
)

data class PhoneInfo(
    val number: String,
    val type: Int
)

data class UrlInfo(
    val title: String,
    val url: String
)

data class WifiInfo(
    val ssid: String,
    val password: String,
    val encryptionType: Int
)

data class ContactInfo(
    val name: String,
    val organization: String,
    val phones: List<String>,
    val emails: List<String>,
    val urls: List<String>
)

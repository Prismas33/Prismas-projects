package com.scanluckpro.security

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.IvParameterSpec

object EncryptionHelper {
    
    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val KEY_ALIAS = "ScanLuckProKey"
    private const val TRANSFORMATION = "AES/CBC/PKCS7Padding"
    
    init {
        generateSecretKey()
    }
    
    private fun generateSecretKey() {
        val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
        val keyGenParameterSpec = KeyGenParameterSpec.Builder(
            KEY_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_CBC)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_PKCS7)
            .setUserAuthenticationRequired(false)
            .build()
        
        keyGenerator.init(keyGenParameterSpec)
        keyGenerator.generateKey()
    }
    
    private fun getSecretKey(): SecretKey {
        val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE)
        keyStore.load(null)
        
        return keyStore.getKey(KEY_ALIAS, null) as SecretKey
    }
    
    fun encrypt(data: String): EncryptedData {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, getSecretKey())
        
        val iv = cipher.iv
        val encryptedBytes = cipher.doFinal(data.toByteArray())
        
        return EncryptedData(
            encryptedData = Base64.encodeToString(encryptedBytes, Base64.DEFAULT),
            iv = Base64.encodeToString(iv, Base64.DEFAULT)
        )
    }
    
    fun decrypt(encryptedData: EncryptedData): String {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        val iv = Base64.decode(encryptedData.iv, Base64.DEFAULT)
        cipher.init(Cipher.DECRYPT_MODE, getSecretKey(), IvParameterSpec(iv))
        
        val encryptedBytes = Base64.decode(encryptedData.encryptedData, Base64.DEFAULT)
        val decryptedBytes = cipher.doFinal(encryptedBytes)
        
        return String(decryptedBytes)
    }
    
    fun encryptFile(filePath: String): String {
        val fileContent = java.io.File(filePath).readText()
        val encrypted = encrypt(fileContent)
        
        // Salva arquivo criptografado
        val encryptedFilePath = "$filePath.encrypted"
        java.io.File(encryptedFilePath).writeText("${encrypted.iv}:${encrypted.encryptedData}")
        
        return encryptedFilePath
    }
    
    fun decryptFile(encryptedFilePath: String): String {
        val encryptedContent = java.io.File(encryptedFilePath).readText()
        val parts = encryptedContent.split(":")
        
        if (parts.size != 2) throw IllegalArgumentException("Formato de arquivo inválido")
        
        val encryptedData = EncryptedData(
            encryptedData = parts[1],
            iv = parts[0]
        )
        
        return decrypt(encryptedData)
    }
}

data class EncryptedData(
    val encryptedData: String,
    val iv: String
)

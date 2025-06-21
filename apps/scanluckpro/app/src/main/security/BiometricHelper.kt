package com.scanluckpro.security

import android.content.Context
import android.os.Build
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import java.util.concurrent.Executor

object BiometricHelper {
    
    fun isBiometricAvailable(context: Context): BiometricAvailability {
        val biometricManager = BiometricManager.from(context)
        return when (biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)) {
            BiometricManager.BIOMETRIC_SUCCESS -> BiometricAvailability.AVAILABLE
            BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> BiometricAvailability.NO_HARDWARE
            BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE -> BiometricAvailability.HARDWARE_UNAVAILABLE
            BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> BiometricAvailability.NONE_ENROLLED
            BiometricManager.BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED -> BiometricAvailability.SECURITY_UPDATE_REQUIRED
            BiometricManager.BIOMETRIC_ERROR_UNSUPPORTED -> BiometricAvailability.UNSUPPORTED
            BiometricManager.BIOMETRIC_STATUS_UNKNOWN -> BiometricAvailability.UNKNOWN
            else -> BiometricAvailability.UNKNOWN
        }
    }
    
    fun createBiometricPrompt(
        activity: FragmentActivity,
        onSuccess: () -> Unit,
        onError: (String) -> Unit,
        onFailed: () -> Unit
    ): BiometricPrompt {
        val executor: Executor = ContextCompat.getMainExecutor(activity)
        
        val biometricPrompt = BiometricPrompt(activity, executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    onError("Erro de autenticação: $errString")
                }
                
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    onSuccess()
                }
                
                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                    onFailed()
                }
            })
        
        return biometricPrompt
    }
    
    fun createPromptInfo(
        title: String = "Autenticação Biométrica",
        subtitle: String = "Toque o sensor de impressão digital ou use o reconhecimento facial",
        description: String = "Use sua biometria para acessar o ScanLuck Pro"
    ): BiometricPrompt.PromptInfo {
        return BiometricPrompt.PromptInfo.Builder()
            .setTitle(title)
            .setSubtitle(subtitle)
            .setDescription(description)
            .setNegativeButtonText("Cancelar")
            .build()
    }
    
    fun authenticateWithBiometric(
        activity: FragmentActivity,
        title: String = "Desbloqueio do App",
        onSuccess: () -> Unit,
        onError: (String) -> Unit,
        onFailed: () -> Unit
    ) {
        val availability = isBiometricAvailable(activity)
        
        if (availability != BiometricAvailability.AVAILABLE) {
            onError("Biometria não disponível: ${availability.message}")
            return
        }
        
        val biometricPrompt = createBiometricPrompt(activity, onSuccess, onError, onFailed)
        val promptInfo = createPromptInfo(title)
        
        biometricPrompt.authenticate(promptInfo)
    }
}

enum class BiometricAvailability(val message: String) {
    AVAILABLE("Disponível"),
    NO_HARDWARE("Hardware não disponível"),
    HARDWARE_UNAVAILABLE("Hardware temporariamente indisponível"),
    NONE_ENROLLED("Nenhuma biometria cadastrada"),
    SECURITY_UPDATE_REQUIRED("Atualização de segurança necessária"),
    UNSUPPORTED("Não suportado"),
    UNKNOWN("Status desconhecido")
}

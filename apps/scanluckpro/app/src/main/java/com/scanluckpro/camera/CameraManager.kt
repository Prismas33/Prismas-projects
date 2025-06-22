package com.scanluckpro.camera

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.util.Log
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import kotlinx.coroutines.runBlocking
import java.io.ByteArrayOutputStream
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine

/**
 * Gerenciador da câmera usando CameraX
 * Captura real de imagens com alta qualidade
 */
class CameraManager(private val context: Context) {
    
    private var imageCapture: ImageCapture? = null
    private var preview: Preview? = null
    private var camera: Camera? = null
    private var cameraProvider: ProcessCameraProvider? = null
    private val cameraExecutor: ExecutorService = Executors.newSingleThreadExecutor()
    
    // Variáveis para estabilização
    private var isStable = false
    private var stabilityCallback: ((Boolean) -> Unit)? = null
    
    /**
     * Inicializa a câmera
     */
    suspend fun startCamera(
        lifecycleOwner: LifecycleOwner,
        previewView: androidx.camera.view.PreviewView
    ) = suspendCoroutine { continuation ->
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        
        cameraProviderFuture.addListener({
            try {
                cameraProvider = cameraProviderFuture.get()
                
                // Preview
                preview = Preview.Builder()
                    .setTargetRotation(previewView.display.rotation)
                    .build()
                    .also {
                        it.setSurfaceProvider(previewView.surfaceProvider)
                    }
                  // ImageCapture com alta qualidade + estabilização
                imageCapture = ImageCapture.Builder()
                    .setCaptureMode(ImageCapture.CAPTURE_MODE_MAXIMIZE_QUALITY)
                    .setTargetRotation(previewView.display.rotation)
                    .setJpegQuality(95)
                    .build()
                
                // Configurar estabilização de imagem se disponível
                val imageAnalysis = ImageAnalysis.Builder()
                    .setTargetRotation(previewView.display.rotation)
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()
                
                imageAnalysis.setAnalyzer(cameraExecutor) { imageProxy ->
                    // Análise em tempo real para estabilização
                    analyzeImageStability(imageProxy)
                    imageProxy.close()
                }
                
                // Selecionar câmera traseira
                val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
                  // Unbind e bind novamente
                cameraProvider?.unbindAll()
                camera = cameraProvider?.bindToLifecycle(
                    lifecycleOwner,
                    cameraSelector,
                    preview,
                    imageCapture,
                    imageAnalysis
                )
                
                continuation.resume(Unit)
                
            } catch (exc: Exception) {
                Log.e("CameraManager", "Falha ao iniciar câmera: ${exc.message}")
                continuation.resumeWithException(exc)
            }
        }, ContextCompat.getMainExecutor(context))
    }
    
    /**
     * Captura uma foto e retorna como Bitmap
     */
    suspend fun capturePhoto(): Bitmap = suspendCoroutine { continuation ->
        val imageCapture = imageCapture ?: run {
            continuation.resumeWithException(Exception("ImageCapture não inicializado"))
            return@suspendCoroutine
        }
        
        // Criar buffer para armazenar imagem
        val outputStream = ByteArrayOutputStream()
        val outputFileOptions = ImageCapture.OutputFileOptions.Builder(outputStream).build()
        
        imageCapture.takePicture(
            outputFileOptions,
            ContextCompat.getMainExecutor(context),
            object : ImageCapture.OnImageSavedCallback {
                override fun onError(exception: ImageCaptureException) {
                    Log.e("CameraManager", "Erro na captura: ${exception.message}")
                    continuation.resumeWithException(exception)
                }
                
                override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                    try {
                        val imageBytes = outputStream.toByteArray()
                        val bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
                        
                        // Otimizar orientação
                        val optimizedBitmap = optimizeBitmapOrientation(bitmap)
                        continuation.resume(optimizedBitmap)
                        
                    } catch (e: Exception) {
                        Log.e("CameraManager", "Erro ao processar imagem: ${e.message}")
                        continuation.resumeWithException(e)
                    }
                }
            }
        )
    }
    
    /**
     * Otimiza orientação da imagem
     */
    private fun optimizeBitmapOrientation(bitmap: Bitmap): Bitmap {
        val width = bitmap.width
        val height = bitmap.height
        
        // Se necessário, rotacionar para orientação correta
        return if (width > height) {
            // Imagem landscape, rotacionar para portrait
            val matrix = Matrix()
            matrix.postRotate(90f)
            Bitmap.createBitmap(bitmap, 0, 0, width, height, matrix, true)
        } else {
            bitmap
        }
    }
    
    /**
     * Ativa/desativa flash
     */
    fun toggleFlash(): Boolean {
        return try {
            val currentFlashMode = camera?.cameraInfo?.torchState?.value ?: TorchState.OFF
            val newFlashMode = currentFlashMode == TorchState.OFF
            camera?.cameraControl?.enableTorch(newFlashMode)
            newFlashMode
        } catch (e: Exception) {
            Log.e("CameraManager", "Erro ao alternar flash: ${e.message}")
            false
        }
    }
    
    /**
     * Libera recursos da câmera
     */
    fun shutdown() {
        cameraProvider?.unbindAll()
        cameraExecutor.shutdown()
    }
    
    /**
     * Define callback para estabilidade da câmera
     */
    fun setStabilityCallback(callback: (Boolean) -> Unit) {
        stabilityCallback = callback
    }
    
    /**
     * Analisa estabilidade da imagem em tempo real
     */
    private fun analyzeImageStability(imageProxy: ImageProxy) {
        try {
            val buffer = imageProxy.planes[0].buffer
            val bytes = ByteArray(buffer.remaining())
            buffer.get(bytes)
            
            // Simular análise de estabilidade baseada em variação de pixels
            val variance = calculateImageVariance(bytes)
            val newStability = variance < 1000 // Threshold para estabilidade
            
            if (isStable != newStability) {
                isStable = newStability
                stabilityCallback?.invoke(isStable)
            }
            
        } catch (e: Exception) {
            Log.e("CameraManager", "Erro na análise de estabilidade: ${e.message}")
        }
    }
    
    /**
     * Calcula variância para detectar movimento/instabilidade
     */
    private fun calculateImageVariance(bytes: ByteArray): Double {
        if (bytes.isEmpty()) return 0.0
        
        val mean = bytes.map { it.toInt() and 0xFF }.average()
        return bytes.map { 
            val pixel = it.toInt() and 0xFF
            (pixel - mean) * (pixel - mean)
        }.average()
    }
    
    /**
     * Captura automática quando estável
     */
    suspend fun captureWhenStable(): Bitmap {
        return suspendCoroutine { continuation ->
            if (isStable) {
                // Já está estável, capturar imediatamente
                cameraExecutor.execute {
                    try {
                        val bitmap = runBlocking { capturePhoto() }
                        continuation.resume(bitmap)
                    } catch (e: Exception) {
                        continuation.resumeWithException(e)
                    }
                }
            } else {
                // Aguardar estabilidade
                var isWaiting = true
                setStabilityCallback { stable ->
                    if (stable && isWaiting) {
                        isWaiting = false
                        cameraExecutor.execute {
                            try {
                                val bitmap = runBlocking { capturePhoto() }
                                continuation.resume(bitmap)
                            } catch (e: Exception) {
                                continuation.resumeWithException(e)
                            }
                        }
                    }
                }
            }
        }
    }
}

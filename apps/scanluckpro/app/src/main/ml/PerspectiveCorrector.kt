package com.scanluckpro.ml

import android.graphics.Bitmap
import android.util.Log
import org.opencv.android.Utils
import org.opencv.core.*
import org.opencv.imgproc.Imgproc
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

object PerspectiveCorrector {
    
    fun correctPerspective(bitmap: Bitmap, srcPoints: List<Point>? = null, targetSize: Size? = null): Bitmap {
        return try {
            val mat = Mat()
            Utils.bitmapToMat(bitmap, mat)
            
            // Se não forneceu pontos, detecta automaticamente
            val corners = srcPoints ?: detectDocumentCorners(mat)
            
            if (corners.size != 4) {
                Log.w("PerspectiveCorrector", "Não foi possível detectar 4 cantos")
                return bitmap
            }
            
            // Ordena os pontos: top-left, top-right, bottom-right, bottom-left
            val orderedCorners = orderPoints(corners)
            
            // Define pontos de destino (retângulo)
            val destSize = targetSize ?: calculateDestinationSize(orderedCorners)
            val destPoints = arrayOf(
                Point(0.0, 0.0),
                Point(destSize.width, 0.0),
                Point(destSize.width, destSize.height),
                Point(0.0, destSize.height)
            )
            
            // Matriz de transformação de perspectiva
            val srcMat = MatOfPoint2f(*orderedCorners.toTypedArray())
            val dstMat = MatOfPoint2f(*destPoints)
            val transformMatrix = Imgproc.getPerspectiveTransform(srcMat, dstMat)
            
            // Aplica transformação
            val correctedMat = Mat()
            Imgproc.warpPerspective(
                mat, correctedMat, transformMatrix, 
                Size(destSize.width, destSize.height)
            )
            
            // Converte de volta para Bitmap
            val correctedBitmap = Bitmap.createBitmap(
                destSize.width.toInt(), 
                destSize.height.toInt(), 
                Bitmap.Config.ARGB_8888
            )
            Utils.matToBitmap(correctedMat, correctedBitmap)
            
            correctedBitmap
        } catch (e: Exception) {
            Log.e("PerspectiveCorrector", "Erro na correção de perspectiva", e)
            bitmap
        }
    }
    
    private fun detectDocumentCorners(mat: Mat): List<Point> {
        val gray = Mat()
        val blurred = Mat()
        val edges = Mat()
        
        // Converte para escala de cinza
        Imgproc.cvtColor(mat, gray, Imgproc.COLOR_BGR2GRAY)
        
        // Aplica blur para reduzir ruído
        Imgproc.GaussianBlur(gray, blurred, Size(5.0, 5.0), 0.0)
        
        // Detecta bordas
        Imgproc.Canny(blurred, edges, 75.0, 200.0)
        
        // Encontra contornos
        val contours = mutableListOf<MatOfPoint>()
        Imgproc.findContours(edges, contours, Mat(), Imgproc.RETR_LIST, Imgproc.CHAIN_APPROX_SIMPLE)
        
        // Ordena contornos por área (maior primeiro)
        contours.sortByDescending { Imgproc.contourArea(it) }
        
        // Procura por contorno com 4 lados (documento)
        for (contour in contours.take(5)) {
            val epsilon = 0.02 * Imgproc.arcLength(MatOfPoint2f(*contour.toArray()), true)
            val approx = MatOfPoint2f()
            Imgproc.approxPolyDP(MatOfPoint2f(*contour.toArray()), approx, epsilon, true)
            
            if (approx.total() == 4L) {
                return approx.toArray().map { Point(it.x, it.y) }
            }
        }
        
        // Se não encontrou, usa cantos da imagem
        return listOf(
            Point(0.0, 0.0),
            Point(mat.cols().toDouble(), 0.0),
            Point(mat.cols().toDouble(), mat.rows().toDouble()),
            Point(0.0, mat.rows().toDouble())
        )
    }
    
    private fun orderPoints(points: List<Point>): List<Point> {
        // Ordena pontos: top-left, top-right, bottom-right, bottom-left
        val sorted = points.sortedWith(compareBy({ it.y }, { it.x }))
        
        val topLeft = sorted[0]
        val topRight = if (sorted[1].x > sorted[2].x) sorted[1] else sorted[2]
        val bottomRight = sorted[3]
        val bottomLeft = if (sorted[1].x < sorted[2].x) sorted[1] else sorted[2]
        
        return listOf(topLeft, topRight, bottomRight, bottomLeft)
    }
    
    private fun calculateDestinationSize(corners: List<Point>): Size {
        val widthTop = distance(corners[0], corners[1])
        val widthBottom = distance(corners[2], corners[3])
        val heightLeft = distance(corners[0], corners[3])
        val heightRight = distance(corners[1], corners[2])
        
        val maxWidth = max(widthTop, widthBottom)
        val maxHeight = max(heightLeft, heightRight)
        
        return Size(maxWidth, maxHeight)
    }
    
    private fun distance(p1: Point, p2: Point): Double {
        return sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y))
    }
}

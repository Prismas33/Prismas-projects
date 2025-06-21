package com.scanluckpro.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import kotlin.math.abs

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SignaturePad(
    onSignatureDone: (SignatureData) -> Unit,
    onCancel: () -> Unit = {}
) {
    var pathPoints by remember { mutableStateOf(listOf<List<Offset>>()) }
    var currentPath by remember { mutableStateOf(listOf<Offset>()) }
    var isDrawing by remember { mutableStateOf(false) }
    var strokeWidth by remember { mutableStateOf(5f) }
    var strokeColor by remember { mutableStateOf(Color.Black) }
    
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        // Título
        Text(
            text = "Desenhe sua assinatura",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        // Controles de pincel
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Espessura:")
            Slider(
                value = strokeWidth,
                onValueChange = { strokeWidth = it },
                valueRange = 2f..10f,
                modifier = Modifier.weight(1f).padding(horizontal = 8.dp)
            )
            Text("${strokeWidth.toInt()}px")
        }
        
        // Área de desenho
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(300.dp)
                .clip(RoundedCornerShape(8.dp))
                .border(2.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
                .background(Color.White)
                .pointerInput(Unit) {
                    detectDragGestures(
                        onDragStart = { offset ->
                            isDrawing = true
                            currentPath = listOf(offset)
                        },
                        onDragEnd = {
                            if (currentPath.isNotEmpty()) {
                                pathPoints = pathPoints + listOf(currentPath)
                            }
                            currentPath = emptyList()
                            isDrawing = false
                        }
                    ) { change, _ ->
                        currentPath = currentPath + change.position
                    }
                }
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                // Desenha caminhos salvos
                pathPoints.forEach { path ->
                    if (path.size > 1) {
                        val pathToDraw = Path().apply {
                            moveTo(path[0].x, path[0].y)
                            for (i in 1 until path.size) {
                                lineTo(path[i].x, path[i].y)
                            }
                        }
                        drawPath(
                            path = pathToDraw,
                            color = strokeColor,
                            style = Stroke(width = strokeWidth, cap = StrokeCap.Round, join = StrokeJoin.Round)
                        )
                    }
                }
                
                // Desenha caminho atual
                if (currentPath.size > 1) {
                    val pathToDraw = Path().apply {
                        moveTo(currentPath[0].x, currentPath[0].y)
                        for (i in 1 until currentPath.size) {
                            lineTo(currentPath[i].x, currentPath[i].y)
                        }
                    }
                    drawPath(
                        path = pathToDraw,
                        color = strokeColor,
                        style = Stroke(width = strokeWidth, cap = StrokeCap.Round, join = StrokeJoin.Round)
                    )
                }
            }
            
            // Texto de ajuda quando vazio
            if (pathPoints.isEmpty() && currentPath.isEmpty()) {
                Text(
                    text = "Toque e arraste para desenhar sua assinatura",
                    color = Color.Gray,
                    modifier = Modifier.align(Alignment.Center)
                )
            }
        }
        
        // Botões de ação
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            OutlinedButton(
                onClick = {
                    pathPoints = emptyList()
                    currentPath = emptyList()
                },
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Clear, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Limpar")
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Button(
                onClick = {
                    if (pathPoints.isNotEmpty()) {
                        val signatureData = SignatureData(
                            paths = pathPoints,
                            strokeWidth = strokeWidth,
                            strokeColor = strokeColor,
                            canvasSize = Offset(300f, 300f) // Tamanho fixo por simplicidade
                        )
                        onSignatureDone(signatureData)
                    }
                },
                enabled = pathPoints.isNotEmpty(),
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Save, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Salvar")
            }
        }
        
        // Botão cancelar
        TextButton(
            onClick = onCancel,
            modifier = Modifier.align(Alignment.CenterHorizontally)
        ) {
            Text("Cancelar")
        }
    }
}

data class SignatureData(
    val paths: List<List<Offset>>,
    val strokeWidth: Float,
    val strokeColor: Color,
    val canvasSize: Offset
) {
    fun toSvgString(): String {
        val width = canvasSize.x.toInt()
        val height = canvasSize.y.toInt()
        
        val pathStrings = paths.map { path ->
            if (path.isNotEmpty()) {
                val pathData = buildString {
                    append("M${path[0].x},${path[0].y}")
                    for (i in 1 until path.size) {
                        append(" L${path[i].x},${path[i].y}")
                    }
                }
                """<path d="$pathData" stroke="black" stroke-width="$strokeWidth" fill="none" stroke-linecap="round" stroke-linejoin="round"/>"""
            } else ""
        }.joinToString("\n")
        
        return """
            <?xml version="1.0" encoding="UTF-8"?>
            <svg width="$width" height="$height" xmlns="http://www.w3.org/2000/svg">
                $pathStrings
            </svg>
        """.trimIndent()
    }
}

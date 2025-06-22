package com.scanluckpro.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ViewModule
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.scanluckpro.batch.TurboBatchScanManager
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BatchScanScreen(navController: NavHostController) {
    val batchManager = remember { TurboBatchScanManager() }
    var isProcessing by remember { mutableStateOf(false) }
    var processedCount by remember { mutableStateOf(0) }
    val coroutineScope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Modo Lote Turbo", fontWeight = FontWeight.Bold, fontSize = 22.sp) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ViewModule, contentDescription = "Voltar")
                    }
                }
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.Top,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(24.dp))
            Text("Processamento em lote de documentos com IA turbo.", color = Color.Gray, fontSize = 16.sp)
            Spacer(Modifier.height(16.dp))
            Text("Páginas processadas: $processedCount", fontWeight = FontWeight.SemiBold)
            Text("Status: ${if (isProcessing) "Processando..." else "Pronto"}", color = if (isProcessing) MaterialTheme.colorScheme.primary else Color.Gray)
            Spacer(Modifier.height(24.dp))
            Button(
                onClick = {
                    isProcessing = true
                    processedCount = 0
                    coroutineScope.launch {                        // Implementar simulação de escaneamento em lote
                        val total = 10 // Simular processamento de 10 documentos
                        processedCount = total
                        isProcessing = false
                        snackbarHostState.showSnackbar("Lote finalizado: $processedCount páginas processadas")
                    }
                },
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                Icon(Icons.Default.ViewModule, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Iniciar Escaneamento em Lote", fontSize = 18.sp)
            }
            if (isProcessing) {
                Spacer(Modifier.height(24.dp))
                CircularProgressIndicator()
            }
        }
    }
}

package com.scanluckpro.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.scanluckpro.export.ExportManager
import com.scanluckpro.export.ExportRequest
import com.scanluckpro.export.ExportFormat
import com.scanluckpro.signature.SignatureManager
import com.scanluckpro.signature.SignatureResult
import com.scanluckpro.data.Document
import com.scanluckpro.data.DocumentPage
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DocumentViewerScreen(navController: NavHostController, docId: String) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }
    var showSignatureDialog by remember { mutableStateOf(false) }
    // Buscar documento real pelo ID (exemplo)
    val document = remember(docId) {
        Document(
            id = docId,
            fileName = "Documento #$docId",
            filePath = "/documentos/doc$docId.pdf",
            pages = listOf(
                DocumentPage(
                    id = "p1", 
                    bitmap = null, 
                    extractedText = "Este é o conteúdo extraído do documento #$docId, página 1.", 
                    pageNumber = 1
                ),
                DocumentPage(
                    id = "p2", 
                    bitmap = null, 
                    extractedText = "Este é o conteúdo extraído do documento #$docId, página 2.", 
                    pageNumber = 2
                )
            ),
            documentType = "PDF",
            thumbnailPath = null
        )
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Visualizador de Documento", fontWeight = FontWeight.Bold, fontSize = 22.sp) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.Description, contentDescription = "Voltar")
                    }
                }
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        if (document == null) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("Documento não encontrado", color = Color.Gray)
            }
        } else {
            Column(
                Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.Top,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(Modifier.height(16.dp))
                Text(document.fileName, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                Text(
                    "${document.documentType} - ${java.text.SimpleDateFormat("dd/MM/yyyy", java.util.Locale.getDefault()).format(java.util.Date(document.createdAt))}",
                    color = Color.Gray,
                    fontSize = 13.sp
                )
                Spacer(Modifier.height(16.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(Modifier.padding(16.dp)) {
                        Text("Conteúdo extraído:", fontWeight = FontWeight.SemiBold)
                        Text(document.pages.joinToString("\n") { page -> page.extractedText }, color = Color.DarkGray)
                    }
                }
                Spacer(Modifier.height(24.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                    Button(onClick = {
                        coroutineScope.launch {
                            ExportManager.exportDocument(context, ExportRequest(
                                format = ExportFormat.PDF,                                pages = document.pages.map { page ->
                                    com.scanluckpro.export.DocumentPage(
                                        id = page.id,
                                        bitmap = page.bitmap,
                                        extractedText = page.extractedText,
                                        pageNumber = page.pageNumber
                                    )
                                }
                            ))
                            snackbarHostState.showSnackbar("Exportado como PDF")
                        }                    }) {
                        Icon(Icons.Default.PictureAsPdf, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Exportar PDF")
                    }
                    
                    Button(onClick = {
                        showSignatureDialog = true
                    }) {
                        Text("Assinar Digitalmente")
                    }
                }
            }
        }
    }

    // Dialog de assinatura digital REAL
    if (showSignatureDialog) {
        SignatureManager.SignatureDialog(
            onSignatureComplete = { signaturePaths, signerName ->
                coroutineScope.launch {
                    try {
                        val result = SignatureManager.createSignature(context, signaturePaths, signerName)
                        when (result) {
                            is SignatureResult.Success -> {
                                snackbarHostState.showSnackbar("Documento assinado digitalmente com sucesso!")
                                showSignatureDialog = false
                            }
                            is SignatureResult.Error -> {
                                snackbarHostState.showSnackbar("Erro ao assinar: ${result.message}")
                            }
                        }
                    } catch (e: Exception) {
                        snackbarHostState.showSnackbar("Erro ao assinar documento: ${e.message}")
                    }
                }
            },
            onDismiss = {
                showSignatureDialog = false
            }
        )
    }
}

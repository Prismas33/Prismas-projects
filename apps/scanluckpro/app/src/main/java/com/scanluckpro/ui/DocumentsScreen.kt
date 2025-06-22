package com.scanluckpro.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.clickable
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.scanluckpro.data.Document
import com.scanluckpro.data.DocumentPage
import com.scanluckpro.export.ExportManager
import com.scanluckpro.export.ExportRequest
import com.scanluckpro.export.ExportFormat
import kotlinx.coroutines.launch
import com.scanluckpro.search.SmartSearchManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import com.scanluckpro.export.DocumentPage as ExportDocumentPage

fun DocumentPage.toExportPage(): ExportDocumentPage {
    return ExportDocumentPage(
        id = this.id,
        bitmap = this.bitmap,
        extractedText = this.extractedText,
        pageNumber = this.pageNumber
    )
}

suspend fun buscarDocumentos(query: String): List<Document> = withContext(Dispatchers.IO) {
    if (query.isEmpty()) {
        // Retornar todos os documentos quando não houver busca
        listOf(
            Document(
                id = "1",
                fileName = "Documento teste 1",
                filePath = "/documentos/doc1.pdf",
                pages = listOf(
                    DocumentPage(id = "p1", bitmap = null, extractedText = "Texto exemplo 1", pageNumber = 1),
                    DocumentPage(id = "p2", bitmap = null, extractedText = "Texto exemplo 2", pageNumber = 2)
                ),
                documentType = "PDF",
                thumbnailPath = null
            ),
            Document(
                id = "2",
                fileName = "Contrato importante",
                filePath = "/documentos/contrato.pdf",
                pages = listOf(
                    DocumentPage(id = "p3", bitmap = null, extractedText = "Contrato de prestação de serviços", pageNumber = 1)
                ),
                documentType = "PDF",
                thumbnailPath = null
            )
        )
    } else {
        // Implementar busca real quando houver integração completa com SmartSearchManager
        listOf(
            Document(
                id = "3",
                fileName = "Resultado da busca: $query",
                filePath = "/documentos/resultado.pdf",
                pages = listOf(
                    DocumentPage(id = "p4", bitmap = null, extractedText = "Resultado contendo: $query", pageNumber = 1)
                ),
                documentType = "PDF",
                thumbnailPath = null
            )
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DocumentsScreen(navController: NavHostController) {
    val context = LocalContext.current
    var searchQuery by remember { mutableStateOf("") }
    var documents by remember { mutableStateOf(listOf<Document>()) }
    val coroutineScope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Meus Documentos", fontWeight = FontWeight.Bold, fontSize = 22.sp) },
                actions = {
                    IconButton(onClick = { /* Futuro: settings */ }) {
                        Icon(Icons.Default.Search, contentDescription = "Buscar")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { navController.navigate("scanner") },
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(Icons.Default.Add, contentDescription = "Novo Documento")
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 12.dp)
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { q ->
                    searchQuery = q
                    coroutineScope.launch {
                        documents = buscarDocumentos(q)
                    }
                },
                label = { Text("Buscar documentos") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                shape = MaterialTheme.shapes.medium
            )
            Spacer(Modifier.height(12.dp))
            if (documents.isEmpty()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Nenhum documento encontrado", color = Color.Gray)
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(documents) { doc ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { navController.navigate("viewer/${doc.id}") },
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                            elevation = CardDefaults.cardElevation(6.dp)
                        ) {
                            Row(
                                Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = if (doc.documentType.uppercase() == "PDF") Icons.Default.PictureAsPdf else Icons.Default.Description,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(36.dp)
                                )
                                Spacer(Modifier.width(16.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(doc.fileName, fontWeight = FontWeight.SemiBold, fontSize = 18.sp)
                                    Text(
                                        "${doc.documentType} - ${java.text.SimpleDateFormat("dd/MM/yyyy", java.util.Locale.getDefault()).format(java.util.Date(doc.createdAt))}",
                                        color = Color.Gray,
                                        fontSize = 13.sp
                                    )
                                }
                                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    IconButton(onClick = {
                                        coroutineScope.launch {
                                            val exportPages: List<com.scanluckpro.export.DocumentPage> = doc.pages.map { it.toExportPage() }
                                            ExportManager.exportDocument(context, ExportRequest(
                                                format = ExportFormat.PDF,
                                                pages = exportPages
                                            ))
                                            snackbarHostState.showSnackbar("Exportado como PDF")
                                        }
                                    }) { Icon(Icons.Default.PictureAsPdf, contentDescription = "Exportar PDF") }
                                    IconButton(onClick = {
                                        coroutineScope.launch {
                                            val exportPages: List<com.scanluckpro.export.DocumentPage> = doc.pages.map { it.toExportPage() }
                                            ExportManager.exportDocument(context, ExportRequest(
                                                format = ExportFormat.JPG,
                                                pages = exportPages
                                            ))
                                            snackbarHostState.showSnackbar("Exportado como JPG")
                                        }
                                    }) { Icon(Icons.Default.Description, contentDescription = "Exportar JPG") }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

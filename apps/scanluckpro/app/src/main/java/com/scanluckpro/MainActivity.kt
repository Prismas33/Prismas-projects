package com.scanluckpro

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.scanluckpro.data.*
import com.scanluckpro.domain.*
import com.scanluckpro.ml.OcrProcessor
import com.scanluckpro.security.BiometricHelper
import com.scanluckpro.ui.*
import com.scanluckpro.ui.theme.ScanLuckProTheme
import kotlinx.coroutines.launch
import java.io.File

class MainActivity : ComponentActivity() {
    private lateinit var database: AppDatabase
    private lateinit var scanUseCase: ScanDocumentUseCase
    private lateinit var exportUseCase: ExportDocumentUseCase
    private lateinit var searchUseCase: SearchDocumentsUseCase
    private lateinit var batchUseCase: BatchScanUseCase
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Inicializa banco de dados e casos de uso
        database = DatabaseProvider.getDatabase(this)
        scanUseCase = ScanDocumentUseCase(database, this)
        exportUseCase = ExportDocumentUseCase(database, this)
        searchUseCase = SearchDocumentsUseCase(database)
        batchUseCase = BatchScanUseCase(database, this)
        
        setContent {
            ScanLuckProTheme {
                Surface(color = MaterialTheme.colorScheme.background) {
                    ScanLuckProApp()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScanLuckProApp() {
    val navController = rememberNavController()
    var showBiometricPrompt by remember { mutableStateOf(true) }
    val context = LocalContext.current
    
    // Autenticação biométrica na inicialização
    LaunchedEffect(showBiometricPrompt) {
        if (showBiometricPrompt) {
            val availability = BiometricHelper.isBiometricAvailable(context)
            if (availability == BiometricHelper.BiometricAvailability.AVAILABLE) {
                // TODO: Implementar prompt biométrico aqui
                showBiometricPrompt = false
            } else {
                showBiometricPrompt = false
            }
        }
    }
    
    if (!showBiometricPrompt) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("ScanLuck Pro") },
                    actions = {
                        IconButton(onClick = { navController.navigate("settings") }) {
                            Icon(Icons.Default.Settings, contentDescription = "Configurações")
                        }
                    }
                )
            },
            bottomBar = {
                NavigationBar {
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.CameraAlt, contentDescription = null) },
                        label = { Text("Scanner") },
                        selected = false,
                        onClick = { navController.navigate("scanner") }
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.Folder, contentDescription = null) },
                        label = { Text("Documentos") },
                        selected = false,
                        onClick = { navController.navigate("documents") }
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.Search, contentDescription = null) },
                        label = { Text("Buscar") },
                        selected = false,
                        onClick = { navController.navigate("search") }
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.QrCode, contentDescription = null) },
                        label = { Text("QR/Código") },
                        selected = false,
                        onClick = { navController.navigate("barcode") }
                    )
                }
            }
        ) { innerPadding ->
            NavHost(
                navController = navController,
                startDestination = "home",
                modifier = Modifier.padding(innerPadding)
            ) {
                composable("home") { HomeScreen(navController) }
                composable("scanner") { 
                    ScannerScreen(onImageCaptured = { imagePath ->
                        // TODO: Navegar para tela de preview/edição
                    })
                }
                composable("documents") { DocumentsScreen() }
                composable("search") { SearchScreen() }
                composable("barcode") { BarcodeScreen() }
                composable("settings") { SettingsScreen() }
                composable("signature") { 
                    SignaturePad(
                        onSignatureDone = { signatureData ->
                            // TODO: Salvar assinatura
                            navController.popBackStack()
                        }
                    )
                }
            }
        }
    } else {
        // Tela de carregamento/autenticação
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                CircularProgressIndicator()
                Spacer(modifier = Modifier.height(16.dp))
                Text("Autenticando...")
            }
        }
    }
}

@Composable
fun HomeScreen(navController: androidx.navigation.NavController) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                onClick = { navController.navigate("scanner") }
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        Icons.Default.CameraAlt,
                        contentDescription = null,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Escanear Documento",
                        style = MaterialTheme.typography.headlineSmall
                    )
                    Text(
                        "OCR offline, correção automática",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }
        
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Card(
                    modifier = Modifier.weight(1f),
                    onClick = { navController.navigate("barcode") }
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(Icons.Default.QrCode, contentDescription = null)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("QR/Código")
                    }
                }
                
                Card(
                    modifier = Modifier.weight(1f),
                    onClick = { navController.navigate("signature") }
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(Icons.Default.Draw, contentDescription = null)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Assinatura")
                    }
                }
            }
        }
        
        item {
            Text(
                "Recursos Premium:",
                style = MaterialTheme.typography.headlineSmall
            )
        }
        
        val features = listOf(
            "✓ OCR offline em 50+ idiomas",
            "✓ Correção automática de perspectiva", 
            "✓ Assinatura digital em PDF",
            "✓ Modo lote (até 100 páginas)",
            "✓ Busca inteligente em documentos",
            "✓ Exportação flexível (PDF/JPEG/TXT)",
            "✓ Compactação sem perda de qualidade",
            "✓ Integrações (Drive, Dropbox, WhatsApp)",
            "✓ Automações (Zapier, IFTTT)",
            "✓ Segurança máxima (criptografia local)"
        )
        
        items(features) { feature ->
            Text(
                feature,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(vertical = 2.dp)
            )
        }
    }
}

@Composable
fun DocumentsScreen() {
    // TODO: Implementar lista de documentos
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text("Lista de Documentos - Em implementação")
    }
}

@Composable
fun SearchScreen() {
    // TODO: Implementar busca inteligente
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text("Busca Inteligente - Em implementação")
    }
}

@Composable
fun BarcodeScreen() {
    // TODO: Implementar scanner QR/Barcode
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text("Scanner QR/Código - Em implementação")
    }
}

@Composable
fun SettingsScreen() {
    // TODO: Implementar configurações
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text("Configurações - Em implementação")
    }
}

@Composable
fun ScannerScreen(onImageCaptured: (String) -> Unit) {
    // TODO: Implementar tela de scanner
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text("Tela de Scanner - Em implementação")
    }
}

@Composable
fun SignaturePad(onSignatureDone: (String) -> Unit) {
    // TODO: Implementar pad de assinatura
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text("Pad de Assinatura - Em implementação")
    }
}

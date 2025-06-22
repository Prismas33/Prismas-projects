package com.scanluckpro.ui

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DocumentScanner
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ViewModule
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.compose.ui.Modifier
import com.scanluckpro.batch.TurboBatchScanManager
import com.scanluckpro.camera.CameraManager
import com.scanluckpro.compression.IntelligentCompression
import com.scanluckpro.excel.ExcelConverter
import com.scanluckpro.ml.MLProcessor
import com.scanluckpro.processing.ImageProcessor
import com.scanluckpro.export.ExportManager
import com.scanluckpro.signature.SignatureManager
import com.scanluckpro.ui.BatchScanScreen
import com.scanluckpro.ui.DocumentsScreen
import com.scanluckpro.ui.HomeScreen
import com.scanluckpro.ui.ScannerScreen
import com.scanluckpro.ui.SettingsScreen
import com.scanluckpro.ui.DocumentViewerScreen

@Composable
fun ScannerApp() {
    val navController = rememberNavController()
    Scaffold(
        bottomBar = {
            BottomNavigationBar(navController)
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("home") { HomeScreen(navController) }
            composable("scanner") { ScannerScreen(navController) }
            composable("documents") { DocumentsScreen(navController) }
            composable("batch") { BatchScanScreen(navController) }
            composable("viewer/{docId}") { backStackEntry ->
                val docId = backStackEntry.arguments?.getString("docId") ?: ""
                DocumentViewerScreen(navController = navController, docId = docId)
            }
            composable("settings") { SettingsScreen(navController) }
        }
    }
}

@Composable
fun BottomNavigationBar(navController: NavHostController) {
    val items = listOf(
        NavItem("Início", "home", Icons.Default.Home),
        NavItem("Scanner", "scanner", Icons.Default.DocumentScanner),
        NavItem("Documentos", "documents", Icons.Default.Folder),
        NavItem("Lote", "batch", Icons.Default.ViewModule),
        NavItem("Config", "settings", Icons.Default.Settings)
    )
    NavigationBar {
        val navBackStackEntry by navController.currentBackStackEntryAsState()
        val currentRoute = navBackStackEntry?.destination?.route
        items.forEach { item ->
            NavigationBarItem(
                selected = currentRoute == item.route || (item.route == "home" && currentRoute == null),
                onClick = {
                    if (currentRoute != item.route) {
                        navController.navigate(item.route) {
                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                },
                label = { Text(item.label) },
                icon = { Icon(item.icon, contentDescription = item.label) }
            )
        }
    }
}

data class NavItem(val label: String, val route: String, val icon: androidx.compose.ui.graphics.vector.ImageVector)

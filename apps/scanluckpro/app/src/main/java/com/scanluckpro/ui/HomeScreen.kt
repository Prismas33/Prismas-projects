

package com.scanluckpro.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DocumentScanner
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.ViewModule
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavHostController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(24.dp, Alignment.CenterVertically),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            "ScanLuck Pro",
            style = MaterialTheme.typography.headlineLarge,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        Text(
            "Scanner premium, seguro e inteligente.",
            style = MaterialTheme.typography.bodyLarge,
            color = Color.Gray,
            fontSize = 18.sp
        )
        Spacer(Modifier.height(16.dp))
        ActionCard(
            title = "Novo Escaneamento",
            icon = Icons.Default.DocumentScanner,
            color = MaterialTheme.colorScheme.primary,
            onClick = { navController.navigate("scanner") }
        )
        ActionCard(
            title = "Meus Documentos",
            icon = Icons.Default.Folder,
            color = MaterialTheme.colorScheme.secondary,
            onClick = { navController.navigate("documents") }
        )
        ActionCard(
            title = "Modo Lote Turbo",
            icon = Icons.Default.ViewModule,
            color = MaterialTheme.colorScheme.tertiary,
            onClick = { navController.navigate("batch") }
        )
        ActionCard(
            title = "Configurações",
            icon = Icons.Default.Settings,
            color = MaterialTheme.colorScheme.outline,
            onClick = { navController.navigate("settings") }
        )    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ActionCard(title: String, icon: androidx.compose.ui.graphics.vector.ImageVector, color: Color, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.12f)),
        modifier = Modifier
            .fillMaxWidth()
            .height(64.dp)
    ) {
        Row(
            Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, contentDescription = title, tint = color, modifier = Modifier.size(32.dp))
            Spacer(Modifier.width(18.dp))
            Text(title, fontSize = 20.sp, color = color, modifier = Modifier.weight(1f))
        }
    }
}

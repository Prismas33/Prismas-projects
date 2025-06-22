package com.scanluckpro.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController

@Composable
fun SettingsScreen(navController: NavHostController) {
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Configurações", style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.height(8.dp))
        // Adicione configurações reais conforme necessário
        Text("Privacidade: 100% local")
        Text("Zero anúncios")
        Text("Exportação flexível")
        Text("Compactação IA disponível")
    }
}

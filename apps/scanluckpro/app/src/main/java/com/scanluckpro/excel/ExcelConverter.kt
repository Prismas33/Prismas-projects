package com.scanluckpro.excel

import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.util.Log
import androidx.core.content.FileProvider
import com.scanluckpro.ml.MLProcessor
import com.scanluckpro.ml.TextBlock
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.apache.poi.ss.usermodel.*
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

/**
 * 📊 CONVERSOR DE TABELAS PARA EXCEL
 * 
 * Funcionalidade Incluída:
 * ✅ Detecta tabelas automaticamente
 * ✅ Converte para Excel (.xlsx) com um toque
 * ✅ Preserva formatação e estrutura
 * ✅ Exportação direta
 */
object ExcelConverter {
    
    /**
     * Converte imagem com tabela para Excel
     */
    suspend fun convertTableToExcel(
        context: Context,
        bitmap: Bitmap,
        fileName: String? = null
    ): ExcelResult = withContext(Dispatchers.IO) {
        try {
            Log.d("ExcelConverter", "Iniciando conversão para Excel...")
            
            // 1. Extrair texto da imagem
            val textResult = MLProcessor.extractText(bitmap)
            if (!textResult.isSuccess) {
                return@withContext ExcelResult.Error("Erro ao extrair texto da imagem")
            }
            
            // 2. Detectar estrutura de tabela
            val tableData = detectTableStructure(textResult.textBlocks)
            if (tableData.isEmpty()) {
                return@withContext ExcelResult.Error("Nenhuma tabela detectada na imagem")
            }
            
            // 3. Criar arquivo Excel
            val excelFile = createExcelFile(context, tableData, fileName)
            
            // 4. Obter URI para compartilhamento
            val fileUri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                excelFile
            )
            
            ExcelResult.Success(
                filePath = excelFile.absolutePath,
                fileUri = fileUri,
                rowCount = tableData.size,
                columnCount = tableData.maxOfOrNull { it.size } ?: 0,
                fileSize = excelFile.length()
            )
            
        } catch (e: Exception) {
            Log.e("ExcelConverter", "Erro na conversão: ${e.message}")
            ExcelResult.Error("Erro na conversão: ${e.message}")
        }
    }
    
    /**
     * Detecta estrutura de tabela no texto extraído
     */
    private fun detectTableStructure(textBlocks: List<TextBlock>): List<List<String>> {
        val rows = mutableListOf<List<String>>()
        
        try {
            // Agrupar blocos de texto por linha (coordenada Y similar)
            val groupedByY = textBlocks
                .filter { it.text.isNotBlank() }
                .groupBy { (it.boundingBox.top / 20) * 20 } // Agrupar por faixas de Y
                .toSortedMap()
            
            // Para cada linha, ordenar por coordenada X e extrair colunas
            for ((_, blocks) in groupedByY) {
                val sortedBlocks = blocks.sortedBy { it.boundingBox.left }
                
                // Detectar separação entre colunas
                val columns = mutableListOf<String>()
                var currentColumn = StringBuilder()
                var lastRight = 0
                
                for (block in sortedBlocks) {
                    val gap = block.boundingBox.left - lastRight
                    
                    // Se há um gap significativo, é uma nova coluna
                    if (gap > 50 && currentColumn.isNotEmpty()) {
                        columns.add(currentColumn.toString().trim())
                        currentColumn = StringBuilder()
                    }
                    
                    if (currentColumn.isNotEmpty()) {
                        currentColumn.append(" ")
                    }
                    currentColumn.append(block.text)
                    lastRight = block.boundingBox.right
                }
                
                // Adicionar última coluna
                if (currentColumn.isNotEmpty()) {
                    columns.add(currentColumn.toString().trim())
                }
                
                // Só adicionar se tiver pelo menos 2 colunas (parece tabela)
                if (columns.size >= 2) {
                    rows.add(columns)
                }
            }
            
            // Filtrar linhas que não parecem fazer parte da tabela
            return filterTableRows(rows)
            
        } catch (e: Exception) {
            Log.e("ExcelConverter", "Erro na detecção de tabela: ${e.message}")
            return emptyList()
        }
    }
    
    /**
     * Filtra e limpa dados da tabela
     */
    private fun filterTableRows(rows: List<List<String>>): List<List<String>> {
        if (rows.isEmpty()) return emptyList()
        
        // Determinar número mais comum de colunas
        val columnCounts = rows.map { it.size }
        val mostCommonColumnCount = columnCounts.groupingBy { it }.eachCount().maxByOrNull { it.value }?.key ?: 0
        
        // Filtrar linhas com número de colunas consistente
        return rows.filter { 
            it.size >= mostCommonColumnCount - 1 && // Permitir variação de 1 coluna
            it.any { cell -> cell.length > 1 } // Pelo menos uma célula com conteúdo
        }.map { row ->
            // Padronizar número de colunas
            val paddedRow = row.toMutableList()
            while (paddedRow.size < mostCommonColumnCount) {
                paddedRow.add("")
            }
            paddedRow.take(mostCommonColumnCount)
        }
    }
    
    /**
     * Cria arquivo Excel (.xlsx)
     */
    private fun createExcelFile(
        context: Context,
        tableData: List<List<String>>,
        fileName: String?
    ): File {
        val workbook = XSSFWorkbook()
        val sheet = workbook.createSheet("Tabela Escaneada")
        
        // Criar estilos
        val headerStyle = workbook.createCellStyle().apply {
            setFillForegroundColor(IndexedColors.LIGHT_BLUE.index)
            fillPattern = FillPatternType.SOLID_FOREGROUND
            val font = workbook.createFont()
            font.bold = true
            setFont(font)
        }
        
        val dataStyle = workbook.createCellStyle().apply {
            setBorderTop(BorderStyle.THIN)
            setBorderBottom(BorderStyle.THIN)
            setBorderLeft(BorderStyle.THIN)
            setBorderRight(BorderStyle.THIN)
        }
        
        // Preencher dados
        tableData.forEachIndexed { rowIndex, rowData ->
            val row = sheet.createRow(rowIndex)
            
            rowData.forEachIndexed { colIndex, cellData ->
                val cell = row.createCell(colIndex)
                cell.setCellValue(cellData)
                
                // Aplicar estilo (primeira linha como cabeçalho)
                cell.cellStyle = if (rowIndex == 0) headerStyle else dataStyle
            }
        }
        
        // Auto-ajustar largura das colunas
        if (tableData.isNotEmpty()) {
            for (i in 0 until tableData[0].size) {
                sheet.autoSizeColumn(i)
            }
        }
        
        // Salvar arquivo
        val excelDir = File(context.getExternalFilesDir(null), "ScanLuckPro/excel")
        if (!excelDir.exists()) {
            excelDir.mkdirs()
        }
        
        val finalFileName = fileName ?: generateExcelFileName()
        val file = File(excelDir, "$finalFileName.xlsx")
        
        FileOutputStream(file).use { fos ->
            workbook.write(fos)
        }
        
        workbook.close()
        return file
    }
    
    /**
     * Gera nome único para arquivo Excel
     */
    private fun generateExcelFileName(): String {
        val dateFormat = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault())
        return "Tabela_${dateFormat.format(Date())}"
    }
    
    /**
     * Detecta se a imagem contém uma tabela
     */
    suspend fun hasTable(bitmap: Bitmap): Boolean {
        return try {
            val textResult = MLProcessor.extractText(bitmap)
            val tableData = detectTableStructure(textResult.textBlocks)
            tableData.size >= 2 // Pelo menos 2 linhas
        } catch (e: Exception) {
            false
        }
    }
}

/**
 * Resultado da conversão para Excel
 */
sealed class ExcelResult {
    data class Success(
        val filePath: String,
        val fileUri: Uri,
        val rowCount: Int,
        val columnCount: Int,
        val fileSize: Long
    ) : ExcelResult()
    
    data class Error(val message: String) : ExcelResult()
}

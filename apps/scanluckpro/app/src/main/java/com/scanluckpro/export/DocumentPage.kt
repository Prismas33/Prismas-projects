package com.scanluckpro.export

import android.graphics.Bitmap

/**
 * Data class representando uma página de documento para exportação
 */
data class DocumentPage(
    val id: String,
    val bitmap: Bitmap?,
    val extractedText: String,
    val pageNumber: Int
)

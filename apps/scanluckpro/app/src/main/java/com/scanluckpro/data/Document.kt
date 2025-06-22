package com.scanluckpro.data

import android.graphics.Bitmap

/**
 * Data class representing a document in the app
 */
data class Document(
    val id: String,
    val fileName: String,
    val filePath: String,
    val pages: List<DocumentPage>,
    val createdAt: Long = System.currentTimeMillis(),
    val modifiedAt: Long = System.currentTimeMillis(),
    val documentType: String,
    val fileSize: Long = 0L,
    val thumbnailPath: String? = null
)

/**
 * Data class representing a single page of a document
 */
data class DocumentPage(
    val id: String,
    val bitmap: Bitmap?,
    val extractedText: String = "",
    val pageNumber: Int
)

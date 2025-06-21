package com.scanluckpro.data

import androidx.room.*
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import net.sqlcipher.database.SupportFactory
import java.util.*

// Entidades
@Entity(tableName = "documents")
data class Document(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val name: String,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val pageCount: Int = 0,
    val ocrText: String = "",
    val tags: String = "", // JSON string de tags
    val isEncrypted: Boolean = false,
    val fileSize: Long = 0
)

@Entity(tableName = "document_pages")
data class DocumentPage(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val documentId: String,
    val pageNumber: Int,
    val imagePath: String,
    val ocrText: String = "",
    val thumbnailPath: String = "",
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "signatures")
data class Signature(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val name: String,
    val signaturePath: String, // Caminho para arquivo SVG da assinatura
    val createdAt: Long = System.currentTimeMillis(),
    val isDefault: Boolean = false
)

@Entity(tableName = "search_index")
data class SearchIndex(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val documentId: String,
    val pageId: String?,
    val content: String,
    val contentType: String, // "ocr", "title", "tag"
    val createdAt: Long = System.currentTimeMillis()
)

// DAOs
@Dao
interface DocumentDao {
    @Query("SELECT * FROM documents ORDER BY updatedAt DESC")
    suspend fun getAllDocuments(): List<Document>
    
    @Query("SELECT * FROM documents WHERE id = :id")
    suspend fun getDocumentById(id: String): Document?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDocument(document: Document)
    
    @Update
    suspend fun updateDocument(document: Document)
    
    @Delete
    suspend fun deleteDocument(document: Document)
    
    @Query("SELECT * FROM documents WHERE ocrText LIKE '%' || :query || '%' OR name LIKE '%' || :query || '%'")
    suspend fun searchDocuments(query: String): List<Document>
}

@Dao
interface DocumentPageDao {
    @Query("SELECT * FROM document_pages WHERE documentId = :documentId ORDER BY pageNumber")
    suspend fun getPagesByDocumentId(documentId: String): List<DocumentPage>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPage(page: DocumentPage)
    
    @Update
    suspend fun updatePage(page: DocumentPage)
    
    @Delete
    suspend fun deletePage(page: DocumentPage)
    
    @Query("DELETE FROM document_pages WHERE documentId = :documentId")
    suspend fun deletePagesByDocumentId(documentId: String)
}

@Dao
interface SignatureDao {
    @Query("SELECT * FROM signatures ORDER BY createdAt DESC")
    suspend fun getAllSignatures(): List<Signature>
    
    @Query("SELECT * FROM signatures WHERE isDefault = 1 LIMIT 1")
    suspend fun getDefaultSignature(): Signature?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSignature(signature: Signature)
    
    @Delete
    suspend fun deleteSignature(signature: Signature)
    
    @Query("UPDATE signatures SET isDefault = 0")
    suspend fun clearDefaultSignatures()
}

@Dao
interface SearchIndexDao {
    @Query("SELECT DISTINCT documentId FROM search_index WHERE content MATCH :query")
    suspend fun searchDocumentIds(query: String): List<String>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSearchIndex(searchIndex: SearchIndex)
    
    @Query("DELETE FROM search_index WHERE documentId = :documentId")
    suspend fun deleteSearchIndexByDocumentId(documentId: String)
    
    @Query("SELECT * FROM search_index WHERE content MATCH :query ORDER BY documentId")
    suspend fun fullTextSearch(query: String): List<SearchIndex>
}

@Database(
    entities = [Document::class, DocumentPage::class, Signature::class, SearchIndex::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun documentDao(): DocumentDao
    abstract fun documentPageDao(): DocumentPageDao
    abstract fun signatureDao(): SignatureDao
    abstract fun searchIndexDao(): SearchIndexDao
}

class Converters {
    @TypeConverter
    fun fromStringList(value: List<String>): String {
        return value.joinToString(",")
    }
    
    @TypeConverter
    fun toStringList(value: String): List<String> {
        return if (value.isEmpty()) emptyList() else value.split(",")
    }
}

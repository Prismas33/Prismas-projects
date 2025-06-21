package com.scanluckpro.data

import android.content.Context
import androidx.room.Room
import net.sqlcipher.database.SupportFactory

object DatabaseProvider {
    @Volatile
    private var INSTANCE: AppDatabase? = null
    
    fun getDatabase(context: Context, passphrase: String? = null): AppDatabase {
        return INSTANCE ?: synchronized(this) {
            val instance = if (passphrase != null) {
                // Banco criptografado com SQLCipher
                val factory = SupportFactory(passphrase.toByteArray())
                Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "scanluck_database"
                ).openHelperFactory(factory)
                    .build()
            } else {
                // Banco normal
                Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "scanluck_database"
                ).build()
            }
            INSTANCE = instance
            instance
        }
    }
}

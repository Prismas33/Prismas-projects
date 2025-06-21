# Proguard rules for ScanLuck Pro

# Keep all classes with native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep ML Kit classes
-keep class com.google.mlkit.** { *; }
-keep class com.google.android.gms.** { *; }

# Keep OpenCV classes
-keep class org.opencv.** { *; }

# Keep iTextPDF classes
-keep class com.itextpdf.** { *; }

# Keep Room classes
-keep class * extends androidx.room.RoomDatabase { *; }
-keep @androidx.room.Entity class * { *; }
-keep @androidx.room.Dao class * { *; }

# Keep SQLCipher classes
-keep class net.sqlcipher.** { *; }

# Keep signature and security classes
-keep class com.scanluckpro.security.** { *; }
-keep class com.scanluckpro.ml.** { *; }

# Suppress warnings for libraries
-dontwarn org.opencv.**
-dontwarn com.itextpdf.**
-dontwarn net.sqlcipher.**

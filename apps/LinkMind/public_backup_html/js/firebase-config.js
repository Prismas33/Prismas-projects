// Firebase Configuration - Loads config from server environment variables
let firebaseApp, firebaseAuth, firebaseDb, firebaseAnalytics;

async function initializeFirebase() {
    try {
        // Fetch Firebase configuration from server
        const response = await fetch('/api/firebase-config');
        const firebaseConfig = await response.json();
        
        // Fallback configuration (should match your .env file)
        const config = {
            apiKey: firebaseConfig.apiKey || "AIzaSyDw5Bb-NmvR18c-G-juXal0r1TPLpwgGGE",
            authDomain: firebaseConfig.authDomain || "linkmind-94209.firebaseapp.com",
            projectId: firebaseConfig.projectId || "linkmind-94209",
            storageBucket: firebaseConfig.storageBucket || "linkmind-94209.firebasestorage.app",
            messagingSenderId: firebaseConfig.messagingSenderId || "702458630922",
            appId: firebaseConfig.appId || "1:702458630922:web:72f0750e78b33349ace0f3",
            measurementId: firebaseConfig.measurementId || "G-0WE22YP9CV"
        };

        // Initialize Firebase
        firebaseApp = firebase.initializeApp(config);

        // Initialize Firebase services
        firebaseAuth = firebase.auth();
        firebaseDb = firebase.firestore();
        
        // Initialize Analytics (optional)
        if (config.measurementId) {
            firebaseAnalytics = firebase.analytics();
        }

        // Export for global use
        window.firebaseApp = firebaseApp;
        window.firebaseAuth = firebaseAuth;
        window.firebaseDb = firebaseDb;
        window.firebaseAnalytics = firebaseAnalytics;

        console.log('✅ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error);
        return false;
    }
}

// Initialize Firebase when the script loads
initializeFirebase();

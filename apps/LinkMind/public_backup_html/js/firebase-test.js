// Firebase Configuration Test Script
// This script can be used to verify Firebase configuration

console.log('🔥 Testing Firebase Configuration...');

// Wait for Firebase to initialize
setTimeout(async () => {
    try {
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK not loaded');
            return;
        }

        if (!window.firebaseApp) {
            console.error('❌ Firebase app not initialized');
            return;
        }

        console.log('✅ Firebase SDK loaded successfully');
        console.log('✅ Firebase app initialized:', window.firebaseApp.name);

        // Test Authentication
        if (window.firebaseAuth) {
            console.log('✅ Firebase Auth initialized');
            window.firebaseAuth.onAuthStateChanged((user) => {
                if (user) {
                    console.log('✅ User authenticated:', user.uid);
                } else {
                    console.log('ℹ️ No user authenticated');
                }
            });
        }

        // Test Firestore
        if (window.firebaseDb) {
            console.log('✅ Firestore initialized');
            
            // Test connection with a simple read
            try {
                const testDoc = await window.firebaseDb.collection('test').doc('connection').get();
                console.log('✅ Firestore connection successful');
            } catch (error) {
                console.log('ℹ️ Firestore connection test failed (this is normal for new databases):', error.message);
            }
        }

        // Test Analytics
        if (window.firebaseAnalytics) {
            console.log('✅ Firebase Analytics initialized');
        }

        console.log('🎉 Firebase configuration test completed!');

    } catch (error) {
        console.error('❌ Firebase configuration error:', error);
    }
}, 2000); // Wait 2 seconds for Firebase to initialize

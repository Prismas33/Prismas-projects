// Firebase configuration for React frontend
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration will be loaded from the server
let firebaseConfig: any = null;
let app: any = null;
let auth: any = null;
let db: any = null;
let analytics: any = null;

export const initializeFirebase = async (): Promise<boolean> => {
  try {
    // Fetch Firebase configuration from server
    const response = await fetch('http://localhost:5000/api/firebase-config');
    firebaseConfig = await response.json();
    
    // Fallback configuration
    if (!firebaseConfig.apiKey) {
      firebaseConfig = {
        apiKey: "AIzaSyDw5Bb-NmvR18c-G-juXal0r1TPLpwgGGE",
        authDomain: "linkmind-94209.firebaseapp.com",
        projectId: "linkmind-94209",
        storageBucket: "linkmind-94209.firebasestorage.app",
        messagingSenderId: "702458630922",
        appId: "1:702458630922:web:72f0750e78b33349ace0f3",
        measurementId: "G-0WE22YP9CV"
      };
    }

    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Initialize Analytics (optional)
    if (firebaseConfig.measurementId && typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }

    console.log('✅ Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    return false;
  }
};

export { auth, db, analytics };
export default app;

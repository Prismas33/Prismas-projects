// Firebase config para uso no React
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDw5Bb-NmvR18c-G-juXal0r1TPLpwgGGE',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'linkmind-94209.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'linkmind-94209',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'linkmind-94209.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '702458630922',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:702458630922:web:72f0750e78b33349ace0f3',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-0WE22YP9CV',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

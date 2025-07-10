import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
// Using the new mobile app in the same Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyAiRVfyoXVWp4u-oSD1LJOWylfckA4DY38",
  authDomain: "cinematch-2b345.firebaseapp.com",
  projectId: "cinematch-2b345",
  storageBucket: "cinematch-2b345.firebasestorage.app",
  messagingSenderId: "429166648472",
  appId: "1:429166648472:web:dcc13fdc237e7eaa7544ed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app; 
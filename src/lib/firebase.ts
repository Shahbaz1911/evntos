
// Firebase app initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ==============================================================================
// !! CRITICAL: UPDATE THIS CONFIGURATION !!
// ==============================================================================
// The error "auth/api-key-not-valid" means the values below are incorrect.
// You MUST replace "YOUR_API_KEY", "YOUR_AUTH_DOMAIN", etc.,
// with the actual Firebase configuration values for YOUR project.
//
// How to find your Firebase config:
// 1. Go to your Firebase project in the Firebase Console (console.firebase.google.com).
// 2. Click the gear icon (Project settings) next to "Project Overview".
// 3. In the "General" tab, scroll down to "Your apps".
// 4. Find your web app and look for the "SDK setup and configuration" section.
// 5. Select "Config" to view the firebaseConfig object.
// 6. Copy those values and paste them here.
// ==============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyA6FCx0TdqvsFnwGR35D-C4AdSK6UNV2gc",
  authDomain: "eventos-74593.firebaseapp.com",
  projectId: "eventos-74593",
  storageBucket: "eventos-74593.firebasestorage.app",
  messagingSenderId: "480526111994",
  appId: "1:480526111994:web:d40e1e290f454a190c2543",
  measurementId: "G-HCLCXQR3J0"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };


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
  apiKey: "YOUR_API_KEY", // <--- REPLACE THIS
  authDomain: "YOUR_AUTH_DOMAIN", // <--- REPLACE THIS
  projectId: "YOUR_PROJECT_ID", // <--- REPLACE THIS
  storageBucket: "YOUR_STORAGE_BUCKET", // <--- REPLACE THIS
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <--- REPLACE THIS
  appId: "YOUR_APP_ID", // <--- REPLACE THIS
  measurementId: "YOUR_MEASUREMENT_ID" // <--- REPLACE THIS (Optional)
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

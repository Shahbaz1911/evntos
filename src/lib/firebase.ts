
// Firebase app initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ==============================================================================
// !! CRITICAL: YOUR FIREBASE CONFIGURATION IS NOW IN THE .env FILE !!
// ==============================================================================
// This application now loads its Firebase credentials from your environment
// variables, which should be stored in a `.env` file in the root of your
// project for local development, and in your Vercel project settings for
// deployment.
//
// If you see Firebase errors, ensure the following variables are correctly set:
// - NEXT_PUBLIC_FIREBASE_API_KEY
// - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
// - NEXT_PUBLIC_FIREBASE_PROJECT_ID
// ...and so on for all firebase config values.
// ==============================================================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Check that all required environment variables are set.
if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId
) {
    // In a server-side context, you might throw an error.
    // In a client-side (Next.js) context, this might be trickier because
    // the app will fail to build or run. For developer convenience,
    // we log a clear error message.
    console.error(
`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!! FIREBASE_CONFIG_MISSING:
!!! Your Firebase configuration is missing or incomplete.
!!! Please ensure all NEXT_PUBLIC_FIREBASE_* variables are set in your .env file.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`
    );
}


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


// Firebase app initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// IMPORTANT: Replace these with your actual Firebase project configuration!
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

export { app, auth };

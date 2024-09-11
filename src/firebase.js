// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";  // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyBpeC6zu6hNpD5ZE2abDinL20jnC9mRKzs",
  authDomain: "alumni-adb31.firebaseapp.com",
  projectId: "alumni-adb31",
  storageBucket: "alumni-adb31.appspot.com",
  messagingSenderId: "876050654009",
  appId: "1:876050654009:web:4174191e1ee191a12d3ee8",
  measurementId: "G-TWEL2H9CD5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);  // Initialize Firebase Storage

export { auth, db, analytics, storage };  // Export storage for use in other files

//config.js
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyAafdn84Migr9WqX0aDmZQopMG0W_JRl-o",
  authDomain: "clon-tinder-51e87.firebaseapp.com",
  projectId: "clon-tinder-51e87",
  storageBucket: "clon-tinder-51e87.firebasestorage.app",
  messagingSenderId: "427512081370",
  appId: "1:427512081370:web:e218a0c7882827b3a4aee3",
};

// Initialize Firebase
const FirebaseApp = initializeApp(firebaseConfig);

export const FirebaseAuth = getAuth(FirebaseApp);
export const FirebaseDB = getFirestore(FirebaseApp);

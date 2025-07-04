
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
const firebaseConfig = {
    apiKey: "AIzaSyA_q4z19mNh7kyAC6ZAj4Ep-aEBT6b2gIc",
    authDomain: "clothing-f5146.firebaseapp.com",
    projectId: "clothing-f5146",
    storageBucket: "clothing-f5146.firebasestorage.app",
    messagingSenderId: "878050244657",
    appId: "1:878050244657:web:a17f52fb644ad9d1b8fd10",
    measurementId: "G-DTC81RWJLY"
  };
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);



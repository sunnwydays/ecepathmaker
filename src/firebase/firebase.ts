// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCqNwV308wggSrbOzpZKp2YXo18_vC-_Pg",
    authDomain: "ecepathmaker.firebaseapp.com",
    projectId: "ecepathmaker",
    storageBucket: "ecepathmaker.firebasestorage.app",
    messagingSenderId: "471899088952",
    appId: "1:471899088952:web:69ee9480dc6f6f4bb19ecd",
    measurementId: "G-LXD116CKJL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };


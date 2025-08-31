// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPghGjZqvti6IC3caNs-_1Uw3svPNv9nk",
  authDomain: "logs-9e8ce.firebaseapp.com",
  projectId: "logs-9e8ce",   
  storageBucket: "logs-9e8ce.firebasestorage.app",
  messagingSenderId: "1023907650843",
  appId: "1:1023907650843:web:83b05da82acb55cfad47be"
  

};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

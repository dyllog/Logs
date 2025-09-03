// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCPghGjZqvti6IC3caNs-_1Uw3svPNv9nk",
  authDomain: "logs-9e8ce.firebaseapp.com",
  projectId: "logs-9e8ce",
  storageBucket: "logs-9e8ce.firebasestorage.app",
  messagingSenderId: "1023907650843",
  appId: "1:1023907650843:web:83b05da82acb55cfad47be",
};

// Init only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// ---- Browser-only section (avoid Next.js SSR issues) ----
if (typeof window !== "undefined") {
  // Refresh ID token so custom claims (like admin) are always up to date
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    try {
      const res = await user.getIdTokenResult(true); // force refresh
      console.log("🔑 claims:", res.claims); // will show { admin: true } if your claim is set
    } catch (err) {
      console.error("⚠️ Failed to refresh token:", err);
    }
  });

  // Optional: keep anonymous users signed in (so they can still CREATE logs)
  if (!auth.currentUser) {
    signInAnonymously(auth).catch((e) => {
      console.warn("⚠️ Anonymous sign-in failed:", e?.message || e);
    });
  }
}

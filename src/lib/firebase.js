/* global __firebase_config */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const getFirebaseConfig = () => {
  // 1. Cloud Environment (Runtime)
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    try {
      return JSON.parse(__firebase_config);
    } catch (e) {
      console.error("Error parsing __firebase_config:", e);
    }
  }

  // 2. Local Environment (Vite .env)
  // Safe access to import.meta.env
  let localEnv = {};
  try {
    // @ts-ignore
    localEnv = (import.meta && import.meta.env) ? import.meta.env : {};
  } catch {
    localEnv = {};
  }

  const config = {
    apiKey: localEnv.VITE_FIREBASE_API_KEY || "",
    authDomain: localEnv.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: localEnv.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: localEnv.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: localEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: localEnv.VITE_FIREBASE_APP_ID || ""
  };

  if (!config.apiKey || !config.projectId) {
    const msg = "Falta configuración de Firebase. Revisa tu archivo .env";
    console.error(msg);
    // @ts-ignore
    if (import.meta.env.DEV) {
      alert(msg);
    }
  }

  return config;
};

const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Initialized just in case, though we might use URLs directly
export default app;

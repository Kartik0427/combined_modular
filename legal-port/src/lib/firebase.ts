import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-2ArR_Ppx7f8PoAswciX73Kbv1seW3M8",
  authDomain: "legal-port.firebaseapp.com",
  projectId: "legal-port",
  storageBucket: "legal-port.firebasestorage.app",
  messagingSenderId: "999032743739",
  appId: "1:999032743739:web:bdf4552ff1ae1d85f6391e",
  measurementId: "G-4VEDZCKBLC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
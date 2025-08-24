import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB-2ArR_Ppx7f8PoAswciX73Kbv1seW3M8",
  authDomain: "legal-port.firebaseapp.com",
  projectId: "legal-port",
  storageBucket: "legal-port.firebasestorage.app",
  messagingSenderId: "999032743739",
  appId: "1:999032743739:web:bdf4552ff1ae1d85f6391e",
  measurementId: "G-4VEDZCKBLC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

export { db, auth, storage };
export default app;
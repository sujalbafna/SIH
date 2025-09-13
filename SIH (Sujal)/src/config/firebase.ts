import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAunTVx_54oc01AayAe-gW6CYWA9VdD7vE",
  authDomain: "ai-assistant-210d2.firebaseapp.com",
  projectId: "ai-assistant-210d2",
  storageBucket: "ai-assistant-210d2.firebasestorage.app",
  messagingSenderId: "623614890565",
  appId: "1:623614890565:web:b8cf585ae1558789a4492c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
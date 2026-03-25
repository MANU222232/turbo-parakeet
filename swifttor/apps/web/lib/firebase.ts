import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0800832378",
  appId: "1:276473972235:web:73538bb6070255e81f290e",
  apiKey: "AIzaSyDBBAf7S73jeC-iN0o0mCiwPKk9BSmAf2A",
  authDomain: "gen-lang-client-0800832378.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-5d5eda11-e9e3-49f8-ba99-03a007a70bac",
  storageBucket: "gen-lang-client-0800832378.firebasestorage.app",
  messagingSenderId: "276473972235",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

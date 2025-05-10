import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBW_7oWIiyXWsiUkqkQXgVidmCEtzGtFPY",
  authDomain: "frequencode.firebaseapp.com",
  projectId: "frequencode",
  storageBucket: "frequencode.firebasestorage.app",
  messagingSenderId: "244211040015",
  appId: "1:244211040015:web:223d78030ff878feb2487a",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta a instância de autenticação com persistência
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Exporta a instância do Firestore
export const db = getFirestore(app);
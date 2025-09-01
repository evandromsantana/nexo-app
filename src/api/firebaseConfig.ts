// src/api/firebaseConfig.ts

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Importa a função de autenticação
import {
  EXPO_PUBLIC_API_KEY,
  // ... outras variáveis de ambiente
} from '@env';

// Sua configuração do Firebase
const firebaseConfig = {
  apiKey: EXPO_PUBLIC_API_KEY,
  // ... resto da sua configuração
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializa e exporta os serviços que você precisa
const db = getFirestore(app);
const auth = getAuth(app); // Cria a instância de autenticação

export { db, auth }; // Exporta ambos
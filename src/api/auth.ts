import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut, // Renomeado para evitar conflito de nomes
  UserCredential
} from 'firebase/auth';
import { auth } from './firebaseConfig';

/**
 * Registra um novo usuário com e-mail e senha.
 */
export const register = (email: string, pass: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, pass);
};

/**
 * Autentica um usuário existente com e-mail e senha.
 */
export const login = (email: string, pass: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, pass);
};

/**
 * Desconecta o usuário atualmente logado.
 */
export const signOut = (): Promise<void> => {
  return firebaseSignOut(auth);
};
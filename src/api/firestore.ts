// src/api/firestore.ts

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
} from 'firebase/firestore';
import { db } from './firebaseConfig'; // Sua configuração do Firestore

// Importe seus tipos centralizados de 'src/types/index.ts'
// Ex: import { UserProfile, IMessage, UserInfo, Chat } from '../types';

// =================================================================
// --- Funções de Gerenciamento de Usuário ---
// =================================================================

/**
 * Cria o documento de perfil para um novo usuário no Firestore.
 * @param uid - O ID do usuário (vindo do Firebase Auth).
 * @param data - Os dados do perfil do usuário a serem salvos.
 */
export const createUserProfile = async (uid: string, data: any): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    uid,
    ...data,
    createdAt: serverTimestamp(), // Adiciona um timestamp de criação
  });
};

/**
 * Busca os dados de perfil de um usuário específico.
 * @param uid - O ID do usuário a ser buscado.
 */
export const getUserProfile = async (uid: string): Promise<any | null> => {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.warn('No such user!');
    return null;
  }
};

/**
 * Atualiza os dados de perfil de um usuário.
 * @param uid - O ID do usuário a ser atualizado.
 * @param data - Os dados a serem mesclados com o perfil existente.
 */
export const updateUserProfile = async (uid: string, data: any): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
};


// =================================================================
// --- Funções de Chat ---
// =================================================================

/**
 * Cria uma sala de chat entre dois usuários se ela não existir.
 * Retorna o ID da sala de chat.
 * @param user1 - Objeto com informações do primeiro usuário { uid, name, avatarUrl }.
 * @param user2 - Objeto com informações do segundo usuário { uid, name, avatarUrl }.
 */
export const createChatRoom = async (user1: any, user2: any): Promise<string> => {
  const chatId = [user1.uid, user2.uid].sort().join('_');
  const chatRef = doc(db, 'chats', chatId);
  const docSnap = await getDoc(chatRef);

  if (!docSnap.exists()) {
    await setDoc(chatRef, {
      participants: [user1.uid, user2.uid],
      participantInfo: [
        { uid: user1.uid, name: user1.name, avatarUrl: user1.avatarUrl },
        { uid: user2.uid, name: user2.name, avatarUrl: user2.avatarUrl },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
    });
  }

  return chatId;
};

/**
 * Escuta em tempo real todas as salas de chat de um usuário específico.
 * @param userId - O ID do usuário logado.
 * @param callback - Função a ser chamada com a lista de chats atualizada.
 * @returns A função de 'unsubscribe' para parar de ouvir as atualizações.
 */
export const listenForUserChats = (userId: string, callback: (chats: any[]) => void) => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const chats = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(chats);
  });

  return unsubscribe;
};

/**
 * Adiciona uma nova mensagem a uma sala de chat e atualiza os metadados.
 * @param chatId - O ID da sala de chat.
 * @param message - O objeto da mensagem (compatível com GiftedChat).
 */
export const sendMessage = async (chatId: string, message: any) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  await addDoc(messagesRef, message);

  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    lastMessage: {
      text: message.text,
      createdAt: message.createdAt,
      senderId: message.user._id,
    },
    updatedAt: message.createdAt,
  });
};

/**
 * Escuta em tempo real todas as mensagens de uma sala de chat específica.
 * @param chatId - O ID da sala de chat.
 * @param callback - Função a ser chamada com a lista de mensagens atualizada.
 * @returns A função de 'unsubscribe'.
 */
export const listenForChatMessages = (chatId: string, callback: (messages: any[]) => void) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        _id: doc.id,
        text: data.text,
        createdAt: (data.createdAt as Timestamp).toDate(),
        user: data.user,
      };
    });
    callback(messages);
  });

  return unsubscribe;
};


// =================================================================
// --- Funções de Propostas (Futuro) ---
// =================================================================

// Aqui entrarão as funções para criar, aceitar e gerenciar propostas de troca.
// ex: export const createProposal = async (...) => { ... }
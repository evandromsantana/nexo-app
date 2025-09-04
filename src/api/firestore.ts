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
  getDocs,
  writeBatch,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from './firebaseConfig'; // Sua configuração do Firestore


// Importa todos os tipos necessários do arquivo central
import { IMessage } from 'react-native-gifted-chat';
import { 
  UserProfile, 
  Message, 
  UserInfo, 
  Chat, 
  EarnedBadge, 
  Badge, 
  Proposal,
  MeetingPoint,
  Review
} from '../types';

// =================================================================
// --- Funções de Gerenciamento de Usuário e Perfil ---
// =================================================================

/**
 * Cria o documento de perfil para um novo usuário no Firestore.
 */
export const createUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...data,
    uid,
    createdAt: serverTimestamp(),
  }, { merge: true });
};

/**
 * Busca os dados de perfil de um usuário específico.
 */
export const getUserProfile = async (uid:string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as UserProfile;
  } else {
    console.warn(`Perfil de usuário com UID ${uid} não encontrado!`);
    return null;
  }
};

/**
 * Atualiza os dados de perfil de um usuário.
 */
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
};

/**
 * Busca múltiplos usuários pelos seus IDs.
 */
export const getUsersByIds = async (uids: string[]): Promise<Map<string, UserProfile>> => {
  const usersMap = new Map<string, UserProfile>();
  if (uids.length === 0) return usersMap;

  const usersRef = collection(db, 'users');
  // Firestore 'in' queries are limited to 30 items. For more, batching is needed.
  const q = query(usersRef, where('id', 'in', uids.slice(0, 30)));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    usersMap.set(doc.id, { id: doc.id, ...doc.data() } as UserProfile);
  });

  return usersMap;
};

/**
 * Busca usuários pelo nome, excluindo o usuário atual.
 */
export const searchUsers = async (searchText: string, currentUserId: string): Promise<{ nameMatches: UserProfile[], skillMatches: UserProfile[] }> => {
  if (!searchText.trim()) {
    return { nameMatches: [], skillMatches: [] };
  }

  const usersRef = collection(db, 'users');
  const lowercasedSearchText = searchText.toLowerCase();

  // Search by name
  const nameQuery = query(
    usersRef,
    where('name_lowercase', '>=', lowercasedSearchText),
    where('name_lowercase', '<=', lowercasedSearchText + '\uf8ff')
  );

  // Search by skills
  const skillQuery = query(
    usersRef,
    where('skills', 'array-contains', lowercasedSearchText)
  );

  const [nameSnapshot, skillSnapshot] = await Promise.all([
    getDocs(nameQuery),
    getDocs(skillQuery)
  ]);

  const nameMatches = nameSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
    .filter(user => user.id !== currentUserId);

  const skillMatches = skillSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
    .filter(user => user.id !== currentUserId);

  return { nameMatches, skillMatches };
};

/**
 * Busca usuários sugeridos de forma paginada.
 */
export const getSuggestedUsers = async (startAfterDoc: any, pageSize: number): Promise<{ users: UserProfile[], lastVisible: any }> => {
  const usersRef = collection(db, 'users');
  let q = query(usersRef, orderBy('createdAt', 'desc'), limit(pageSize));

  if (startAfterDoc) {
    q = query(usersRef, orderBy('createdAt', 'desc'), startAfter(startAfterDoc), limit(pageSize));
  }

  const querySnapshot = await getDocs(q);

  const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
  const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

  return { users, lastVisible };
};

// =================================================================
// --- Funções de Badges ---
// =================================================================

/**
 * Busca todos os badges que um usuário ganhou.
 */
export const getEarnedBadges = async (uid: string): Promise<EarnedBadge[]> => {
  const badgesRef = collection(db, 'users', uid, 'earnedBadges');
  const querySnapshot = await getDocs(badgesRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EarnedBadge[];
};

/**
 * Busca os detalhes de um badge específico da coleção principal de badges.
 */
export const getBadgeDetails = async (badgeId: string): Promise<Badge | null> => {
  const badgeRef = doc(db, 'badges', badgeId);
  const docSnap = await getDoc(badgeRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Badge;
  } else {
    console.warn(`Badge com ID ${badgeId} não encontrado.`);
    return null;
  }
};

// =================================================================
// --- Funções de Chat ---
// =================================================================

/**
 * Ouve em tempo real as conversas de um usuário.
 */
export const listenForUserChats = (
  userId: string,
  callback: (chats: Chat[]) => void,
  onError: (error: Error) => void
) => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Chat[];
    callback(chats);
  }, onError);
};

/**
 * Cria uma sala de chat entre dois usuários se ela não existir.
 */
export const createChatRoom = async (user1: UserInfo, user2: UserInfo): Promise<string> => {
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
    }, { merge: true });
  }
  return chatId;
};

/**
 * Envia uma nova mensagem e atualiza o 'lastMessage' do chat.
 */
export const sendMessage = async (chatId: string, senderId: string, text: string): Promise<void> => {
  const chatRef = doc(db, 'chats', chatId);
  
  const newMessage: Omit<Message, 'id'> = {
      senderId,
      text,
      createdAt: serverTimestamp() as Timestamp
  }

  const batch = writeBatch(db);
  const newMessageDocRef = doc(collection(db, 'chats', chatId, 'messages'));
  batch.set(newMessageDocRef, newMessage);

  batch.update(chatRef, {
    lastMessage: {
      text: text,
      senderId: senderId,
      createdAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });
  
  await batch.commit();
};

/**
 * Ouve em tempo real as mensagens de um chat.
 */
export const listenForChatMessages = (
  chatId: string,
  callback: (messages: IMessage[]) => void,
  onError: (error: Error) => void
) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        _id: doc.id,
        text: data.text,
        createdAt: (data.createdAt as Timestamp).toDate(),
        user: {
          _id: data.senderId,
        },
      };
    }) as IMessage[];
    callback(messages);
  }, onError);
};
  

// =================================================================
// --- Funções de Ponto de Encontro ---
// =================================================================

/**
 * Sugere um novo ponto de encontro em um chat.
 */
export const suggestMeetingPoint = async (
  chatId: string,
  senderId: string,
  location: string,
  dateTime: Date
): Promise<void> => {
  const meetingPointsRef = collection(db, 'chats', chatId, 'meetingPoints');
  await addDoc(meetingPointsRef, {
    senderId,
    location,
    dateTime: Timestamp.fromDate(dateTime),
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

/**
 * Ouve em tempo real os pontos de encontro de um chat.
 */
export const getMeetingPoints = (
  chatId: string,
  callback: (meetingPoints: MeetingPoint[]) => void,
  onError: (error: Error) => void
) => {
  const meetingPointsRef = collection(db, 'chats', chatId, 'meetingPoints');
  const q = query(meetingPointsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const points = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MeetingPoint[];
    callback(points);
  }, onError);
};

/**
 * Atualiza o status de um ponto de encontro (aceito/rejeitado).
 */
export const updateMeetingPointStatus = async (
  chatId: string,
  meetingPointId: string,
  status: 'accepted' | 'rejected'
): Promise<void> => {
  const meetingPointRef = doc(db, 'chats', chatId, 'meetingPoints', meetingPointId);
  await updateDoc(meetingPointRef, { status });
};

// =================================================================
// --- Funções de Propostas ---
// =================================================================

/**
 * Cria uma nova proposta de troca no Firestore.
 */
export const createProposal = async (proposalData: Omit<Proposal, 'id' | 'createdAt'>): Promise<void> => {
  const proposalsRef = collection(db, 'proposals');
  await addDoc(proposalsRef, {
    ...proposalData,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

/**
 * Ouve em tempo real as propostas recebidas por um usuário.
 */
export const getReceivedProposals = (
  userId: string,
  callback: (proposals: Proposal[]) => void,
  onError: (error: Error) => void
) => {
  const proposalsRef = collection(db, 'proposals');
  const q = query(proposalsRef, where('receiverId', '==', userId), where('status', 'in', ['pending', 'accepted']));
  return onSnapshot(q, (snapshot) => {
    const proposals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Proposal[];
    callback(proposals);
  }, onError);
};

/**
 * Ouve em tempo real as propostas enviadas por um usuário.
 */
export const getSentProposals = (
  userId: string,
  callback: (proposals: Proposal[]) => void,
  onError: (error: Error) => void
) => {
  const proposalsRef = collection(db, 'proposals');
  const q = query(proposalsRef, where('senderId', '==', userId));

  return onSnapshot(q, async (snapshot) => {
    const proposals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Proposal[];

    // Enrich proposals with receiver profile information
    const receiverIds = [...new Set(proposals.map(p => p.receiverId))];
    if (receiverIds.length > 0) {
      const receiversMap = await getUsersByIds(receiverIds);
      proposals.forEach(proposal => {
        proposal.receiverProfile = receiversMap.get(proposal.receiverId);
      });
    }

    callback(proposals);
  }, onError);
};

/**
 * Atualiza o status de uma proposta.
 */
export const updateProposalStatus = async (proposalId: string, status: Proposal['status']): Promise<void> => {
  const proposalRef = doc(db, 'proposals', proposalId);
  await updateDoc(proposalRef, { status });
};

/**
 * Aceita uma proposta, atualiza seu status e cria a sala de chat.
 */
export const acceptProposal = async (proposal: Proposal): Promise<void> => {
  const { id: proposalId, senderId, receiverId } = proposal;
  
  const senderProfile = await getUserProfile(senderId);
  const receiverProfile = await getUserProfile(receiverId);

  if (!senderProfile || !receiverProfile) {
    throw new Error("Não foi possível encontrar os perfis dos usuários.");
  }

  const user1: UserInfo = { uid: senderProfile.id, name: senderProfile.name || 'Usuário', avatarUrl: senderProfile.avatarUrl || '' };
  const user2: UserInfo = { uid: receiverProfile.id, name: receiverProfile.name || 'Usuário', avatarUrl: receiverProfile.avatarUrl || '' };

  const batch = writeBatch(db);
  
  const proposalRef = doc(db, 'proposals', proposalId);
  batch.update(proposalRef, { status: 'accepted' });
  
  // Cria o chat usando a função createChatRoom para consistência
  const chatId = [user1.uid, user2.uid].sort().join('_');
  const chatRef = doc(db, 'chats', chatId);
  batch.set(chatRef, {
      participants: [user1.uid, user2.uid],
      participantInfo: [
        { uid: user1.uid, name: user1.name, avatarUrl: user1.avatarUrl },
        { uid: user2.uid, name: user2.name, avatarUrl: user2.avatarUrl },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
  }, { merge: true });
  
  await batch.commit();
};

/**
 * Conclui uma proposta (deve ser uma Cloud Function para segurança).
 */
export const completeProposal = async (
  proposalId: string,
  studentId: string,
  teacherId: string,
  hours: number
): Promise<void> => {
  const proposalRef = doc(db, 'proposals', proposalId);
  await updateDoc(proposalRef, { status: 'completed' });
  console.log(`Simulando transferência de ${hours}h de ${studentId} para ${teacherId}`);
};


// =================================================================
// --- Funções de Avaliações (Reviews) ---
// =================================================================

/**
 * Busca todas as avaliações para um usuário específico.
 */
export const getReviewsForUser = async (userId: string): Promise<Review[]> => {
  const reviewsRef = collection(db, 'reviews');
  const q = query(reviewsRef, where('revieweeId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const reviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  
  // Para cada avaliação, buscar o perfil de quem a fez
  const reviewerIds = [...new Set(reviews.map(r => r.reviewerId))];
  if (reviewerIds.length > 0) {
    const reviewersMap = await getUsersByIds(reviewerIds);
    reviews.forEach(review => {
      review.reviewerProfile = reviewersMap.get(review.reviewerId);
    });
  }

  return reviews;
};

/**
 * Cria uma nova avaliação no Firestore.
 */
export const createReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<void> => {
    const reviewsRef = collection(db, 'reviews');
    await addDoc(reviewsRef, {
      ...reviewData,
      createdAt: serverTimestamp(),
    });
  };
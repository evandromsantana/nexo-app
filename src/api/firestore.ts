import {
  getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit, onSnapshot, runTransaction, documentId, startAfter, DocumentData
} from "firebase/firestore";
import app from './firebase.ts';
// Lembre-se de que seu arquivo de tipos deve conter todas estas interfaces
import { UserProfile, Proposal, Review, Message, EarnedBadge, Badge, MeetingPoint, Notification, Chat } from '../types';

const db = getFirestore(app);

//================================================================
// SERVIÇOS DE USUÁRIO
//================================================================

/**
 * Cria um perfil de usuário no Firestore, garantindo a consistência dos campos lowercase.
 */
export const createUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);

    // Garante que os campos lowercase sejam criados a partir dos dados base
    const dataToCreate = {
      ...profileData,
      name_lowercase: profileData.name ? profileData.name.toLowerCase() : '',
      email_lowercase: profileData.email ? profileData.email.toLowerCase() : '',
      skills_lowercase: profileData.skills ? profileData.skills.map(s => s.toLowerCase()) : [],
      timeBalance: profileData.timeBalance || 0,
      skills: profileData.skills || [],
      completedTradesCount: 0,
      completedTradesAsTeacher: 0,
      createdAt: serverTimestamp()
    };

    await setDoc(userDocRef, dataToCreate);
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

/**
 * Recupera o perfil de um usuário.
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

/**
 * Recupera múltiplos perfis de usuário a partir de uma lista de IDs.
 */
export const getUsersByIds = async (userIds: string[]): Promise<Map<string, UserProfile>> => {
  try {
    const usersMap = new Map<string, UserProfile>();
    if (!userIds || userIds.length === 0) {
      return usersMap;
    }
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where(documentId(), 'in', userIds));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      usersMap.set(doc.id, { id: doc.id, ...doc.data() } as UserProfile);
    });
    return usersMap;
  } catch (error) {
    console.error("Error getting users by IDs:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

/**
 * Atualiza o perfil de um usuário, garantindo a consistência dos campos lowercase.
 */
export const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);

    // Prepara os dados para atualização, garantindo que os campos lowercase sejam atualizados
    // sempre que os campos base forem alterados.
    const dataToUpdate: { [key: string]: any } = { ...profileData };

    if (profileData.name !== undefined) {
      dataToUpdate.name_lowercase = profileData.name.toLowerCase();
    }
    if (profileData.email !== undefined) {
      dataToUpdate.email_lowercase = profileData.email.toLowerCase();
    }
    if (profileData.skills !== undefined) {
      dataToUpdate.skills_lowercase = profileData.skills.map(s => s.toLowerCase());
    }

    await setDoc(userDocRef, dataToUpdate, { merge: true });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Busca usuários por nome, email ou habilidade (case-insensitive).
 */
export const searchUsers = async (queryString: string): Promise<{nameMatches: UserProfile[], skillMatches: UserProfile[]}> => {
  try {
    const normalizedQuery = queryString.trim();
    const lowercaseQuery = normalizedQuery.toLowerCase();

    if (!lowercaseQuery) {
      return { nameMatches: [], skillMatches: [] };
    }

    const usersRef = collection(db, 'users');
    const nameMatches = new Map<string, UserProfile>();
    const skillMatches = new Map<string, UserProfile>();

    // Query por nome (case-insensitive prefix)
    const nameQuery = query(usersRef, where('name_lowercase', '>=', lowercaseQuery), where('name_lowercase', '<=', lowercaseQuery + '\uf8ff'));
    
    // Query por email (case-insensitive prefix)
    const emailQuery = query(usersRef, where('email_lowercase', '>=', lowercaseQuery), where('email_lowercase', '<=', lowercaseQuery + '\uf8ff'));
    
    // Query por habilidade exata (case-insensitive)
    const skillQuery = query(usersRef, where('skills_lowercase', 'array-contains', lowercaseQuery));

    const [nameSnapshot, emailSnapshot, skillSnapshot] = await Promise.all([
      getDocs(nameQuery),
      getDocs(emailQuery),
      getDocs(skillQuery),
    ]);

    nameSnapshot.forEach((doc) => nameMatches.set(doc.id, { id: doc.id, ...doc.data() } as UserProfile));
    emailSnapshot.forEach((doc) => nameMatches.set(doc.id, { id: doc.id, ...doc.data() } as UserProfile));
    skillSnapshot.forEach((doc) => skillMatches.set(doc.id, { id: doc.id, ...doc.data() } as UserProfile));

    // Remove users found by skill from nameMatches to avoid duplicates in display
    skillMatches.forEach((_, key) => {
      if (nameMatches.has(key)) {
        nameMatches.delete(key);
      }
    });

    return {
      nameMatches: Array.from(nameMatches.values()),
      skillMatches: Array.from(skillMatches.values())
    };
  } catch (error) {
    console.error("Error searching users:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

/**
 * Busca usuários sugeridos para a tela inicial.
 */
export const getSuggestedUsers = async (lastVisibleDoc: DocumentData | null, pageSize: number = 10): Promise<{ users: UserProfile[], lastVisible: DocumentData | null }> => {
  try {
    const usersRef = collection(db, 'users');
    let q = query(usersRef, where('skills', '!=', []), orderBy('skills'), orderBy('createdAt', 'desc'));

    if (lastVisibleDoc) {
      q = query(q, startAfter(lastVisibleDoc));
    }

    q = query(q, limit(pageSize));

    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => users.push({ id: doc.id, ...doc.data() } as UserProfile));

    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { users, lastVisible: newLastVisible };
  } catch (error) {
    console.error("Error getting suggested users:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

//================================================================
// SERVIÇOS DE PROPOSTAS
//================================================================

export const createProposal = async (senderId: string, receiverId: string, skillOffered: string, skillRequested: string, message: string): Promise<void> => {
  try {
    const proposalsRef = collection(db, 'proposals');
    const newProposalRef = await addDoc(proposalsRef, {
      senderId, receiverId, skillOffered, skillRequested, message,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    await createNotification(receiverId, `Você recebeu uma nova proposta!`, 'proposal', newProposalRef.id);
  } catch (error) {
    console.error("Error creating proposal:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

export const getSentProposals = (userId: string, callback: (proposals: Proposal[]) => void): () => void => {
  const proposalsRef = collection(db, 'proposals');
  const q = query(proposalsRef, where('senderId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const proposals: Proposal[] = [];
    snapshot.forEach((doc) => proposals.push({ id: doc.id, ...doc.data() } as Proposal));
    callback(proposals);
  }, (error) => {
    console.error("Error listening to sent proposals:", error);
  });
};

export const getReceivedProposals = (userId: string, callback: (proposals: Proposal[]) => void): () => void => {
  const proposalsRef = collection(db, 'proposals');
  const q = query(proposalsRef, where('receiverId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const proposals: Proposal[] = [];
    snapshot.forEach((doc) => proposals.push({ id: doc.id, ...doc.data() } as Proposal));
    callback(proposals);
  }, (error) => {
    console.error("Error listening to received proposals:", error);
  });
};

export const updateProposalStatus = async (proposalId: string, newStatus: Proposal['status']): Promise<void> => {
  try {
    const proposalDocRef = doc(db, 'proposals', proposalId);
    await updateDoc(proposalDocRef, { status: newStatus });
  } catch (error) {
    console.error("Error updating proposal status:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

export const cancelProposal = async (proposalId: string, userId: string): Promise<void> => {
  try {
    const proposalRef = doc(db, 'proposals', proposalId);
    const proposalSnap = await getDoc(proposalRef);
    if (!proposalSnap.exists()) throw new Error("Proposta não encontrada.");
    const proposal = proposalSnap.data() as Proposal;
    if (proposal.senderId !== userId) throw new Error("Apenas quem enviou a proposta pode cancelá-la.");
    if (proposal.status !== 'pending') throw new Error(`A proposta não pode ser cancelada pois seu status é '${proposal.status}'.`);
    await updateProposalStatus(proposalId, 'canceled');
  } catch (error) {
    console.error("Error canceling proposal:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

const checkAndAwardBadges = async (userId: string, updatedProfile: Partial<UserProfile>, transaction: any) => {
    if (updatedProfile.completedTradesCount === 1) {
        const badgeRef = doc(collection(db, 'users', userId, 'earnedBadges'));
        transaction.set(badgeRef, { badgeId: 'first_trade', earnedAt: serverTimestamp() });
    }
    if (updatedProfile.completedTradesAsTeacher === 10) {
        const badgeRef = doc(collection(db, 'users', userId, 'earnedBadges'));
        transaction.set(badgeRef, { badgeId: 'master_teacher', earnedAt: serverTimestamp() });
    }
};

export const completeProposal = async (proposalId: string, studentId: string, teacherId: string, hours: number): Promise<void> => {
  if (typeof hours !== 'number' || hours <= 0) throw new Error("As horas devem ser um número positivo.");
  if (!studentId || !teacherId) throw new Error("ID do aluno e do professor são obrigatórios.");

  const proposalRef = doc(db, 'proposals', proposalId);
  const studentRef = doc(db, 'users', studentId);
  const teacherRef = doc(db, 'users', teacherId);

  await runTransaction(db, async (transaction) => {
    const [proposalDoc, studentDoc, teacherDoc] = await Promise.all([
      transaction.get(proposalRef),
      transaction.get(studentRef),
      transaction.get(teacherRef)
    ]);

    if (!proposalDoc.exists()) throw new Error("Proposta não encontrada!");
    if (!studentDoc.exists() || !teacherDoc.exists()) throw new Error("Usuário (aluno ou professor) não encontrado!");

    const proposalData = proposalDoc.data() as Proposal;
    if (proposalData.status !== 'accepted' && proposalData.status !== 'scheduled') {
      throw new Error(`A proposta precisa estar 'aceita' ou 'agendada'. Status: ${proposalData.status}`);
    }

    const studentData = studentDoc.data() as UserProfile;
    const teacherData = teacherDoc.data() as UserProfile;
    if (studentData.timeBalance < hours) throw new Error(`Saldo insuficiente. Saldo: ${studentData.timeBalance}, Horas: ${hours}`);

    const updatedStudentProfile: Partial<UserProfile> = {
      timeBalance: studentData.timeBalance - hours,
      completedTradesCount: (studentData.completedTradesCount || 0) + 1,
    };
    const updatedTeacherProfile: Partial<UserProfile> = {
      timeBalance: teacherData.timeBalance + hours,
      completedTradesCount: (teacherData.completedTradesCount || 0) + 1,
      completedTradesAsTeacher: (teacherData.completedTradesAsTeacher || 0) + 1,
    };

    transaction.update(proposalRef, { status: 'completed', completedAt: serverTimestamp() });
    transaction.update(studentRef, updatedStudentProfile);
    transaction.update(teacherRef, updatedTeacherProfile);

    await checkAndAwardBadges(studentId, updatedStudentProfile, transaction);
    await checkAndAwardBadges(teacherId, updatedTeacherProfile, transaction);
  });
};

export const getSentProposalsPaginated = async (userId: string, lastVisible: DocumentData | null) => {
  try {
    const proposalsRef = collection(db, 'proposals');
    const q = lastVisible
        ? query(proposalsRef, where('senderId', '==', userId), orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(20))
        : query(proposalsRef, where('senderId', '==', userId), orderBy('createdAt', 'desc'), limit(20));
    const snapshots = await getDocs(q);
    const proposals: Proposal[] = [];
    snapshots.forEach(doc => proposals.push({ id: doc.id, ...doc.data() } as Proposal));
    const newLastVisible = snapshots.docs[snapshots.docs.length - 1] || null;
    return { proposals, lastVisible: newLastVisible };
  } catch (error) {
    console.error("Error getting paginated sent proposals:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

//================================================================
// SERVIÇOS DE CHAT E MENSAGENS
//================================================================

export const acceptProposal = async (proposalId: string, acceptorId: string): Promise<void> => {
  const proposalRef = doc(db, 'proposals', proposalId);
  const chatRef = doc(db, 'chats', proposalId); // O ID do chat é o ID da proposta

  await runTransaction(db, async (transaction) => {
    const proposalDoc = await transaction.get(proposalRef);
    if (!proposalDoc.exists()) {
      throw new Error("Proposta não encontrada.");
    }

    const proposal = proposalDoc.data() as Proposal;

    if (proposal.receiverId !== acceptorId) {
      throw new Error("Apenas o destinatário pode aceitar a proposta.");
    }
    if (proposal.status !== 'pending') {
      throw new Error(`A proposta não pode ser aceita pois seu status é '${proposal.status}'.`);
    }

    // 1. Atualiza o status da proposta e adiciona o ID do chat
    transaction.update(proposalRef, { status: 'accepted', chatId: proposalId });

    // 2. Cria o novo chat
    transaction.set(chatRef, {
      participants: [proposal.senderId, proposal.receiverId],
      createdAt: serverTimestamp(),
      proposalId: proposalId, // Link para a proposta
    });

    // 3. Adiciona a mensagem inicial ao chat
    const messagesRef = collection(chatRef, 'messages');
    const initialMessageRef = doc(messagesRef);
    transaction.set(initialMessageRef, {
      senderId: proposal.senderId,
      text: proposal.message,
      createdAt: proposal.createdAt, // Usa a data de criação da proposta
    });
    
    // 4. Atualiza a última mensagem no chat
    transaction.update(chatRef, {
        lastMessage: {
            text: proposal.message,
            senderId: proposal.senderId,
            createdAt: proposal.createdAt,
        }
    });

    // 5. Cria notificação para o remetente
    await createNotification(proposal.senderId, `Sua proposta foi aceita!`, 'proposal', proposalId);
  });
};

export const sendMessage = async (chatId: string, senderId: string, text: string, receiverId: string): Promise<void> => {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const chatRef = doc(db, 'chats', chatId);

    // Adiciona a nova mensagem à subcoleção de mensagens
    await addDoc(messagesRef, { senderId, text, createdAt: serverTimestamp() });

    const lastMessageData = {
      lastMessage: { text, senderId, createdAt: serverTimestamp() }
    };

    // Verifica se o documento do chat principal existe
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
      // Se existir, apenas atualiza a última mensagem
      await updateDoc(chatRef, lastMessageData);
    } else {
      // Se não existir (fallback para a condição de corrida), cria o documento do chat completo
      await setDoc(chatRef, {
        participants: [senderId, receiverId],
        proposalId: chatId, // Assume que o chatId é o proposalId
        createdAt: serverTimestamp(), // O chat é criado com a primeira mensagem pós-aceite
        lastMessage: lastMessageData.lastMessage
      });
    }

    // Cria a notificação para o destinatário
    await createNotification(receiverId, `Você tem uma nova mensagem.`, 'chat', chatId);

  } catch (error) {
    console.error("Error sending message:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

export const getMessages = (chatId: string, callback: (messages: Message[]) => void): () => void => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => messages.push({ id: doc.id, ...doc.data() } as Message));
    callback(messages);
  }, (error) => {
    console.error("Error listening to messages:", error);
  });
};

export const getChatsForUser = (userId: string, callback: (chats: Chat[]) => void): () => void => {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId), orderBy('lastMessage.createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const chats: Chat[] = [];
        snapshot.forEach((doc) => chats.push({ id: doc.id, ...doc.data() } as Chat));
        callback(chats);
    }, (error) => {
        console.error("Error listening to chats for user:", error);
    });
};

//================================================================
// SERVIÇOS DE PONTO DE ENCONTRO
//================================================================

export const suggestMeetingPoint = async (chatId: string, senderId: string, location: string, dateTime: Date): Promise<void> => {
  try {
    const meetingPointsRef = collection(db, 'chats', chatId, 'meetingPoints');
    await addDoc(meetingPointsRef, {
      senderId,
      location,
      dateTime, // O Firestore SDK converte Date para Timestamp automaticamente
      status: 'pending',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error suggesting meeting point:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

export const getMeetingPoints = (chatId: string, callback: (meetingPoints: MeetingPoint[]) => void): () => void => {
  const meetingPointsRef = collection(db, 'chats', chatId, 'meetingPoints');
  const q = query(meetingPointsRef, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (querySnapshot) => {
    const meetingPoints: MeetingPoint[] = [];
    querySnapshot.forEach((doc) => {
      meetingPoints.push({ id: doc.id, ...doc.data() } as MeetingPoint);
    });
    callback(meetingPoints);
  }, (error) => {
    console.error("Error listening to meeting points:", error);
  });
};

export const updateMeetingPointStatus = async (chatId: string, meetingPointId: string, newStatus: 'accepted' | 'rejected'): Promise<void> => {
  try {
    const meetingPointDocRef = doc(db, 'chats', chatId, 'meetingPoints', meetingPointId);
    await updateDoc(meetingPointDocRef, { status: newStatus });
  } catch (error) {
    console.error("Error updating meeting point status:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

//================================================================
// SERVIÇOS DE AVALIAÇÕES
//================================================================

export const createReview = async (proposalId: string, reviewerId: string, revieweeId: string, rating: number, comment: string): Promise<any> => {
  try {
    await createNotification(revieweeId, `Você recebeu uma nova avaliação!`, 'review', proposalId);
    const reviewsRef = collection(db, 'reviews');
    return await addDoc(reviewsRef, {
        proposalId, reviewerId, revieweeId, rating, comment,
        createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating review:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

export const getReviewsForUser = async (userId: string): Promise<Review[]> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('revieweeId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const reviews: Review[] = [];
    snapshot.forEach((doc) => reviews.push({ id: doc.id, ...doc.data() } as Review));
    return reviews;
  } catch (error) {
    console.error("Error getting reviews for user:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

//================================================================
// SERVIÇOS DE BADGES
//================================================================

export const awardBadge = async (userId: string, badgeId: string): Promise<void> => {
  try {
    const userBadgesRef = collection(db, 'users', userId, 'earnedBadges');
    const q = query(userBadgesRef, where('badgeId', '==', badgeId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      await addDoc(userBadgesRef, { badgeId, earnedAt: serverTimestamp() });
    }
  } catch (error) {
    console.error("Error awarding badge:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

// Em firestore.ts

export const getEarnedBadges = async (userId: string): Promise<EarnedBadge[]> => {
  try {
    const userBadgesRef = collection(db, 'users', userId, 'earnedBadges');
    const q = query(userBadgesRef, orderBy('earnedAt', 'desc'));
    const snapshot = await getDocs(q);
    const earnedBadges: EarnedBadge[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      // Em vez de uma conversão forçada, construímos o objeto explicitamente.
      // Isso garante que todos os campos da interface EarnedBadge estão sendo considerados.
      earnedBadges.push({
        id: doc.id,
        badgeId: data.badgeId,
        earnedAt: data.earnedAt,
      });
    });
    
    return earnedBadges;
  } catch (error) {
    console.error("Error getting earned badges:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

export const getBadgeDetails = async (badgeId: string): Promise<Badge | null> => {
  try {
    const badgeDocRef = doc(db, 'badges', badgeId);
    const docSnap = await getDoc(badgeDocRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Badge;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting badge details:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

export const initializeDefaultBadges = async (): Promise<void> => {
  try {
    const defaultBadges = [
      { id: 'first_trade', name: 'Primeira Troca', description: 'Concluiu sua primeira troca de habilidades!', icon: 'trophy' },
      { id: 'master_teacher', name: 'Mestre Ensinador', description: 'Concluiu 10 trocas como professor.', icon: 'star' },
    ];
    for (const badge of defaultBadges) {
      const badgeDocRef = doc(db, 'badges', badge.id);
      await setDoc(badgeDocRef, badge, { merge: true });
    }
    console.log("Badges padrão inicializados.");
  } catch (error) {
    console.error("Error initializing default badges:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

//================================================================
// SERVIÇOS DE NOTIFICAÇÕES
//================================================================

export const createNotification = async (userId: string, message: string, type: 'proposal' | 'chat' | 'review', linkId: string): Promise<void> => {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    await addDoc(notificationsRef, { message, type, linkId, isRead: false, createdAt: serverTimestamp() });
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

export const getUnreadNotifications = (userId: string, callback: (notifications: Notification[]) => void): () => void => {
  const notificationsRef = collection(db, 'users', userId, 'notifications');
  const q = query(notificationsRef, where('isRead', '==', false), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const notifications: Notification[] = [];
    snapshot.forEach((doc) => notifications.push({ id: doc.id, ...doc.data() } as Notification));
    callback(notifications);
  }, (error) => {
    console.error("Error listening to unread notifications:", error);
  });
};

export const markNotificationAsRead = async (userId: string, notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(notificationRef, { isRead: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error; // Re-throw to allow caller to handle
  }
};
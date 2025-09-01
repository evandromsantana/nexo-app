import { Timestamp } from 'firebase/firestore';

// =================================================================
// --- Tipos de Dados Principais ---
// =================================================================

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  name_lowercase?: string;
  bio?: string;
  timeBalance: number;
  skills: string[];
  avatarUrl?: string;
  createdAt: Timestamp;
  completedTradesCount?: number;
  completedTradesAsTeacher?: number;

}

export interface OnboardingProfile extends UserProfile {
  name: string;
  skills: string[];
}

export interface Proposal {
  id: string;
  senderId: string;
  receiverId: string;
  skillOffered: string;
  skillRequested: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'scheduled' | 'completed' | 'canceled';
  createdAt: Timestamp;
  completedAt?: Timestamp;
  senderProfile?: UserProfile;
  receiverProfile?: UserProfile;
}

export interface Review {
  id: string;
  proposalId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
  reviewerProfile?: UserProfile;
}

export interface Chat {
  id: string;
  participants: string[];
  createdAt: Timestamp;
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: Timestamp;
  };
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
}

export interface MeetingPoint {
  id: string;
  chatId: string;
  senderId: string;
  location: string;
  dateTime: Timestamp;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface EarnedBadge {
  id: string;
  badgeId: string;
  earnedAt: Timestamp;
}

export interface Notification {
    id: string;
    message: string;
    type: 'proposal' | 'chat' | 'review';
    linkId: string;
    isRead: boolean;
    createdAt: Timestamp;
}


// =================================================================
// --- Tipos para Navegação (React Navigation) ---
// =================================================================

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  HomeMain: undefined;
  ProposalsMain: undefined;
  Profile: undefined; // ✅ ADICIONE ESTA LINHA
  UserProfileDetail: { userId: string; userProfile?: UserProfile };
  Proposal: { receiverId: string; receiverEmail: string };
  EditProfile: { profile: UserProfile };
  Review: { proposalId: string; revieweeId: string };
  Chat: { chatId: string; otherUserId: string };
  Notifications: undefined;
  About: undefined;
};

export interface UserInfo {
  uid: string;
  name: string;
  avatarUrl?: string;
}

export type HomeTabParamList = {
    Home: undefined; // Nome da sua tela inicial na Tab
    ProposalsMain: undefined; // Tela que contém as abas de Propostas
    Profile: undefined; // Sua tela de Perfil
};

export type ProposalsTabParamList = {
  Recebidas: undefined;
  Enviadas: undefined;
};
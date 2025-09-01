import { Timestamp } from 'firebase/firestore';

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

export interface EarnedBadge {
  id: string; // <-- ADICIONE ESTA LINHA
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

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  HomeMain: undefined;
  UserProfileDetail: { userId: string; userProfile?: UserProfile };
  Proposal: { receiverId: string; receiverEmail: string };
  EditProfile: { profile: UserProfile };
  Review: { proposalId: string; revieweeId: string };
  Chat: { chatId: string; otherUserId: string };
  ProposalsMain: undefined;
  Profile: undefined;
  Onboarding: undefined;
  Notifications: undefined;
  About: undefined;
};

export type ProposalsTabParamList = {
  Recebidas: undefined;
  Enviadas: undefined;
};
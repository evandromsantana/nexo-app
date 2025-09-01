// src/types/user.ts

export interface UserProfile {
  email?: string | null;
  name?: string;
  bio?: string;
  timeBalance?: number;
  skills?: string[];
  avatarUrl?: string | null;
}
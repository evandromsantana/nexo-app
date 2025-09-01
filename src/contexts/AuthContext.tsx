// src/contexts/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../api/firebaseConfig";

import { getUserProfile } from "../api/firestore"; // A FUNÇÃO vem da API
import { UserProfile } from "../types"; // O TIPO vem do novo arquivo

// 1. Adicione a função à interface
export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refetchUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile as UserProfile | null);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Implemente a função
  const refetchUserProfile = async () => {
    if (user) {
      // Força uma nova busca do perfil no Firestore
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile as UserProfile | null);
    }
  };

  // 3. Forneça a função no valor do contexto
  const value = { user, userProfile, loading, refetchUserProfile };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

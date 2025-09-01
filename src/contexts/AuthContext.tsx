import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../api/firebaseConfig";
import { getUserProfile } from "../api/firestore";
import { login, signOut as firebaseSignOut } from "../api/auth"; // 1. Importa as funções de login/logout
import { UserProfile } from "../types";

// 2. Adiciona as novas funções à interface do contexto
export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refetchUserProfile: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
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

  // 3. Implementa as funções de autenticação
  const signIn = async (email: string, pass: string) => {
    await login(email, pass);
    // O onAuthStateChanged cuidará de atualizar os estados user e userProfile
  };

  const signOut = async () => {
    await firebaseSignOut();
    // O onAuthStateChanged cuidará de limpar os estados
  };

  const refetchUserProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile as UserProfile | null);
    }
  };

  // 4. Fornece as novas funções no valor do contexto
  const value = {
    user,
    userProfile,
    loading,
    refetchUserProfile,
    signIn,
    signOut,
  };

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

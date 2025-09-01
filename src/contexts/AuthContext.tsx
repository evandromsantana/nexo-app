import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getUserProfile } from "../api/firestore";
import { UserProfile } from "../types";

// Interface do Contexto aprimorada
export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean; // Para o carregamento inicial
  isRefetching: boolean; // NOVO: Para atualizações
  error: Error | null; // NOVO: Para tratar erros
  refetchUserProfile: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isRefetching: false,
  error: null,
  refetchUserProfile: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefetching, setIsRefetching] = useState<boolean>(false); // NOVO
  const [error, setError] = useState<Error | null>(null); // NOVO

  const fetchUserProfile = useCallback(async (firebaseUser: User | null) => {
    if (firebaseUser) {
      try {
        setError(null); // Limpa erros anteriores
        const profile = await getUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } catch (err) {
        console.error("Error fetching user profile in AuthContext:", err);
        setUserProfile(null);
        setError(
          err instanceof Error ? err : new Error("Ocorreu um erro desconhecido")
        ); // Define o erro
      }
    } else {
      setUserProfile(null);
    }
    // O loading inicial só é finalizado após a primeira tentativa de busca
    setLoading(false);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      fetchUserProfile(firebaseUser);
    });
    return unsubscribe;
  }, [fetchUserProfile]);

  const refetchUserProfile = useCallback(async () => {
    if (user) {
      setIsRefetching(true); // Inicia o indicador de refetch
      await fetchUserProfile(user);
      setIsRefetching(false); // Finaliza o indicador
    }
  }, [user, fetchUserProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isRefetching,
        error,
        refetchUserProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import Toast from "react-native-toast-message"; // 1. Garante que o Toast está importado
import { useAuth } from "../contexts/AuthContext";
import { getEarnedBadges, getBadgeDetails } from "../api/firestore";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, UserProfile, Badge } from "../types";
import { COLORS, FONT_SIZES } from "../constants";
import AppButton from "../components/common/AppButton.tsx";
import UserProfileDisplay from "../components/specific/UserProfileDisplay.tsx";
import { getFirebaseErrorMessage } from "../utils/errorUtils";

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, "Profile">;

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  // 2. Pega a função signOut diretamente do nosso hook
  const {
    user,
    userProfile,
    loading: authLoading,
    signOut, // <<<<<<<<<<<<<<< AQUI
  } = useAuth();

  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);

  useEffect(() => {
    // ... sua lógica para buscar os badges continua a mesma, está ótima.
    const fetchBadges = async () => {
      if (!user) {
        setLoadingBadges(false);
        return;
      }
      try {
        const badges = await getEarnedBadges(user.uid);
        const badgeDetailsPromises = badges.map((badge) =>
          getBadgeDetails(badge.badgeId)
        );
        const detailedBadges = await Promise.all(badgeDetailsPromises);
        setEarnedBadges(detailedBadges.filter(Boolean) as Badge[]);
      } catch (error: unknown) {
        const errorMessage = getFirebaseErrorMessage(error);
        Toast.show({
          type: "error",
          text1: "Erro ao buscar badges",
          text2: errorMessage,
        });
      } finally {
        setLoadingBadges(false);
      }
    };

    fetchBadges();
  }, [user, userProfile]);

  // 3. A função de logout agora é muito mais simples e limpa
  const handleLogout = async () => {
    try {
      await signOut(); // Chama a função centralizada do nosso contexto
      // Nenhuma navegação manual é necessária aqui! O RootNavigator fará a mágica.
      Toast.show({
        type: "success",
        text1: "Até logo!",
        text2: "Você foi desconectado com sucesso.",
      });
    } catch (error: unknown) {
      const errorMessage = getFirebaseErrorMessage(error);
      Toast.show({
        type: "error",
        text1: "Erro de Logout",
        text2: errorMessage,
      });
    }
  };

  const handleEditProfile = (profileData: UserProfile) => {
    navigation.navigate("EditProfile", { profile: profileData });
  };

  // ... o resto do seu componente (lógica de loading e renderização) continua o mesmo.
  if (authLoading || loadingBadges) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user || !userProfile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noUserText}>
          Nenhum usuário logado ou perfil não encontrado.
        </Text>
        <AppButton
          title="Ir para Login"
          onPress={() => navigation.navigate("Login")}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>
      <UserProfileDisplay
        userProfile={userProfile}
        reviews={[]}
        earnedBadges={earnedBadges}
        isCurrentUser={true}
        onEditProfilePress={handleEditProfile}
      />
      <AppButton
        title="Sobre o App"
        onPress={() => navigation.navigate("About")}
        variant="secondary"
        style={styles.aboutButton}
      />
      <AppButton
        title="Sair"
        onPress={handleLogout}
        variant="danger"
        style={styles.logoutButton}
      />
    </View>
  );
};

// ... seus estilos continuam os mesmos.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: FONT_SIZES.h1,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.textDark,
    textAlign: "center",
  },
  logoutButton: {
    marginTop: 20,
  },
  aboutButton: {
    marginTop: 10,
  },
  noUserText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textMedium,
    marginBottom: 20,
  },
  loadingProfileText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textMedium,
  },
});

export default ProfileScreen;

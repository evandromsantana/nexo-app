import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from "react-native";
import { useAuth } from "../../hooks/useAuth.ts";
import {
  getUserProfile,
  getEarnedBadges,
  getBadgeDetails,
} from "../../api/firestore.ts";
import { getAuth, signOut } from "firebase/auth";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  RootStackParamList,
  UserProfile,
  EarnedBadge,
  Badge,
} from "../../types";
import { COLORS, FONT_SIZES } from "../../constants";
import AppButton from "../../components/common/AppButton.tsx";
import UserProfileDisplay from "../../components/specific/UserProfileDisplay.tsx";
import { FirebaseError } from "firebase/app";
import { getFirebaseErrorMessage } from "../../utils/errorUtils";

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, "Profile">;

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const { user, userProfile, loading: authLoading, refetchUserProfile } = useAuth();
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);

  useEffect(() => {
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
        Alert.alert("Erro", errorMessage);
      } finally {
        setLoadingBadges(false);
      }
    };

    fetchBadges();
  }, [user, userProfile]); // Refetch badges if user or userProfile changes

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      Toast.show({
        type: "success",
        text1: "Sucesso!",
        text2: "Logout realizado com sucesso.",
      });
      navigation.replace('Login'); // Explicitly navigate to Login screen after logout
    } catch (error: unknown) {
      const errorMessage = getFirebaseErrorMessage(error);
      Alert.alert("Erro de Logout", errorMessage);
    }
  };

  const handleEditProfile = (profileData: UserProfile) => {
    navigation.navigate("EditProfile", { profile: profileData });
  };

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
        <Text style={styles.noUserText}>Nenhum usuário logado ou perfil não encontrado.</Text>
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
      <Text style={styles.title}>Perfil do Usuário</Text>
      <UserProfileDisplay
        userProfile={userProfile}
        reviews={[]} // Reviews are not fetched/displayed on own profile
        earnedBadges={earnedBadges}
        isCurrentUser={true}
        onEditProfilePress={handleEditProfile}
      />
      <AppButton
        title="Sobre o App"
        onPress={() => navigation.navigate('About')}
        variant="secondary"
        style={styles.aboutButton}
      />
      <AppButton
        title="Logout"
        onPress={handleLogout}
        variant="danger"
        style={styles.logoutButton}
      />
    </View>
  );
};

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

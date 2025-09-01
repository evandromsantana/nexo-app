import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, Alert, StyleSheet } from "react-native";
import {
  getUserProfile,
  getReviewsForUser,
  getUsersByIds,
  getEarnedBadges,
  getBadgeDetails,
} from "../api/firestore.ts";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { COLORS, FONT_SIZES } from "../constants";
import AppButton from "../components/common/AppButton.tsx";
import UserProfileDisplay from "../components/specific/UserProfileDisplay.tsx"; // Import UserProfileDisplay
import { RootStackParamList, UserProfile, Review, Badge } from "../types";
import { getFirebaseErrorMessage } from "../utils/errorUtils";
import { useAuth } from "../contexts/AuthContext.tsx";

type UserProfileDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "UserProfileDetail"
>;

const UserProfileDetailScreen = ({
  route,
  navigation,
}: UserProfileDetailScreenProps) => {
  const { userId } = route.params;
  const { user: currentUser } = useAuth(); // Current logged-in user
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0); // New state for average rating
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const profile = await getUserProfile(userId);
        if (!profile) {
          setError("Perfil do usuário não encontrado.");
          return;
        }
        setUserProfile(profile);

        const rawReviews = await getReviewsForUser(userId);
        let calculatedAverageRating = 0; // Use a local variable for calculation
        if (rawReviews.length > 0) {
          const totalRating = rawReviews.reduce(
            (sum, review) => sum + review.rating,
            0
          );
          calculatedAverageRating = totalRating / rawReviews.length;

          const reviewerIds = [...new Set(rawReviews.map((r) => r.reviewerId))];
          const reviewersMap = await getUsersByIds(reviewerIds);

          const enrichedReviews = rawReviews.map((review) => ({
            ...review,
            reviewerEmail:
              reviewersMap.get(review.reviewerId)?.email ||
              "Usuário desconhecido",
          }));
          setReviews(enrichedReviews);
        } else {
          setReviews([]);
        }
        // Set the average rating state
        setAverageRating(calculatedAverageRating); // Set the state here

        const badges = await getEarnedBadges(userId);
        const badgeDetailsPromises = badges.map((badge) =>
          getBadgeDetails(badge.badgeId)
        );
        const detailedBadges = await Promise.all(badgeDetailsPromises);
        setEarnedBadges(detailedBadges.filter(Boolean) as Badge[]);
      } catch (err: unknown) {
        const errorMessage = getFirebaseErrorMessage(err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleProposeTrade = (receiverId: string, receiverEmail: string) => {
    navigation.navigate("Proposal", { receiverId, receiverEmail });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Perfil não disponível.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil de {userProfile.email}</Text>

      <UserProfileDisplay
        userProfile={userProfile}
        reviews={reviews}
        earnedBadges={earnedBadges}
        averageRating={averageRating} // Pass average rating
        isCurrentUser={currentUser?.uid === userId}
        onProposeTradePress={handleProposeTrade}
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
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZES.body,
  },
});

export default UserProfileDetailScreen;

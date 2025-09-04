import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { UserProfile, Review, Badge } from "../../types";
import { COLORS, FONT_SIZES } from "../../constants";
import AppButton from "../common/AppButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface UserProfileDisplayProps {
  userProfile: UserProfile;
  reviews: Review[];
  earnedBadges: Badge[];
  isCurrentUser: boolean;
  averageRating?: number;
  onEditProfilePress?: (profile: UserProfile) => void;
  onProposeTradePress?: (receiverId: string, receiverEmail: string) => void;
}

const ProfileHeader: React.FC<
  Omit<
    UserProfileDisplayProps,
    "isCurrentUser" | "onEditProfilePress" | "onProposeTradePress"
  >
> = ({ userProfile, reviews, earnedBadges, averageRating }) => (
  <View>
    <View style={styles.profileDetails}>
      <Text style={styles.profileTitle}>Detalhes do Perfil</Text>
      <View style={styles.avatarContainer}>
        {userProfile.avatarUrl ? (
          <Image
            source={{ uri: userProfile.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>Sem Foto</Text>
          </View>
        )}
      </View>
      <Text style={styles.detailText}>Email: {userProfile.email}</Text>
      {userProfile.name && (
        <Text style={styles.detailText}>Nome: {userProfile.name}</Text>
      )}
      {userProfile.bio && (
        <Text style={styles.detailText}>Bio: {userProfile.bio}</Text>
      )}
      <Text style={styles.detailText}>
        Saldo de Horas: {userProfile.timeBalance}
      </Text>

      {averageRating !== undefined && averageRating > 0 && (
        <View style={styles.ratingContainer}>
          <MaterialCommunityIcons name="star" size={20} color={COLORS.action} />
          <Text style={styles.ratingText}>{averageRating.toFixed(1)} / 5</Text>
        </View>
      )}
      {userProfile.skills && userProfile.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          <Text style={styles.skillsTitle}>Habilidades:</Text>
          <View style={styles.skillsListWrapper}>
            {userProfile.skills.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>

    <View style={styles.badgesContainer}>
      <Text style={styles.badgesTitle}>Medalhas Conquistadas:</Text>
      {earnedBadges.length > 0 ? (
        <FlatList
          data={earnedBadges}
          keyExtractor={(item) => item.id}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.badgeItem}>
              <MaterialCommunityIcons
                name={item.icon as any}
                size={30}
                color={COLORS.primary}
              />
              <Text style={styles.badgeName}>{item.name}</Text>
              <Text style={styles.badgeDescription}>{item.description}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noBadgesText}>
          Nenhuma medalha conquistada ainda.
        </Text>
      )}
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Avaliações Recebidas</Text>
      {reviews.length === 0 && (
        <Text style={styles.detailText}>Nenhuma avaliação recebida ainda.</Text>
      )}
    </View>
  </View>
);

const UserProfileDisplay: React.FC<UserProfileDisplayProps> = ({
  userProfile,
  reviews,
  earnedBadges,
  isCurrentUser,
  onEditProfilePress,
  onProposeTradePress,
  averageRating,
}) => {
  return (
    <FlatList
      data={reviews}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <ProfileHeader
          userProfile={userProfile}
          reviews={reviews}
          earnedBadges={earnedBadges}
          averageRating={averageRating}
        />
      }
      renderItem={({ item }) => (
        <View style={styles.reviewItem}>
          <Text style={styles.reviewText}>Nota: {item.rating}/5</Text>
          <Text style={styles.reviewText}>Comentário: {item.comment}</Text>
          <Text style={styles.reviewReviewer}>
            Avaliado por: {item.reviewerProfile?.email || item.reviewerId}
          </Text>
        </View>
      )}
      ListFooterComponent={
        <View style={styles.footer}>
          {isCurrentUser ? (
            <AppButton
              title="Editar Perfil"
              onPress={() =>
                onEditProfilePress && onEditProfilePress(userProfile)
              }
              variant="primary"
              style={styles.editButton}
            />
          ) : (
            <AppButton
              title="Propor Troca"
              onPress={() =>
                onProposeTradePress &&
                onProposeTradePress(userProfile.id, userProfile.email)
              }
              variant="primary"
            />
          )}
        </View>
      }
      contentContainerStyle={styles.listContentContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    paddingBottom: 20,
  },
  profileDetails: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 15,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    color: COLORS.textMedium,
    fontSize: FONT_SIZES.body,
  },
  detailText: {
    fontSize: FONT_SIZES.body,
    marginBottom: 5,
    color: COLORS.textDark,
  },
  skillsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 10,
  },
  skillsTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 5,
  },
  skillText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.primary,
  },
  editButton: {
    marginTop: 10,
  },
  badgesContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  badgesTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 10,
  },
  badgeItem: {
    backgroundColor: COLORS.secondary + "1A",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
    width: 120,
    height: 120,
    justifyContent: "center",
    elevation: 1,
  },
  badgeName: {
    fontSize: FONT_SIZES.caption,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.textDark,
  },
  badgeDescription: {
    fontSize: FONT_SIZES.caption,
    textAlign: "center",
    color: COLORS.textMedium,
  },
  noBadgesText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textMedium,
    textAlign: "center",
  },
  section: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.h2,
    fontWeight: "bold",
    marginBottom: 10,
    color: COLORS.textDark,
  },
  reviewItem: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    marginHorizontal: 15,
  },
  reviewText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textDark,
    marginBottom: 3,
  },
  reviewReviewer: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMedium,
    textAlign: "right",
  },
  profileTitle: {
    fontSize: FONT_SIZES.h2,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 15,
    textAlign: "center",
  },
  skillsListWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  skillChip: {
    backgroundColor: COLORS.secondary,
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  ratingText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textDark,
    marginLeft: 5,
    fontWeight: "bold",
  },
  footer: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
});

export default UserProfileDisplay;

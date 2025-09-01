import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  SectionList,
  SafeAreaView,
  Alert,
} from "react-native";
import { searchUsers, getSuggestedUsers } from "../api/firestore.ts";
// import { useAuth } from "../hooks/useAuth";
import { COLORS, FONT_SIZES } from "../constants";
import AppButton from "../components/common/AppButton.tsx";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, UserProfile } from "../types";
import { getFirebaseErrorMessage } from "../utils/errorUtils";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useAuth } from "../contexts/AuthContext.tsx";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "HomeMain">;

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { userProfile } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [listData, setListData] = useState<
    { title: string; data: UserProfile[] }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [lastVisibleSuggestedUser, setLastVisibleSuggestedUser] =
    useState<any>(null);
  const [loadingSuggestedUsers, setLoadingSuggestedUsers] = useState(true);
  const [loadingMoreSuggestedUsers, setLoadingMoreSuggestedUsers] =
    useState(false);
  const [allSuggestedUsersLoaded, setAllSuggestedUsersLoaded] = useState(false);

  const fetchSuggestedUsers = useCallback(
    async (loadMore = false) => {
      if (
        loadingSuggestedUsers ||
        loadingMoreSuggestedUsers ||
        allSuggestedUsersLoaded
      )
        return;

      if (loadMore) {
        setLoadingMoreSuggestedUsers(true);
      } else {
        setLoadingSuggestedUsers(true);
      }

      try {
        const pageSize = 10;
        const { users, lastVisible } = await getSuggestedUsers(
          loadMore ? lastVisibleSuggestedUser : null,
          pageSize
        );

        if (users.length === 0 && !loadMore) {
          setAllSuggestedUsersLoaded(true);
        } else {
          const newUsers = loadMore ? [...suggestedUsers, ...users] : users;
          setSuggestedUsers(newUsers);
          if (!hasSearched) {
            setListData([{ title: "Usuários Sugeridos", data: newUsers }]);
          }
          setLastVisibleSuggestedUser(lastVisible);
        }
      } catch (error) {
        console.error("Error fetching suggested users:", error);
        Alert.alert("Erro", "Não foi possível carregar usuários sugeridos.");
      } finally {
        if (loadMore) {
          setLoadingMoreSuggestedUsers(false);
        } else {
          setLoadingSuggestedUsers(false);
        }
      }
    },
    [
      allSuggestedUsersLoaded,
      lastVisibleSuggestedUser,
      loadingMoreSuggestedUsers,
      loadingSuggestedUsers,
      suggestedUsers,
      hasSearched,
    ]
  );

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  const handleSearch = useCallback(async () => {
    if (searchText.trim().length <= 2) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const { nameMatches, skillMatches } = await searchUsers(searchText);
      const newSections = [];
      if (skillMatches.length > 0) {
        newSections.push({
          title: "Resultados por Habilidade",
          data: skillMatches,
        });
      }
      if (nameMatches.length > 0) {
        newSections.push({
          title: "Resultados por Nome ou Email",
          data: nameMatches,
        });
      }
      setListData(newSections);
    } catch (error: unknown) {
      const errorMessage = getFirebaseErrorMessage(error);
      Alert.alert("Erro na Busca", errorMessage);
      setListData([]);
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  const clearSearch = useCallback(() => {
    setSearchText("");
    setListData([{ title: "Usuários Sugeridos", data: suggestedUsers }]);
    setHasSearched(false);
  }, [suggestedUsers]);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (searchText.trim().length > 2) {
        handleSearch();
      } else if (searchText.trim().length === 0 && hasSearched) {
        clearSearch();
      }
    }, 500);
    return () => clearTimeout(searchTimer);
  }, [searchText, handleSearch, clearSearch, hasSearched]);

  const renderUserCard = useCallback(
    ({ item, index }: { item: UserProfile; index: number }) => (
      <MotiView
        from={{ opacity: 0, transform: [{ translateY: 20 }] }}
        animate={{ opacity: 1, transform: [{ translateY: 0 }] }}
        transition={{ type: "timing", duration: 300, delay: index * 50 }}>
        <TouchableOpacity
          style={styles.userCard}
          onPress={() =>
            navigation.navigate("UserProfileDetail", { userId: item.id })
          }>
          <Image
            source={{
              uri:
                item.avatarUrl ||
                `https://ui-avatars.com/api/?name=${
                  item.name || item.email
                }&background=E8E8E8&color=555`,
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name || item.email}</Text>
            <Text style={styles.userEmail}>{item.name ? item.email : ""}</Text>
            <View style={styles.timeBalanceContainer}>
              <Ionicons name="time-outline" size={16} color={COLORS.primary} />
              <Text style={styles.timeBalanceText}>
                {(item.timeBalance || 0).toFixed(1)} horas
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward-outline"
            size={24}
            color={COLORS.lightGray}
          />
        </TouchableOpacity>
      </MotiView>
    ),
    [navigation]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 400 }}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Bem-vindo(a), {userProfile?.name?.split(" ")[0] || "Usuário"}!
            </Text>
            <Text style={styles.headerSubtitle}>
              Pronto para trocar habilidades hoje?
            </Text>
          </View>
          <AppButton
            title="Propor Nova Troca"
            onPress={() =>
              navigation.navigate("Proposal", {
                receiverId: "",
                receiverEmail: "",
              })
            }
            variant="primary"
            style={styles.proposeNewTradeButton}
          />
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={22}
              color={COLORS.textMedium}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome ou habilidade..."
              placeholderTextColor={COLORS.textMedium}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
                <Ionicons
                  name="close-circle"
                  size={22}
                  color={COLORS.textMedium}
                />
              </TouchableOpacity>
            )}
          </View>
        </MotiView>

        <SectionList
          sections={listData}
          keyExtractor={(item) => item.id}
          renderItem={renderUserCard}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          onEndReached={() => {
            if (
              !hasSearched &&
              !allSuggestedUsersLoaded &&
              !loadingMoreSuggestedUsers
            ) {
              fetchSuggestedUsers(true);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading || loadingSuggestedUsers || loadingMoreSuggestedUsers ? (
              <ActivityIndicator
                style={styles.loadingIndicator}
                size="large"
                color={COLORS.primary}
              />
            ) : null
          }
          ListEmptyComponent={
            !loading &&
            !loadingSuggestedUsers &&
            hasSearched &&
            listData.length === 0 ? (
              <Text style={styles.noResultsText}>
                Nenhum usuário encontrado para "{searchText}".
              </Text>
            ) : null
          }
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 10,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h1,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textMedium,
    marginTop: 8,
  },
  proposeNewTradeButton: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: FONT_SIZES.body,
    color: COLORS.textDark,
  },
  clearIcon: {
    padding: 5,
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: COLORS.lightGray,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.h3,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  userEmail: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textMedium,
    marginBottom: 8,
  },
  timeBalanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeBalanceText: {
    marginLeft: 6,
    fontSize: FONT_SIZES.body,
    color: COLORS.primary,
    fontWeight: "600",
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: FONT_SIZES.body,
    color: COLORS.textMedium,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: FONT_SIZES.h3,
    fontWeight: "bold",
    color: COLORS.textDark,
    backgroundColor: COLORS.background,
    paddingTop: 20,
    paddingBottom: 10,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
});

export default HomeScreen;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useAuth } from "../../hooks/useAuth.ts";
import { getUserProfile, updateUserProfile } from "../../api/firestore.ts";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { COLORS, FONT_SIZES } from "../../constants";
import AppButton from "../../components/common/AppButton.tsx";
import * as ImagePicker from "expo-image-picker";
import { MediaType } from "expo-image-picker";

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "../../api/firebase.ts";
import { getFirebaseErrorMessage } from "../../utils/errorUtils";
import { Ionicons } from "@expo/vector-icons";
import { UserProfile } from "../../types";
import Toast from "react-native-toast-message"; // NOVO: Para notificações

type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: { profile: UserProfile };
};

type EditProfileScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  "EditProfile"
>;

const storage = getStorage(app);

const EditProfileScreen = ({ navigation }: EditProfileScreenProps) => {
  const { user, refetchUserProfile } = useAuth();
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setError("Usuário não autenticado.");
        setLoading(false);
        return;
      }
      try {
        const currentProfile = await getUserProfile(user.uid);
        if (currentProfile) {
          setProfileData({
            name: currentProfile.name || '',
            bio: currentProfile.bio || '',
            skills: currentProfile.skills || [],
            avatarUrl: currentProfile.avatarUrl || null, // Load existing avatar
          });
          setImage(currentProfile.avatarUrl || null);
        }
      } catch (err: unknown) {
        setError("Erro ao carregar perfil: " + getFirebaseErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const pickImage = async () => {
  try {
    // Request permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        "Permissão Necessária",
        "Precisamos de permissão para acessar sua galeria de fotos para que você possa escolher uma imagem de perfil."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log("ImagePicker Result:", result); // Log the result

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      console.log("Image URI set:", result.assets[0].uri);
    } else {
      console.log("Image picking cancelled or failed.");
    }
  } catch (error) {
    console.error("Error during image picking:", error);
    Alert.alert("Erro", "Ocorreu um erro ao tentar selecionar a imagem.");
  }
};

  const uploadImage = async (uri: string): Promise<string | null> => {
  if (!user) return null;
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `avatars/${user.uid}`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    Toast.show({
      type: "error",
      text1: "Erro ao fazer upload da imagem",
      text2: getFirebaseErrorMessage(error),
    });
    return null;
  }
};

  // MELHORIA: Validação para adicionar habilidades
  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (!trimmedSkill) {
      Toast.show({
        type: "error",
        text1: "Habilidade vazia",
        text2: "Por favor, digite uma habilidade.",
      });
      return;
    }
    if (profileData.skills?.includes(trimmedSkill)) {
      Toast.show({
        type: "info",
        text1: "Habilidade duplicada",
        text2: "Você já adicionou esta habilidade.",
      });
      return;
    }
    const updatedSkills = [...(profileData.skills || []), trimmedSkill];
    setProfileData({ ...profileData, skills: updatedSkills });
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = (profileData.skills || []).filter(
      (skill) => skill !== skillToRemove
    );
    setProfileData({ ...profileData, skills: updatedSkills });
    Toast.show({
      type: "success",
      text1: "Habilidade removida!",
      text2: `'${skillToRemove}' foi removida do seu perfil.`, 
    });
  };

  // MELHORIA: Feedback com Toast e adição do name_lowercase
  const handleSaveProfile = async () => {
    if (!user) return;

    // Add validation for name and skills
    if (!profileData.name || profileData.name.trim() === '') {
      Toast.show({
        type: "error",
        text1: "Nome obrigatório",
        text2: "Por favor, preencha seu nome.",
      });
      return;
    }
    if (!profileData.skills || profileData.skills.length === 0) {
      Toast.show({
        type: "error",
        text1: "Habilidade obrigatória",
        text2: "Por favor, adicione pelo menos uma habilidade.",
      });
      return;
    }

    setSaving(true);
    try {
      let finalAvatarUrl: string | null | undefined = profileData.avatarUrl;
      if (image && image !== profileData.avatarUrl) {
        finalAvatarUrl = await uploadImage(image);
      } else if (image === null) {
        finalAvatarUrl = null;
      }

      const name = profileData.name || "";
      const profileUpdate: Partial<UserProfile> = {
        name: name,
        bio: profileData.bio,
        skills: profileData.skills,
        avatarUrl: finalAvatarUrl,
      };

      await updateUserProfile(user.uid, profileUpdate);
      refetchUserProfile();

      Toast.show({
        type: "success",
        text1: "Sucesso!",
        text2: "Seu perfil foi atualizado.",
      });

      
    } catch (err: unknown) {
      const errorMessage = getFirebaseErrorMessage(err);
      Toast.show({
        type: "error",
        text1: "Erro Não foi possivel salvar o perfil",
        text2: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  // ... (Loading e Error states - sem alterações)

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Editar Perfil</Text>

      <TouchableOpacity onPress={() => Alert.alert("Funcionalidade desabilitada", "A seleção de imagem está temporariamente desabilitada.")} style={styles.avatarContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="camera" size={40} color={COLORS.textMedium} />
          </View>
        )}
        {/* NOVO: Ícone de edição sobreposto */}
        <View style={styles.avatarEditOverlay}>
          <Ionicons name="pencil" size={18} color={COLORS.white} />
        </View>
      </TouchableOpacity>

      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        placeholder="Seu nome completo"
        value={profileData?.name || ""}
        onChangeText={(text) => setProfileData({ ...profileData, name: text })}
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, styles.bioInput]}
        placeholder="Fale um pouco sobre você..."
        value={profileData?.bio || ""}
        onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
        multiline
      />

      <Text style={styles.label}>Habilidades</Text>
      <View style={styles.skillInputContainer}>
        <TextInput
          style={[styles.input, styles.skillTextInput]}
          placeholder="Ex: Violão, Inglês, Culinária..."
          value={newSkill}
          onChangeText={setNewSkill}
          onSubmitEditing={handleAddSkill}
        />
        <TouchableOpacity
          style={styles.addSkillButton}
          onPress={handleAddSkill}>
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* MELHORIA: Renderização de skills como pílulas */}
      <View style={styles.skillsListContainer}>
        {(profileData.skills || []).length > 0 ? (
          (profileData.skills || []).map((skill, index) => (
            <View key={index} style={styles.skillPill}>
              <Text style={styles.skillPillText}>{skill}</Text>
              <TouchableOpacity onPress={() => handleRemoveSkill(skill)}>
                <Ionicons name="close" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noSkillsText}>
            Nenhuma habilidade adicionada ainda.
          </Text>
        )}
      </View>

      <AppButton
        title="Salvar Alterações"
        onPress={handleSaveProfile}
        loading={saving}
        variant="primary"
        style={styles.saveButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
  label: {
    fontSize: FONT_SIZES.body,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
    fontSize: FONT_SIZES.body,
    color: COLORS.textDark,
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 15,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 20,
    backgroundColor: COLORS.lightGray,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
  },
  avatarEditOverlay: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  skillInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  skillTextInput: {
    flex: 1,
    marginRight: 10,
  },
  addSkillButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  skillsListContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15,
  },
  skillPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  skillPillText: {
    color: COLORS.primary,
    fontWeight: "bold",
    marginRight: 8,
  },
  noSkillsText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textMedium,
    width: "100%",
    textAlign: "center",
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZES.body,
    textAlign: "center",
  },
  saveButton: {
    marginTop: 30,
  },
});

export default EditProfileScreen;

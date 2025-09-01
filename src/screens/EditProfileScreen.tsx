import React, { useState, useEffect, useCallback } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { updateUserProfile } from "../api/firestore";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseErrorMessage } from "../utils/errorUtils";
import { Ionicons } from "@expo/vector-icons";
import { UserProfile } from "../types";
import Toast from "react-native-toast-message";
import { COLORS, FONT_SIZES } from "../constants";
import AppButton from "../components/common/AppButton";

// =================================================================
// --- Componente Modularizado do Avatar (com Tipagem Corrigida) ---
// =================================================================

interface AvatarPickerProps {
  imageUri: string | null;
  onImagePicked: (uri: string) => void;
}

const AvatarPicker = ({ imageUri, onImagePicked }: AvatarPickerProps) => {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão Necessária",
        "Precisamos de acesso à sua galeria para escolher uma foto."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImagePicked(result.assets[0].uri);
    }
  };

  return (
    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="camera" size={40} color={COLORS.textMedium} />
        </View>
      )}
      <View style={styles.avatarEditOverlay}>
        <Ionicons name="pencil" size={18} color={COLORS.white} />
      </View>
    </TouchableOpacity>
  );
};

// =================================================================
// --- Componente Principal da Tela ---
// =================================================================

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, userProfile, refetchUserProfile } = useAuth();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "");
      setBio(userProfile.bio || "");
      setSkills(userProfile.skills || []);
      setAvatarUri(userProfile.avatarUrl || null);
      setLoading(false);
    } else if (!user) {
      setLoading(false);
    }
  }, [userProfile, user]);

  const uploadImage = useCallback(
    async (uri: string): Promise<string> => {
      if (!user) throw new Error("Usuário não autenticado.");

      const response = await fetch(uri);
      const blob = await response.blob();
      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, blob);
      return getDownloadURL(storageRef);
    },
    [user]
  );

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (!trimmedSkill) return;
    if (skills.includes(trimmedSkill)) {
      Toast.show({ type: "info", text1: "Habilidade já adicionada." });
      return;
    }
    setSkills([...skills, trimmedSkill]);
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!name.trim()) {
      Toast.show({ type: "error", text1: "Nome obrigatório." });
      return;
    }

    setSaving(true);
    try {
      let finalAvatarUrl = userProfile?.avatarUrl;

      if (avatarUri && avatarUri !== userProfile?.avatarUrl) {
        finalAvatarUrl = await uploadImage(avatarUri);
      }

      const profileUpdate: Partial<UserProfile> = {
        name: name.trim(),
        name_lowercase: name.trim().toLowerCase(),
        bio: bio.trim(),
        skills: skills,
        avatarUrl: finalAvatarUrl,
      };

      await updateUserProfile(user.uid, profileUpdate);
      await refetchUserProfile();

      Toast.show({ type: "success", text1: "Perfil atualizado com sucesso!" });
      navigation.goBack();
    } catch (err: unknown) {
      Toast.show({
        type: "error",
        text1: "Erro ao salvar",
        text2: getFirebaseErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Editar Perfil</Text>

      <AvatarPicker imageUri={avatarUri} onImagePicked={setAvatarUri} />

      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        placeholder="Seu nome completo"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, styles.bioInput]}
        placeholder="Fale um pouco sobre você..."
        value={bio}
        onChangeText={setBio}
        multiline
      />

      <Text style={styles.label}>Habilidades</Text>
      <View style={styles.skillInputContainer}>
        <TextInput
          style={[styles.input, styles.skillTextInput]}
          placeholder="Ex: Violão, Inglês..."
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

      <View style={styles.skillsListContainer}>
        {skills.map((skill, index) => (
          <View key={index} style={styles.skillPill}>
            <Text style={styles.skillPillText}>{skill}</Text>
            <TouchableOpacity onPress={() => handleRemoveSkill(skill)}>
              <Ionicons name="close" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        ))}
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

// =================================================================
// --- Estilos ---
// =================================================================

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
    backgroundColor: COLORS.primary,
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
  saveButton: {
    marginTop: 30,
  },
});

export default EditProfileScreen;

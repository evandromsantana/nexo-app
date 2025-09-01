import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, updateUserProfile } from '../../api/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, FONT_SIZES } from '../../constants';
import AppButton from '../../components/common/AppButton';
import { RootStackParamList, UserProfile } from '../../types';
import { getFirebaseErrorMessage } from "../../utils/errorUtils";

type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const OnboardingScreen = ({ navigation }: OnboardingScreenProps) => {
  const { user, refetchUserProfile } = useAuth();
  const [profileData, setProfileData] = useState<Partial<OnboardingProfile>>({
    name: '',
    bio: '',
    skills: [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          });
        }
      } catch (err: unknown) {
        setError("Erro ao carregar perfil: " + getFirebaseErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim().toLowerCase();
    if (trimmedSkill && profileData.skills && !profileData.skills.includes(trimmedSkill)) {
      const updatedSkills = [...profileData.skills, trimmedSkill];
      setProfileData({ ...profileData, skills: updatedSkills });
      setNewSkill('');
    } else if (!trimmedSkill) {
      Alert.alert("Erro", "Por favor, digite uma habilidade.");
    } else if (profileData.skills?.includes(trimmedSkill)) {
      Alert.alert("Erro", "Esta habilidade já foi adicionada.");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (profileData.skills) {
      const updatedSkills = profileData.skills.filter(skill => skill !== skillToRemove);
      setProfileData({ ...profileData, skills: updatedSkills });
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profileData.name || profileData.skills?.length === 0) {
      Alert.alert("Erro", "Por favor, preencha seu nome e adicione pelo menos uma habilidade.");
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        name: profileData.name,
        bio: profileData.bio,
        skills: profileData.skills,
      });
      Toast.show({
        type: "success",
        text1: "Sucesso!",
        text2: "Seu perfil foi atualizado.",
      });
      // Refetch the profile to trigger navigation in RootNavigator
      refetchUserProfile();
    } catch (err: unknown) {
      Alert.alert("Erro", "Não foi possível salvar o perfil: " + getFirebaseErrorMessage(err));
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

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete seu Perfil</Text>
      <Text style={styles.subtitle}>Conte-nos um pouco sobre você para começar a trocar habilidades!</Text>

      <Text style={styles.label}>Seu Nome:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        value={profileData?.name || ''}
        onChangeText={(text) => setProfileData({ ...profileData, name: text })}
      />

      <Text style={styles.label}>Sobre Você (Bio):</Text>
      <TextInput
        style={[styles.input, styles.bioInput]}
        placeholder="Fale um pouco sobre suas paixões e o que você busca no Nexo..."
        value={profileData?.bio || ''}
        onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
        multiline
      />

      <Text style={styles.label}>Suas Habilidades (o que você ensina ou quer aprender):</Text>
      <View style={styles.skillInputContainer}>
        <TextInput
          style={[styles.input, styles.skillTextInput]}
          placeholder="Ex: Cozinhar, Programação, Idiomas..."
          value={newSkill}
          onChangeText={setNewSkill}
        />
        <AppButton title="Add" onPress={handleAddSkill} variant="secondary" style={styles.addSkillButton} />
      </View>

      <FlatList
        data={profileData?.skills || []}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => (
          <View style={styles.skillItem}>
            <Text style={styles.skillText}>{item}</Text>
            <TouchableOpacity onPress={() => handleRemoveSkill(item)} style={styles.removeSkillButton}>
              <Text style={styles.removeSkillText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noSkillsText}>Adicione suas primeiras habilidades!</Text>}
        style={styles.skillsList}
      />

      <AppButton
        title="Salvar e Continuar"
        onPress={handleSaveProfile}
        loading={saving}
        variant="primary"
        style={styles.saveButton}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.h1,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.textDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textMedium,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    width: '100%',
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
    textAlignVertical: 'top',
  },
  skillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillTextInput: {
    flex: 1,
    marginRight: 10,
  },
  addSkillButton: {
    width: 80,
    height: 50,
    marginVertical: 0,
  },
  skillsList: {
    width: '100%',
    maxHeight: 150,
    marginBottom: 20,
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  skillText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textDark,
  },
  removeSkillButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeSkillText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.caption,
  },
  noSkillsText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textMedium,
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZES.body,
    textAlign: 'center',
    marginBottom: 10,
  },
  saveButton: {
    marginTop: 20,
  },
});

export default OnboardingScreen;

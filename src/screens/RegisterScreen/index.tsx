import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet } from 'react-native';
import { register } from '../../api/auth.ts';
import { createUserProfile } from '../../api/firestore.ts';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, FONT_SIZES } from '../../constants';
import AppButton from '../../components/common/AppButton.tsx';
import { RootStackParamList } from '../../types';
import { FirebaseError } from 'firebase/app'; // Import FirebaseError
import { getFirebaseErrorMessage } from "../../utils/errorUtils";

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    const newErrors = { email: '', password: '', confirmPassword: '' };
    let isValid = true;

    if (!email) {
      newErrors.email = 'O campo Email é obrigatório.';
      isValid = false;
    }
    if (!password) {
      newErrors.password = 'O campo Senha é obrigatório.';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter no mínimo 6 caracteres.';
      isValid = false;
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateFields()) {
      return;
    }
    setLoading(true);
    try {
      const userCredential = await register(email, password);
      const { user } = userCredential;
      const lowercasedEmail = user.email ? user.email.toLowerCase() : '';
      // Create user profile in Firestore
      await createUserProfile(user.uid, { email: lowercasedEmail, timeBalance: 0 }); // Initial time balance
      Toast.show({
        type: "success",
        text1: "Sucesso!",
        text2: "Cadastro realizado com sucesso!",
      });
      navigation.replace('Onboarding'); // Navigate to onboarding after successful registration
    } catch (error: unknown) {
      const errorMessage = getFirebaseErrorMessage(error);
      Alert.alert("Erro de Cadastro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors({ ...errors, email: '' });
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) setErrors({ ...errors, password: '' });
        }}
        secureTextEntry
      />
      {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
        }}
        secureTextEntry
      />
      {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

      <AppButton
        title="Cadastrar"
        onPress={handleRegister}
        loading={loading}
        variant="primary"
      />

      <AppButton
        title="Já tem uma conta? Faça Login"
        onPress={() => navigation.goBack()}
        variant="ghost"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZES.h1,
    fontWeight: 'bold',
    marginBottom: 24,
    color: COLORS.textDark,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
  },
  errorText: {
    color: COLORS.danger,
    alignSelf: 'flex-start',
    marginLeft: 5,
    marginBottom: 10,
  },
});

export default RegisterScreen;
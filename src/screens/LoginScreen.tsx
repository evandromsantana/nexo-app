import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message"; // Importa o Toast

// 1. Importa o nosso hook de autenticação
import { useAuth } from "../contexts/AuthContext";
import { getFirebaseErrorMessage } from "../utils/errorUtils";
import { RootStackParamList } from "../types";
import { COLORS, FONT_SIZES } from "../constants";
import AppButton from "../components/common/AppButton.tsx";

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // 2. Pega a função signIn do nosso contexto
  const { signIn } = useAuth();

  const validateFields = () => {
    // ... sua função de validação continua a mesma, está ótima.
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email) {
      newErrors.email = "O campo Email é obrigatório.";
      isValid = false;
    }
    if (!password) {
      newErrors.password = "O campo Senha é obrigatório.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateFields()) {
      return;
    }
    setLoading(true);
    try {
      // 3. Chama a função signIn do contexto em vez da função 'login' da API
      await signIn(email, password);
      // A navegação será tratada automaticamente pelo onAuthStateChanged
    } catch (error: unknown) {
      const errorMessage = getFirebaseErrorMessage(error);

      // 4. Usa o Toast para um feedback mais elegante
      Toast.show({
        type: "error",
        text1: "Erro de Login",
        text2: errorMessage,
        position: "top",
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ... seu JSX continua o mesmo, está ótimo. */}
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors({ ...errors, email: "" });
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email ? (
        <Text style={styles.errorText}>{errors.email}</Text>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) setErrors({ ...errors, password: "" });
        }}
        secureTextEntry
      />
      {errors.password ? (
        <Text style={styles.errorText}>{errors.password}</Text>
      ) : null}

      <AppButton
        title="Login"
        onPress={handleLogin}
        loading={loading}
        variant="primary"
      />

      <AppButton
        title="Não tem uma conta? Cadastre-se"
        onPress={() => navigation.navigate("Register")}
        variant="ghost"
      />
    </View>
  );
};

// ... seus estilos continuam os mesmos.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZES.h1,
    fontWeight: "bold",
    marginBottom: 24,
    color: COLORS.textDark,
  },
  input: {
    width: "100%",
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
    alignSelf: "flex-start",
    marginLeft: 5,
    marginBottom: 10,
  },
});

export default LoginScreen;

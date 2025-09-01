import React, { useState } from "react";
import { View, Text, TextInput, Alert, StyleSheet } from "react-native";
import { login } from "../../api/auth.ts";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { COLORS, FONT_SIZES } from "../../constants";
import AppButton from "../../components/common/AppButton.tsx";
import { RootStackParamList } from "../../types";
import { FirebaseError } from "firebase/app"; // Import FirebaseError
import { getFirebaseErrorMessage } from "../../utils/errorUtils";

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
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
      await login(email, password);
      // The onAuthStateChanged in AuthContext will handle the navigation
    } catch (error: unknown) {
      const errorMessage = getFirebaseErrorMessage(error);
      Alert.alert("Erro de Login", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
        title="Não tem uma conta? Cadastre-se"n
        onPress={() => navigation.navigate("Register")}
        variant="ghost"
      />
    </View>
  );
};

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
// src/navigation/RootNavigator.tsx

import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import AppStack from "./AppStack";
import AuthStack from "./AuthStack";

const RootNavigator = () => {
  // Agora pegamos também o userProfile do contexto
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Se o usuário está logado E o perfil foi carregado,
  // passe o userProfile como prop para o AppStack.
  return user && userProfile ? (
    <AppStack userProfile={userProfile} />
  ) : (
    <AuthStack />
  );
};

export default RootNavigator;

import React from "react";
import { AuthProvider } from "./src/contexts/AuthContext.tsx";
import RootNavigator from "./src/navigation/RootNavigator.tsx";
import Toast from "react-native-toast-message"; // 1. Importe o Toast

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
      {/* 2. Adicione o componente Toast aqui */}
      <Toast />
    </AuthProvider>
  );
}

import React from "react";
import { AuthProvider } from "./src/contexts/AuthContext.tsx";
import RootNavigator from "./src/navigation/RootNavigator.tsx";

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

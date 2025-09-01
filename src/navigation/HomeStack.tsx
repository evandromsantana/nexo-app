import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import UserProfileDetailScreen from "../screens/UserProfileDetailScreen";
import ProposalScreen from "../screens/ProposalScreen"; // Import ProposalScreen
import { RootStackParamList } from "../types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserProfileDetail"
        component={UserProfileDetailScreen}
        options={{ title: "Perfil do Usuário" }}
      />
      <Stack.Screen
        name="Proposal"
        component={ProposalScreen}
        options={{ title: "Nova Proposta" }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;

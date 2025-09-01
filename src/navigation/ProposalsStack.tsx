import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProposalsScreen from "../screens/ProposalsScreen"; // This is the top tab navigator
import ChatScreen from "../screens/ChatScreen";
import ReviewScreen from "../screens/ReviewScreen"; // Import ReviewScreen
import { RootStackParamList } from "../types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const ProposalsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProposalsMain"
        component={ProposalsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: "Chat" }}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ title: "Avaliar Troca" }}
      />
    </Stack.Navigator>
  );
};

export default ProposalsStack;

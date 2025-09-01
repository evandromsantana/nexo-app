import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import AboutScreen from "../screens/AboutScreen"; // New import
import { RootStackParamList } from "../types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Editar Perfil" }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: "Sobre" }}
      />
      {/* New Stack.Screen */}
    </Stack.Navigator>
  );
};

export default ProfileStack;

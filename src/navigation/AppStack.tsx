import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProfile } from '../types'; // Import UserProfile type

import MainTabNavigator from './MainTabNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';

const App = createNativeStackNavigator();

interface AppStackProps {
  userProfile: UserProfile | null;
}

const AppStack = ({ userProfile }: AppStackProps) => {
  // Determine if onboarding is complete
  // Onboarding is considered complete if name and at least one skill are present
  const isOnboardingComplete = userProfile && userProfile.name && userProfile.skills && userProfile.skills.length > 0;

  return (
    <App.Navigator screenOptions={{ headerShown: false }}>
      {isOnboardingComplete ? (
        <App.Screen name="MainTabs" component={MainTabNavigator} />
      ) : (
        <App.Screen name="Onboarding" component={OnboardingScreen} />
      )}
    </App.Navigator>
  );
};

export default AppStack;
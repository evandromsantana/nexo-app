import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeStack from './HomeStack';
import ProposalsStack from './ProposalsStack';
import ProfileStack from './ProfileStack';
// import NotificationsScreen from '../screens/NotificationsScreen'; // Removed import
import { COLORS } from '../constants';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'] = 'help-circle';

          if (route.name === 'Início') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Propostas') {
            iconName = focused ? 'swap-horizontal-bold' : 'swap-horizontal';
          } else if (route.name === 'Meu Perfil') {
            iconName = focused ? 'account' : 'account-outline';
          }
          // Removed Notifications icon logic
          // else if (route.name === 'Notificações') {
          //   iconName = focused ? 'bell' : 'bell-outline';
          // }

          // You can return any component that you like here!
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMedium,
      })}
    >
      <Tab.Screen name="Início" component={HomeStack} />
      <Tab.Screen name="Propostas" component={ProposalsStack} />
      <Tab.Screen name="Meu Perfil" component={ProfileStack} />
      {/* Removed Notifications Tab.Screen */}
      {/* <Tab.Screen name="Notificações" component={NotificationsScreen} /> */}
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
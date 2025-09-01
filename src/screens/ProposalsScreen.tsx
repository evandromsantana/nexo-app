import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

// import SentProposalsScreen from '../SentProposalsScreen';
import { ProposalsTabParamList } from "../types";
import { COLORS, FONT_SIZES } from "../constants";
import ReceivedProposalsScreen from "./proposals/ReceivedProposalsScreen";
import SentProposalsScreen from "./SentProposalsScreen";

const Tab = createMaterialTopTabNavigator<ProposalsTabParamList>();

const ProposalsScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMedium,
        tabBarLabelStyle: { fontSize: FONT_SIZES.caption, fontWeight: "bold" },
        tabBarStyle: { marginTop: 50, backgroundColor: COLORS.background }, // Adjust for status bar
        tabBarIndicatorStyle: { backgroundColor: COLORS.primary },
      }}>
      <Tab.Screen name="Recebidas" component={ReceivedProposalsScreen} />
      {/* <Tab.Screen name="Enviadas" component={SentProposalsScreen} /> */}
    </Tab.Navigator>
  );
};

export default ProposalsScreen;

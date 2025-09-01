// src/screens/ProposalScreen.tsx

import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { createProposal } from "../api/firestore";
import Toast from "react-native-toast-message";

const ProposalScreen = () => {
  const { userProfile } = useAuth();
  const route = useRoute();

  // Assumes receiverId is passed via navigation
  const { receiverId } = route.params as { receiverId: string };

  // State to hold user input
  const [skillOffered, setSkillOffered] = useState("");
  const [skillRequested, setSkillRequested] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendProposal = async () => {
    if (!userProfile) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Você precisa estar logado.",
      });
      return;
    }

    setLoading(true);
    try {
      // ✅ Create the data object with all required properties
      const proposalData = {
        senderId: userProfile.id,
        receiverId: receiverId,
        skillOffered: skillOffered,
        skillRequested: skillRequested,
        message: message,
        status: "pending" as const, // Status inicial
      };

      // Pass the complete object to the function
      await createProposal(proposalData);

      Toast.show({
        type: "success",
        text1: "Sucesso!",
        text2: "Sua proposta foi enviada.",
      });
      // navigation.goBack(); // Example: go back after sending
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível enviar a proposta.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Proposta para: {receiverId}</Text>

      <TextInput
        placeholder="Habilidade que você oferece"
        value={skillOffered}
        onChangeText={setSkillOffered}
      />
      <TextInput
        placeholder="Habilidade que você solicita"
        value={skillRequested}
        onChangeText={setSkillRequested}
      />
      <TextInput
        placeholder="Sua mensagem"
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <Button
        title={loading ? "Enviando..." : "Enviar Proposta"}
        onPress={handleSendProposal}
        disabled={loading}
      />
    </View>
  );
};

export default ProposalScreen;

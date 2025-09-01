import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../hooks/useAuth.ts";
import { createProposal } from "../../api/firestore.ts";
import { COLORS, FONT_SIZES } from "../../constants";
import AppButton from "../../components/common/AppButton.tsx";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { FirebaseError } from "firebase/app";
import { getFirebaseErrorMessage } from "../../utils/errorUtils";
import { displayMessage } from "../../utils/messageUtils";

type ProposalScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Proposal"
>;

const ProposalScreen = ({ navigation, route }: ProposalScreenProps) => {
  const { user } = useAuth();
  const { receiverId, receiverEmail } = route.params; // Receiver's ID and email
  const [skillOffered, setSkillOffered] = useState("");
  const [skillRequested, setSkillRequested] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({
    skillOffered: "",
    skillRequested: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    const newErrors = { skillOffered: "", skillRequested: "", message: "" };
    let isValid = true;

    if (!skillOffered) {
      newErrors.skillOffered = "A habilidade oferecida é obrigatória.";
      isValid = false;
    }
    if (!skillRequested) {
      newErrors.skillRequested = "A habilidade solicitada é obrigatória.";
      isValid = false;
    }
    if (!message) {
      newErrors.message = "A mensagem é obrigatória.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmitProposal = async () => {
    if (!validateFields()) {
      return;
    }
    if (!user) {
      Alert.alert(
        "Erro",
        "Você precisa estar logado para enviar uma proposta."
      );
      return;
    }

    setLoading(true);
    try {
      await createProposal(
        user.uid,
        receiverId,
        skillOffered.toLowerCase(), // Lowercase skillOffered
        skillRequested.toLowerCase(), // Lowercase skillRequested,
        message
      );
      displayMessage("Sucesso", "Proposta enviada com sucesso!", "success");
      navigation.goBack(); // Go back to the user profile detail screen
    } catch (error: unknown) {
      const errorMessage = getFirebaseErrorMessage(error);
      displayMessage("Erro ao enviar proposta", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enviar Proposta para {receiverEmail}</Text>

      <TextInput
        style={styles.input}
        placeholder="Habilidade que você oferece"
        value={skillOffered}
        onChangeText={(text) => {
          setSkillOffered(text);
          if (errors.skillOffered)
            setErrors((prev) => ({ ...prev, skillOffered: "" }));
        }}
      />
      {errors.skillOffered ? (
        <Text style={styles.errorText}>{errors.skillOffered}</Text>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Habilidade que você busca"
        value={skillRequested}
        onChangeText={(text) => {
          setSkillRequested(text);
          if (errors.skillRequested)
            setErrors({ ...errors, skillRequested: "" });
        }}
      />
      {errors.skillRequested ? (
        <Text style={styles.errorText}>{errors.skillRequested}</Text>
      ) : null}

      <TextInput
        style={[styles.input, styles.messageInput]}
        placeholder="Escreva uma mensagem para iniciar a conversa..."
        value={message}
        onChangeText={(text) => {
          setMessage(text);
          if (errors.message) setErrors({ ...errors, message: "" });
        }}
        multiline
      />
      {errors.message ? (
        <Text style={styles.errorText}>{errors.message}</Text>
      ) : null}

      <AppButton
        title="Enviar Proposta"
        onPress={handleSubmitProposal}
        loading={loading}
        variant="primary"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZES.h2,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: COLORS.textDark,
  },
  input: {
    width: "100%",
    minHeight: 50,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
    paddingTop: 15, // Ensure padding is consistent with multiline
    paddingBottom: 15,
  },
  messageInput: {
    height: 120,
    textAlignVertical: "top",
  },
  errorText: {
    color: COLORS.danger,
    alignSelf: "flex-start",
    marginLeft: 5,
    marginBottom: 10,
  },
});

export default ProposalScreen;

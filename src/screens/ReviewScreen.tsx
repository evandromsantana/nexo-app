import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { createReview } from "../api/firestore";
import { getFirebaseErrorMessage } from "../utils/errorUtils";
import { RootStackParamList } from "../types";
import { COLORS, FONT_SIZES } from "../constants";
import AppButton from "../components/common/AppButton";
import Toast from "react-native-toast-message";

type ReviewScreenProps = NativeStackScreenProps<RootStackParamList, "Review">;

const ReviewScreen = ({ navigation, route }: ReviewScreenProps) => {
  const { user } = useAuth();
  const { proposalId, revieweeId } = route.params; // ID do usuário sendo avaliado

  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({ rating: "", comment: "" });
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    const newErrors = { rating: "", comment: "" };
    let isValid = true;
    const numericRating = parseInt(rating, 10);

    if (!rating) {
      newErrors.rating = "A nota é obrigatória.";
      isValid = false;
    } else if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      newErrors.rating = "A nota deve ser um número entre 1 e 5.";
      isValid = false;
    }

    if (!comment.trim()) {
      newErrors.comment = "O comentário é obrigatório.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmitReview = async () => {
    if (!validateFields()) {
      return;
    }
    if (!user) {
      Toast.show({
        type: "error",
        text1: "Erro de Autenticação",
        text2: "Você precisa estar logado para enviar uma avaliação.",
      });
      return;
    }

    setLoading(true);
    try {
      // ✅ 1. Crie o objeto com todos os dados da avaliação
      const reviewData = {
        proposalId: proposalId,
        reviewerId: user.uid,
        revieweeId: revieweeId,
        rating: parseInt(rating, 10),
        comment: comment.trim(),
      };

      // ✅ 2. Passe o objeto único para a função da API
      await createReview(reviewData);

      Toast.show({
        type: "success",
        text1: "Avaliação Enviada!",
        text2: "Obrigado por seu feedback.",
      });
      navigation.goBack();
    } catch (error: unknown) {
      const errorMessage = getFirebaseErrorMessage(error);
      // ✅ 3. Use Toast para exibir o erro
      Toast.show({
        type: "error",
        text1: "Erro ao Enviar Avaliação",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Avaliar Troca</Text>

      <Text style={styles.label}>Nota (1 a 5)</Text>
      <TextInput
        style={styles.input}
        placeholder="Dê uma nota de 1 a 5"
        value={rating}
        onChangeText={(text) => {
          setRating(text.replace(/[^1-5]/g, "")); // Permite apenas números de 1 a 5
          if (errors.rating) setErrors({ ...errors, rating: "" });
        }}
        keyboardType="numeric"
        maxLength={1}
      />
      {errors.rating ? (
        <Text style={styles.errorText}>{errors.rating}</Text>
      ) : null}

      <Text style={styles.label}>Comentário</Text>
      <TextInput
        style={[styles.input, styles.commentInput]}
        placeholder="Deixe seu comentário sobre a troca..."
        value={comment}
        onChangeText={(text) => {
          setComment(text);
          if (errors.comment) setErrors({ ...errors, comment: "" });
        }}
        multiline
        numberOfLines={4}
      />
      {errors.comment ? (
        <Text style={styles.errorText}>{errors.comment}</Text>
      ) : null}

      <AppButton
        title="Enviar Avaliação"
        onPress={handleSubmitReview}
        loading={loading}
        variant="primary"
        style={styles.button}
      />
    </ScrollView>
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
  label: {
    fontSize: FONT_SIZES.body,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    minHeight: 50,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 5,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
    fontSize: FONT_SIZES.body,
  },
  commentInput: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 15,
  },
  errorText: {
    color: COLORS.danger,
    alignSelf: "flex-start",
    marginLeft: 5,
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
  },
});

export default ReviewScreen;

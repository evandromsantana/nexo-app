import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/useAuth.ts';
import { createReview } from '../../api/firestore.ts';
import { COLORS, FONT_SIZES } from '../../constants';
import AppButton from '../../components/common/AppButton.tsx';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { FirebaseError } from 'firebase/app';
import { getFirebaseErrorMessage } from "../../utils/errorUtils";

type ReviewScreenProps = NativeStackScreenProps<RootStackParamList, 'Review'>;

const ReviewScreen = ({ navigation, route }: ReviewScreenProps) => {
  const { user } = useAuth();
  const { proposalId, revieweeId } = route.params; // ID of the user being reviewed
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({ rating: '', comment: '' });
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    const newErrors = { rating: '', comment: '' };
    let isValid = true;
    const numericRating = parseInt(rating, 10);

    if (!rating) {
      newErrors.rating = 'A nota é obrigatória.';
      isValid = false;
    } else if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      newErrors.rating = 'A nota deve ser um número entre 1 e 5.';
      isValid = false;
    }

    if (!comment) {
      newErrors.comment = 'O comentário é obrigatório.';
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
      Alert.alert("Erro", "Você precisa estar logado para enviar uma avaliação.");
      return;
    }

    setLoading(true);
    try {
      await createReview(
        proposalId,
        user.uid, // reviewerId
        revieweeId,
        parseInt(rating, 10),
        comment
      );
      Toast.show({
        type: "success",
        text1: "Sucesso!",
        text2: "Avaliação enviada com sucesso!",
      });
      navigation.goBack(); // Go back to the proposals screen
    } catch (error: unknown) {
      const errorMessage = getFirebaseErrorMessage(error);
      Alert.alert("Erro ao enviar avaliação", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avaliar Troca</Text>

      <TextInput
        style={styles.input}
        placeholder="Nota (1-5)"
        value={rating}
        onChangeText={(text) => {
          setRating(text);
          if (errors.rating) setErrors({ ...errors, rating: '' });
        }}
        keyboardType="numeric"
      />
      {errors.rating ? <Text style={styles.errorText}>{errors.rating}</Text> : null}

      <TextInput
        style={[styles.input, styles.commentInput]}
        placeholder="Deixe seu comentário sobre a troca"
        value={comment}
        onChangeText={(text) => {
          setComment(text);
          if (errors.comment) setErrors({ ...errors, comment: '' });
        }}
        multiline
        numberOfLines={4}
      />
      {errors.comment ? <Text style={styles.errorText}>{errors.comment}</Text> : null}

      <AppButton
        title="Enviar Avaliação"
        onPress={handleSubmitReview}
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
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: COLORS.textDark,
  },
  input: {
    width: '100%',
    minHeight: 50,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
  },
  commentInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 15, // Ensure padding is consistent with multiline
  },
  errorText: {
    color: COLORS.danger,
    alignSelf: 'flex-start',
    marginLeft: 5,
    marginBottom: 10,
  },
});

export default ReviewScreen;
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth.ts';
import { getSentProposals, completeProposal, getUsersByIds } from '../../api/firestore.ts';
import CompletionModal from '../../components/specific/CompletionModal.tsx';
import { getFirebaseErrorMessage } from "../../utils/errorUtils";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, FONT_SIZES } from '../../constants';
import AppButton from '../../components/common/AppButton.tsx';
import { RootStackParamList, Proposal, UserProfile } from '../../types';
import { FirebaseError } from 'firebase/app';

type SentProposalsScreenProps = NativeStackScreenProps<RootStackParamList, 'ProposalsMain'>;

const SentProposalsScreen = ({ navigation }: SentProposalsScreenProps) => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = getSentProposals(user.uid, async (sentProposals) => {
      try {
        if (sentProposals.length > 0) {
          const receiverIds = [...new Set(sentProposals.map(p => p.receiverId).filter(id => id !== ''))];
          const usersMap = await getUsersByIds(receiverIds);
          
          const enrichedProposals = sentProposals.map(proposal => ({
            ...proposal,
            receiverEmail: usersMap.get(proposal.receiverId)?.email || 'E-mail não encontrado',
          }));
          setProposals(enrichedProposals);
        } else {
          setProposals([]);
        }
      } catch (error) {
        console.error("Error enriching sent proposals:", error);
        Alert.alert("Erro", "Não foi possível carregar detalhes das propostas.");
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Error listening to sent proposals in UI:", error);
      Alert.alert("Erro", "Não foi possível carregar as propostas enviadas em tempo real.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const openCompletionModal = (proposal: Proposal) => {
    setCurrentProposal(proposal);
    setModalVisible(true);
  };

  const handleConfirmCompletion = async (proposalId: string, studentId: string, teacherId: string, hours: number) => {
    setLoading(true);
    try {
      await completeProposal(proposalId, studentId, teacherId, hours);
      Alert.alert("Sucesso", "Proposta concluída e horas transferidas!");
      setModalVisible(false);
    } catch (error: unknown) {
      const errorMessage = getFirebaseErrorMessage(error);
      Alert.alert("Erro ao Concluir", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (proposal: Proposal) => {
    if (!user) return;
    const otherUserId = user.uid === proposal.senderId ? proposal.receiverId : proposal.senderId;
    navigation.navigate('Chat', { chatId: proposal.id, otherUserId });
  };

  const handleReview = (proposalId: string, revieweeId: string) => {
    navigation.navigate('Review', { proposalId, revieweeId });
  };

  if (loading && !isModalVisible) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {proposals.length === 0 ? (
        <View style={styles.centered}><Text>Nenhuma proposta enviada.</Text></View>
      ) : (
        <FlatList
          data={proposals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: Proposal }) => (
            <View style={styles.proposalItem}>
              <Text style={styles.proposalText}>Para: {item.receiverEmail || 'Usuário desconhecido'}</Text>
              <Text style={styles.proposalText}>Oferecendo: {item.skillOffered}</Text>
              <Text style={styles.proposalText}>Solicitando: {item.skillRequested}</Text>
              <Text style={styles.proposalText}>Status: {item.status}</Text>
              {item.status === 'accepted' && (
                <View style={styles.buttonContainer}>
                  <AppButton title="Iniciar Chat" onPress={() => handleStartChat(item)} variant="primary" style={styles.flexButton} />
                  <AppButton title="Concluir Troca" onPress={() => openCompletionModal(item)} variant="action" style={styles.flexButton} />
                </View>
              )}
              {item.status === 'completed' && (
                <View style={styles.buttonContainer}>
                  <AppButton title="Avaliar" onPress={() => handleReview(item.id, item.receiverId)} variant="success" style={styles.flexButton} />
                </View>
              )}
            </View>
          )}
        />
      )}

      <CompletionModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmCompletion}
        currentProposal={currentProposal}
        loading={loading} // Pass loading state from parent
        currentUserUid={user?.uid || ''}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  proposalItem: {
    backgroundColor: COLORS.white,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 3,
  },
  proposalText: { fontSize: FONT_SIZES.body, marginBottom: 5, color: COLORS.textDark },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, gap: 10 },
  flexButton: { flex: 1 },
});

export default SentProposalsScreen;
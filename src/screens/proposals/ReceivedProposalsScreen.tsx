import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../../contexts/AuthContext";
import {
  getReceivedProposals,
  updateProposalStatus,
  acceptProposal,
  completeProposal,
  getUsersByIds,
} from "../../api/firestore";
import Toast from "react-native-toast-message";
import CompletionModal from "../../components/specific/CompletionModal";
import { getFirebaseErrorMessage } from "../../utils/errorUtils";
import { COLORS, FONT_SIZES } from "../../constants";
import AppButton from "../../components/common/AppButton";
import { RootStackParamList, Proposal } from "../../types";

// Define o tipo para a prop de navegação desta tela
type ReceivedProposalsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProposalsMain"
>;

const ReceivedProposalsScreen = () => {
  // Usa o tipo que criamos com o hook useNavigation
  const navigation = useNavigation<ReceivedProposalsNavigationProp>();
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

    const unsubscribe = getReceivedProposals(
      user.uid,
      async (receivedProposals) => {
        setLoading(true);
        try {
          if (receivedProposals.length > 0) {
            const senderIds = [
              ...new Set(receivedProposals.map((p) => p.senderId)),
            ];
            const usersMap = await getUsersByIds(senderIds);

            const enrichedProposals = receivedProposals.map((proposal) => ({
              ...proposal,
              senderProfile: usersMap.get(proposal.senderId),
            }));
            setProposals(enrichedProposals);
          } else {
            setProposals([]);
          }
        } catch (error) {
          Toast.show({
            type: "error",
            text1: "Erro",
            text2: "Não foi possível carregar os detalhes das propostas.",
          });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        Toast.show({
          type: "error",
          text1: "Erro de Conexão",
          text2: "Não foi possível carregar as propostas.",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleAcceptProposal = async (proposal: Proposal) => {
    try {
      await acceptProposal(proposal);
      Toast.show({
        type: "success",
        text1: "Proposta Aceita!",
        text2: "O chat já está disponível.",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: getFirebaseErrorMessage(error),
      });
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      await updateProposalStatus(proposalId, "rejected");
      Toast.show({ type: "info", text1: "Proposta Rejeitada." });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: getFirebaseErrorMessage(error),
      });
    }
  };

  const openCompletionModal = (proposal: Proposal) => {
    setCurrentProposal(proposal);
    setModalVisible(true);
  };

  const handleConfirmCompletion = async (
    proposalId: string,
    studentId: string,
    teacherId: string,
    hours: number
  ) => {
    setLoading(true);
    try {
      await completeProposal(proposalId, studentId, teacherId, hours);
      Toast.show({
        type: "success",
        text1: "Sucesso!",
        text2: "Proposta concluída e horas transferidas!",
      });
      setModalVisible(false);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro ao Concluir",
        text2: getFirebaseErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (proposal: Proposal) => {
    if (!user) return;
    const otherUserId =
      user.uid === proposal.senderId ? proposal.receiverId : proposal.senderId;
    navigation.navigate("Chat", { chatId: proposal.id, otherUserId });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {proposals.length === 0 ? (
        <View style={styles.centered}>
          <Text>Nenhuma proposta recebida no momento.</Text>
        </View>
      ) : (
        <FlatList
          data={proposals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.proposalItem}>
              <Text style={styles.proposalText}>
                De:{" "}
                {item.senderProfile?.name ||
                  item.senderProfile?.email ||
                  "Usuário desconhecido"}
              </Text>
              <Text style={styles.proposalText}>
                Oferecendo: {item.skillOffered}
              </Text>
              <Text style={styles.proposalText}>
                Solicitando: {item.skillRequested}
              </Text>
              <Text style={styles.proposalText}>Status: {item.status}</Text>

              {item.status === "pending" && (
                <View style={styles.buttonContainer}>
                  <AppButton
                    title="Aceitar"
                    onPress={() => handleAcceptProposal(item)}
                    variant="secondary"
                    style={styles.flexButton}
                  />
                  <AppButton
                    title="Rejeitar"
                    onPress={() => handleRejectProposal(item.id)}
                    variant="danger"
                    style={styles.flexButton}
                  />
                </View>
              )}
              {item.status === "accepted" && (
                <View style={styles.buttonContainer}>
                  <AppButton
                    title="Iniciar Chat"
                    onPress={() => handleStartChat(item)}
                    variant="primary"
                    style={styles.flexButton}
                  />
                  <AppButton
                    title="Concluir Troca"
                    onPress={() => openCompletionModal(item)}
                    variant="action"
                    style={styles.flexButton}
                  />
                </View>
              )}
            </View>
          )}
        />
      )}

      {currentProposal && (
        <CompletionModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onConfirm={handleConfirmCompletion}
          currentProposal={currentProposal}
          loading={loading}
          currentUserUid={user?.uid || ""}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  proposalItem: {
    backgroundColor: COLORS.white,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  proposalText: {
    fontSize: FONT_SIZES.body,
    marginBottom: 5,
    color: COLORS.textDark,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    gap: 10,
  },
  flexButton: { flex: 1 },
});

export default ReceivedProposalsScreen;

import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";

import { listenForUserChats } from "../../api/firestore"; // Ajuste o caminho se necessário
import { AuthContext } from "../../hooks/useAuth"; // Ajuste o caminho para seu AuthContext
import { Chat } from "../../types"; // Certifique-se de ter o tipo 'Chat' definido

// Este é um componente de navegação padrão.
// Você pode precisar tipá-lo melhor dependendo da sua configuração de navegação.
type NavigationProps = {
  navigate: (screen: string, params: any) => void;
};

const ChatListScreen = () => {
  const { user } = useContext(AuthContext); // Pega o usuário do contexto de autenticação
  const navigation = useNavigation<NavigationProps>();

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Inicia o "ouvinte" do Firestore. A função retorna um 'unsubscribe'.
    const unsubscribe = listenForUserChats(user.uid, (fetchedChats) => {
      setChats(fetchedChats);
      if (loading) {
        setLoading(false);
      }
    });

    // Função de limpeza: será chamada quando o componente for desmontado.
    // Isso é CRUCIAL para evitar vazamentos de memória.
    return () => {
      console.log("Unsubscribing from chat listener...");
      unsubscribe();
    };
  }, [user]); // O useEffect será re-executado se o usuário mudar.

  const handlePressChat = (chat: Chat) => {
    // Encontra os dados do outro participante para passar para a próxima tela
    const recipient = chat.participantInfo.find((p) => p.uid !== user?.uid);

    navigation.navigate("ChatDetail", {
      chatId: chat.id,
      recipientName: recipient?.name || "Chat",
      recipientAvatar: recipient?.avatarUrl,
    });
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const recipient = item.participantInfo.find((p) => p.uid !== user?.uid);

    // Formata a data da última mensagem de forma amigável (ex: "5 min", "2 h", "3 d")
    const timeAgo = item.lastMessage?.createdAt
      ? formatDistanceToNowStrict(
          (item.lastMessage.createdAt as any).toDate(),
          {
            addSuffix: false,
            locale: ptBR,
          }
        )
      : "";

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handlePressChat(item)}>
        <Image
          source={{
            uri: recipient?.avatarUrl || "https://via.placeholder.com/50",
          }}
          style={styles.avatar}
        />
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.userName}>{recipient?.name}</Text>
            <Text style={styles.timestamp}>{timeAgo}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage?.text || "Nenhuma mensagem ainda."}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Você ainda não tem conversas.</Text>
        <Text style={styles.emptySubText}>
          Inicie uma troca para começar a conversar!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={chats}
      renderItem={renderChatItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
  chatItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
});

export default ChatListScreen;

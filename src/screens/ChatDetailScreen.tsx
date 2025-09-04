import React, { useState, useEffect, useCallback } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { useRoute, useNavigation } from "@react-navigation/native";

import { listenForChatMessages, sendMessage } from "../api/firestore";
import { useAuth } from "../contexts/AuthContext";

// Tipagem para os parâmetros recebidos da navegação
type ChatDetailRouteParams = {
  chatId: string;
  recipientName: string;
};

const ChatDetailScreen = () => {
  const { user } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();

  // Extrai os parâmetros passados da tela anterior
  const { chatId, recipientName } = route.params as ChatDetailRouteParams;

  const [messages, setMessages] = useState<IMessage[]>([]);

  // Define o título da tela com o nome do destinatário
  useEffect(() => {
    navigation.setOptions({ title: recipientName || "Chat" });
  }, [navigation, recipientName]);

  // Efeito para "escutar" as mensagens do chat em tempo real
  useEffect(() => {
    if (!chatId) return;

    // Inicia o listener e guarda a função de unsubscribe
    const unsubscribe = listenForChatMessages(chatId, (newMessages) => {
      setMessages(newMessages);
    }, (error) => {
      console.error(error);
    });

    // Função de limpeza para parar de escutar quando a tela for fechada
    return () => unsubscribe();
  }, [chatId]);

  // Função para ENVIAR uma nova mensagem
  // Usamos useCallback para otimização, evitando que a função seja recriada a cada render
  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      // GiftedChat envia as mensagens como um array, pegamos a primeira
      const messageToSend = newMessages[0];

      if (messageToSend && user) {
        // Chama nossa função da API para salvar a mensagem no Firestore
        sendMessage(chatId, user.uid, messageToSend.text);
      }
    },
    [chatId, user]
  );

  // Se o usuário ainda não carregou, não renderiza o chat
  if (!user) {
    return null;
  }

  // A renderização é surpreendentemente simples graças ao GiftedChat
  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: user.uid,
      }}
      placeholder="Digite sua mensagem..."
      alwaysShowSend
    />
  );
};

export default ChatDetailScreen;

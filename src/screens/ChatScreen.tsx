// src/screens/ChatScreen.tsx

import React, { useState, useEffect, useCallback, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  GiftedChat,
  IMessage,
  Bubble,
  InputToolbar,
} from "react-native-gifted-chat";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { getMessages, sendMessage, getUserProfile } from "../api/firestore";
import { Message, UserProfile } from "../types";
import { COLORS } from "../constants";
import { Timestamp } from "firebase/firestore";
import AppButton from "../components/common/AppButton"; // Para o botão de "Sugerir Encontro"

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();

  const { chatId, otherUserId } = route.params as {
    chatId: string;
    otherUserId: string;
  };

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [otherUserProfile, setOtherUserProfile] = useState<UserProfile | null>(
    null
  );

  useEffect(() => {
    // Busca o perfil do outro usuário para mostrar o nome no header
    getUserProfile(otherUserId).then((profile) => {
      if (profile) {
        setOtherUserProfile(profile);
        navigation.setOptions({ title: profile.name || profile.email });
      }
    });

    // Ouve as mensagens em tempo real
    const unsubscribe = getMessages(
      chatId,
      (firebaseMessages: Message[]) => {
        const formattedMessages = firebaseMessages.map((msg) => ({
          _id: msg.id,
          text: msg.text,
          createdAt: (msg.createdAt as Timestamp).toDate(),
          user: {
            _id: msg.senderId,
            // Podemos adicionar name e avatar se quisermos mostrar na bolha
          },
        }));
        setMessages(formattedMessages);
      },
      (error) => {
        console.error(error);
      }
    );

    return () => unsubscribe();
  }, [chatId, otherUserId]);

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      if (user) {
        const { text } = newMessages[0];
        sendMessage(chatId, user.uid, text);
      }
    },
    [chatId, user]
  );

  // Função para renderizar a barra de ferramentas customizada
  const renderInputToolbar = (props) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      primaryStyle={{ alignItems: "center" }}
    />
  );

  // Você ainda pode adicionar o botão "Sugerir Encontro"
  // Esta é uma maneira de adicioná-lo, mas existem outras mais elegantes
  const renderActions = (props) => (
    <AppButton
      title="Sugerir Encontro"
      onPress={() => console.log("Abrir modal de encontro")}
    />
  );

  if (!user) return null;

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: user.uid,
        }}
        placeholder="Digite sua mensagem..."
        alwaysShowSend
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: { backgroundColor: COLORS.primary },
              left: { backgroundColor: COLORS.white },
            }}
            textStyle={{
              right: { color: COLORS.white },
              left: { color: COLORS.textDark },
            }}
          />
        )}
        renderInputToolbar={renderInputToolbar}
        // renderActions={renderActions} // Descomente para adicionar o botão
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inputToolbar: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.lightGray,
    borderTopWidth: 1,
  },
});

export default ChatScreen;

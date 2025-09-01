import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Modal, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; // For date/time picker
import { useAuth } from '../../hooks/useAuth.ts';
import { getMessages, sendMessage, getUserProfile, suggestMeetingPoint, getMeetingPoints, updateMeetingPointStatus } from '../../api/firestore.ts';
import { getFirebaseErrorMessage } from "../../utils/errorUtils";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Message, UserProfile, MeetingPoint } from '../../types';
import { COLORS, FONT_SIZES } from '../../constants';
import AppButton from '../../components/common/AppButton.tsx';
import { FirebaseError } from 'firebase/app';

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const ChatScreen = ({ route, navigation }: ChatScreenProps) => {
  const { user } = useAuth();
  const { chatId, otherUserId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [meetingPoints, setMeetingPoints] = useState<MeetingPoint[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUserProfile, setOtherUserProfile] = useState<UserProfile | null>(null);

  // State for message sending
  const [sendingMessage, setSendingMessage] = useState(false);

  // State for meeting point modal
  const [isSuggestMeetingModalVisible, setSuggestMeetingModalVisible] = useState(false);
  const [suggestedLocation, setSuggestedLocation] = useState('');
  const [suggestedDateTime, setSuggestedDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [suggestingMeeting, setSuggestingMeeting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchOtherUserProfile = async () => {
      try {
        const profile = await getUserProfile(otherUserId);
        setOtherUserProfile(profile);
      } catch (error) {
        console.error("Error fetching other user profile:", error);
        Alert.alert("Erro", "Não foi possível carregar o perfil do outro usuário.");
      }
    };
    fetchOtherUserProfile();
  }, [otherUserId]);

  useEffect(() => {
    const unsubscribeMessages = getMessages(chatId, (msgs) => {
      setMessages(msgs);
    }, (error) => {
      console.error("Error listening to messages in UI:", error);
      Alert.alert("Erro", "Não foi possível carregar as mensagens em tempo real.");
    });

    const unsubscribeMeetingPoints = getMeetingPoints(chatId, (mps) => {
      setMeetingPoints(mps);
    }, (error) => {
      console.error("Error listening to meeting points in UI:", error);
      Alert.alert("Erro", "Não foi possível carregar os pontos de encontro em tempo real.");
    });

    return () => {
      unsubscribeMessages();
      unsubscribeMeetingPoints();
    };
  }, [chatId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !user) return;

    setSendingMessage(true);
    try {
      await sendMessage(chatId, user.uid, newMessage, otherUserId);
      setNewMessage('');
    } catch (error: unknown) {
      const errorMessage = getFirebaseErrorMessage(error);
      Alert.alert("Erro", errorMessage);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSuggestMeeting = async () => {
    if (!user || !suggestedLocation.trim()) {
      Alert.alert("Erro", "Por favor, preencha o local sugerido.");
      return;
    }
    setSuggestingMeeting(true);
    try {
      await suggestMeetingPoint(chatId, user.uid, suggestedLocation, suggestedDateTime);
      Toast.show({
      type: "success",
      text1: "Sucesso!",
      text2: "Ponto de encontro sugerido!",
    });
      setSuggestMeetingModalVisible(false);
      setSuggestedLocation('');
      setSuggestedDateTime(new Date());
    } catch (error: unknown) {
      const errorMessage = getFirebaseErrorMessage(error);
      Alert.alert("Erro", errorMessage);
    } finally {
      setSuggestingMeeting(false);
    }
  };

  const handleUpdateMeetingStatus = async (meetingPointId: string, status: 'accepted' | 'rejected') => {
    setUpdatingStatus(true);
    try {
      await updateMeetingPointStatus(chatId, meetingPointId, status);
      Toast.show({
        type: "success",
        text1: "Sucesso!",
        text2: `Ponto de encontro ${status === 'accepted' ? 'aceito' : 'rejeitado'}!`, 
      });
    } catch (error: unknown) {
      setUpdatingStatus(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || suggestedDateTime;
    setShowDatePicker(Platform.OS === 'ios');
    setSuggestedDateTime(currentDate);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || suggestedDateTime;
    setShowTimePicker(Platform.OS === 'ios');
    setSuggestedDateTime(currentTime);
  };

  const renderItem = ({ item }: { item: Message | MeetingPoint }) => {
    if ('text' in item) { // It's a message
      return (
        <View style={[
          styles.messageBubble,
          item.senderId === user?.uid ? styles.myMessage : styles.otherMessage
        ]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>{item.createdAt?.toDate().toLocaleTimeString()}</Text>
        </View>
      );
    } else { // It's a meeting point
      const isSender = item.senderId === user?.uid;
      return (
        <View style={[
          styles.meetingPointBubble,
          isSender ? styles.myMeetingPoint : styles.otherMeetingPoint
        ]}>
          <Text style={styles.meetingPointTitle}>Ponto de Encontro Sugerido</Text>
          <Text style={styles.meetingPointText}>Local: {item.location}</Text>
          <Text style={styles.meetingPointText}>Data: {item.dateTime?.toDate().toLocaleDateString()}</Text>
          <Text style={styles.meetingPointText}>Hora: {item.dateTime?.toDate().toLocaleTimeString()}</Text>
          <Text style={styles.meetingPointStatus}>Status: {item.status}</Text>
          {item.status === 'pending' && !isSender && (
            <View style={styles.meetingPointActions}>
              <AppButton title="Aceitar" onPress={() => handleUpdateMeetingStatus(item.id, 'accepted')} variant="success" style={styles.meetingActionButton} loading={updatingStatus} />
              <AppButton title="Rejeitar" onPress={() => handleUpdateMeetingStatus(item.id, 'rejected')} variant="danger" style={styles.meetingActionButton} loading={updatingStatus} />
            </View>
          )}
        </View>
      );
    }
  };

  const combinedChatItems = useMemo(() => {
    const allItems = [...messages, ...meetingPoints];
    return allItems.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
  }, [messages, meetingPoints]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Adjust as needed
    >
      <Text style={styles.chatHeader}>Chat com {otherUserProfile?.name || otherUserProfile?.email || 'Usuário'}</Text>
      <FlatList
        data={combinedChatItems}
        keyExtractor={(item, index) => item.id + (item as any).type + index} // Add type to key for uniqueness
        renderItem={renderItem}
        inverted={true} // Show latest messages at the bottom
        style={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Digite sua mensagem..."
          multiline
        />
        <AppButton title="Enviar" onPress={handleSendMessage} loading={sendingMessage} variant="primary" style={styles.sendButton} />
        <AppButton title="Sugerir Encontro" onPress={() => setSuggestMeetingModalVisible(true)} variant="secondary" style={styles.suggestMeetingButton} />
      </View>

      {/* Suggest Meeting Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSuggestMeetingModalVisible}
        onRequestClose={() => setSuggestMeetingModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Sugerir Ponto de Encontro</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Local do encontro"
              value={suggestedLocation}
              onChangeText={setSuggestedLocation}
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
              <Text>Data: {suggestedDateTime.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={suggestedDateTime}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.datePickerButton}>
              <Text>Hora: {suggestedDateTime.toLocaleTimeString()}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={suggestedDateTime}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}

            <View style={styles.modalButtonContainer}>
              <AppButton title="Cancelar" onPress={() => setSuggestMeetingModalVisible(false)} variant="danger" style={styles.flexButton} />
              <AppButton title="Sugerir" onPress={handleSuggestMeeting} loading={suggestingMeeting} variant="primary" style={styles.flexButton} />
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  chatHeader: {
    fontSize: FONT_SIZES.h2,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    color: COLORS.textDark,
    paddingTop: Platform.OS === 'android' ? 20 : 0, // Adjust for Android status bar
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.secondary, // Light green
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white, // Light gray
  },
  messageText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textDark,
  },
  messageTime: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMedium,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100, // Limit height for multiline input
    backgroundColor: COLORS.white,
    fontSize: FONT_SIZES.body,
    color: COLORS.textDark,
  },
  sendButton: {
    width: 80,
    height: 40,
    marginVertical: 0,
  },
  suggestMeetingButton: {
    width: 120,
    height: 40,
    marginVertical: 0,
    marginLeft: 10,
  },
  // Meeting Point Styles
  meetingPointBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  myMeetingPoint: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary + '1A', // Primary with some transparency
  },
  otherMeetingPoint: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
  },
  meetingPointTitle: {
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
    marginBottom: 5,
    color: COLORS.textDark,
  },
  meetingPointText: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMedium,
    marginBottom: 3,
  },
  meetingPointStatus: {
    fontSize: FONT_SIZES.caption,
    fontWeight: 'bold',
    marginTop: 5,
    color: COLORS.textDark,
  },
  meetingPointActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    gap: 10,
  },
  meetingActionButton: {
    flex: 1,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: FONT_SIZES.h2,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.textDark,
  },
  modalInput: {
    width: '100%',
    height: 50,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    fontSize: FONT_SIZES.body,
    color: COLORS.textDark,
  },
  datePickerButton: {
    width: '100%',
    padding: 15,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
  flexButton: {
    flex: 1,
  },
});

export default ChatScreen;
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import AppButton from '../common/AppButton';
import { COLORS, FONT_SIZES } from '../../constants';
import { Proposal, UserProfile } from '../../types';

interface CompletionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (proposalId: string, studentId: string, teacherId: string, hours: number) => Promise<void>;
  currentProposal: Proposal | null;
  loading: boolean;
  currentUserUid: string; // To determine who is the student/teacher
}

const CompletionModal: React.FC<CompletionModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  currentProposal,
  loading,
  currentUserUid,
}) => {
  const [hours, setHours] = useState('');
  const [iWasTheTeacher, setIWasTheTeacher] = useState<boolean | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!currentProposal || !hours || iWasTheTeacher === null) {
      setCompletionError("Preencha todos os campos: horas e quem ensinou.");
      return;
    }
    const numHours = parseFloat(hours);
    if (isNaN(numHours) || numHours <= 0) {
      setCompletionError("As horas devem ser um número positivo.");
      return;
    }

    const { id, senderId, receiverId } = currentProposal;
    let studentId: string;
    let teacherId: string;

    if (iWasTheTeacher) { // Current user was the teacher
      teacherId = currentUserUid;
      studentId = (currentUserUid === senderId) ? receiverId : senderId;
    } else { // Current user was the student
      studentId = currentUserUid;
      teacherId = (currentUserUid === senderId) ? receiverId : senderId;
    }

    try {
      await onConfirm(id, studentId, teacherId, numHours);
      onClose(); // Close modal on success
    } catch (error: any) {
      // Error handling is done in the parent component's onConfirm function
      // We just need to ensure the modal stays open if there's an error
      setCompletionError(error.message || "Erro ao concluir a troca.");
    }
  };

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isVisible) {
      setHours('');
      setIWasTheTeacher(null);
      setCompletionError(null);
    }
  }, [isVisible]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Concluir Troca</Text>
          
          <TextInput
            style={styles.modalInput}
            placeholder="Nº de horas da troca"
            keyboardType="numeric"
            value={hours}
            onChangeText={setHours}
          />

          <Text style={styles.modalSectionTitle}>Na troca, quem ensinou?</Text>
          <View style={styles.teacherSelector}>
              <TouchableOpacity 
                  style={[styles.teacherButton, iWasTheTeacher === true && styles.teacherButtonSelected]}
                  onPress={() => setIWasTheTeacher(true)}>
                  <Text style={[styles.teacherButtonText, iWasTheTeacher === true && styles.teacherButtonTextSelected]}>Eu ensinei</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                  style={[styles.teacherButton, iWasTheTeacher === false && styles.teacherButtonSelected]}
                  onPress={() => setIWasTheTeacher(false)}>
                  <Text style={[styles.teacherButtonText, iWasTheTeacher === false && styles.teacherButtonTextSelected]}>Ele(a) me ensinou</Text>
              </TouchableOpacity>
          </View>

          {completionError ? <Text style={styles.modalError}>{completionError}</Text> : null}

          <View style={styles.modalButtonContainer}>
            <AppButton title="Cancelar" onPress={onClose} variant="danger" style={styles.flexButton} />
            <AppButton title="Confirmar" onPress={handleConfirm} loading={loading} variant="primary" style={styles.flexButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { 
    width: '90%',
    backgroundColor: COLORS.white, 
    borderRadius: 20, 
    padding: 25, 
    alignItems: 'center', 
    elevation: 5 
  },
  modalTitle: { fontSize: FONT_SIZES.h2, fontWeight: 'bold', marginBottom: 15 },
  modalInput: { 
    width: '100%', 
    height: 50, 
    borderColor: COLORS.lightGray, 
    borderWidth: 1, 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    marginBottom: 20 
  },
  modalSectionTitle: { fontSize: FONT_SIZES.body, fontWeight: '600', marginBottom: 10 },
  teacherSelector: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  teacherButton: { 
    flex: 1, 
    padding: 15, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: COLORS.primary, 
    alignItems: 'center',
    marginHorizontal: 5
  },
  teacherButtonSelected: { backgroundColor: COLORS.primary },
  teacherButtonText: { color: COLORS.primary, fontWeight: 'bold' },
  teacherButtonTextSelected: { color: COLORS.white },
  modalError: { color: COLORS.danger, marginBottom: 10 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 },
  flexButton: { flex: 1 },
});

export default CompletionModal;
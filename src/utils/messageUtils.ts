import { Alert } from 'react-native';

/**
 * Displays a message to the user. Can be extended to use toast messages or other UI elements.
 * @param {string} title - The title of the message.
 * @param {string} message - The content of the message.
 * @param {'success' | 'error' | 'info'} type - The type of message (e.g., 'success', 'error', 'info').
 */
export const displayMessage = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // For now, we'll use Alert.alert. In the future, this could be replaced with a toast library.
  Alert.alert(title, message);
};
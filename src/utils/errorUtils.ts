import { FirebaseError } from 'firebase/app';

/**
 * Provides a user-friendly error message based on a FirebaseError code.
 * @param {unknown} error - The error object caught in a catch block.
 * @returns {string} - A user-friendly error message.
 */
export const getFirebaseErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      // Auth errors
      case 'auth/email-already-in-use':
        return 'Este email já está em uso.';
      case 'auth/invalid-email':
        return 'O formato do email é inválido.';
      case 'auth/weak-password':
        return 'A senha é muito fraca. Tente uma mais forte.';
      case 'auth/user-not-found':
        return 'Nenhum usuário encontrado com este email.';
      case 'auth/wrong-password':
        return 'Senha incorreta. Por favor, tente novamente.';
      case 'auth/invalid-credential':
        return 'Credenciais inválidas. Verifique o e-mail e a senha e tente novamente.';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas de login. Tente novamente mais tarde.';

      // Firestore errors (examples, add more as needed)
      case 'permission-denied':
        return 'Você não tem permissão para realizar esta ação.';
      case 'unavailable':
        return 'Serviço indisponível. Tente novamente mais tarde.';
      case 'not-found':
        return 'O recurso solicitado não foi encontrado.';

      default:
        // Log the full error code for debugging in development
        console.error('Unhandled Firebase error code:', error.code, error.message);
        return 'Ocorreu um erro inesperado. Tente novamente.';
    }
  } else if (error instanceof Error) {
    return error.message;
  }
  return 'Ocorreu um erro desconhecido.';
};
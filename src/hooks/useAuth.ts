import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.tsx';
import { AuthContextType } from '../contexts/AuthContext'; // Import the type

export const useAuth = (): AuthContextType => { // Specify the return type
  return useContext(AuthContext);
};
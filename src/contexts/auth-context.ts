import { createContext } from 'react';
import type { AuthContextType } from './auth-context-type';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

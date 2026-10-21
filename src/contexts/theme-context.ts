import { createContext } from 'react';

export interface ThemeSettings {
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
}

export const defaultTheme: ThemeSettings = {
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#D4AF37', // Gold
  secondaryColor: '#1a1a2e',
  accentColor: '#C5A028',
  fontFamily: 'Inter',
  borderRadius: '8'
};

export interface ThemeContextType {
  theme: ThemeSettings;
  isLoading: boolean;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  isLoading: true
});

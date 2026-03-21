import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export type Theme = {
  isDark: boolean;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    secondary: string;
    error: string;
    tabBackground: string;
    tabIconDefault: string;
    tabIconSelected: string;
  };
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#0a0e17', // Deep navy blue
    card: '#111827', // A bit lighter for cards
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#1F2937',
    primary: '#10B981', // Emerald
    secondary: '#06B6D4', // Cyan
    error: '#EF4444',
    tabBackground: '#0a0e17',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#06B6D4',
  },
};

const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#10B981',
    secondary: '#0891B2',
    error: '#DC2626',
    tabBackground: '#FFFFFF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#0891B2',
  },
};

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDarkMode(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Define theme colors
export const colors = {
  light: {
    primary: '#4CAF50',
    primaryLight: '#8BC34A',
    primaryDark: '#388E3C',
    secondary: '#FFA726',
    secondaryLight: '#FFB74D',
    secondaryDark: '#F57C00',
    accent: '#29B6F6',
    accentLight: '#4FC3F7',
    accentDark: '#0288D1',
    success: '#66BB6A',
    warning: '#FFA000',
    error: '#F44336',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    card: '#FFFFFF',
    text: '#333333',
    textMedium: '#666666',
    textLight: '#999999',
    border: '#E0E0E0',
  },
  dark: {
    primary: '#388E3C',
    primaryLight: '#4CAF50',
    primaryDark: '#2E7D32',
    secondary: '#F57C00',
    secondaryLight: '#FFA726',
    secondaryDark: '#E65100',
    accent: '#0288D1',
    accentLight: '#29B6F6',
    accentDark: '#01579B',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#FF5252',
    background: '#121212',
    surface: '#1E1E1E',
    card: '#242424',
    text: '#FFFFFF',
    textMedium: '#BBBBBB',
    textLight: '#888888',
    border: '#383838',
  },
};

// Define spacing system (8px grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Define typography
export const typography = {
  fontFamily: {
    regular: 'Nunito-Regular',
    semiBold: 'Nunito-SemiBold',
    bold: 'Nunito-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeight: {
    body: 1.5,  // 150%
    heading: 1.2,  // 120%
  }
};

// Create the context
type Theme = 'light' | 'dark';
type ThemeContextType = {
  theme: Theme;
  colors: typeof colors.light;
  spacing: typeof spacing;
  typography: typeof typography;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: colors.light,
  spacing,
  typography,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemColorScheme === 'dark' ? 'dark' : 'light');
  
  // Update theme when system color scheme changes
  useEffect(() => {
    setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const themeColors = theme === 'light' ? colors.light : colors.dark;

  return (
    <ThemeContext.Provider value={{ theme, colors: themeColors, spacing, typography, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
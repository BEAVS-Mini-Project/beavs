// import React, { createContext, useContext, useEffect, useState } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Appearance, useColorScheme } from 'react-native';

// type Theme = 'light' | 'dark' | 'system';

// interface ThemeContextType {
//   theme: Theme;
//   setTheme: (theme: Theme) => void;
//   colorMode: 'light' | 'dark'; // actual applied theme
//   toggleTheme: () => void;
// }

// const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// export const useTheme = () => {
//   const context = useContext(ThemeContext);
//   if (context === undefined) {
//     throw new Error('useTheme must be used within a ThemeProvider');
//   }
//   return context;
// };

// interface ThemeProviderProps {
//   children: React.ReactNode;
// }

// export const ThemeProvider = ({ children }: ThemeProviderProps) => {
//   const systemColorScheme = useColorScheme(); // 'light' | 'dark'
//   const [theme, setTheme] = useState<Theme>('system');
//   const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

//   useEffect(() => {
//     AsyncStorage.getItem('theme').then((saved) => {
//       if (saved === 'light' || saved === 'dark' || saved === 'system') {
//         setTheme(saved);
//       }
//     });
//   }, []);

//   useEffect(() => {
//     const appliedTheme = theme === 'system' ? systemColorScheme || 'light' : theme;
//     setColorMode(appliedTheme);
//     AsyncStorage.setItem('theme', theme);
//   }, [theme, systemColorScheme]);

//   const toggleTheme = () => {
//     setTheme(prev => {
//       if (prev === 'light') return 'dark';
//       if (prev === 'dark') return 'system';
//       return 'light';
//     });
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, colorMode }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

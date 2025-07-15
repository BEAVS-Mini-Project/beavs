// import React from 'react';
// import { Text, View, TouchableOpacity } from 'react-native';
// import { useTheme } from '@/contexts/ThemeContext';
// import { Sun, Moon, Monitor } from 'lucide-react-native';

// const ThemeToggle = () => {
//   const { theme, toggleTheme } = useTheme();

//   const getThemeInfo = () => {
//     switch (theme) {
//       case 'light':
//         return {
//           icon: <Sun size={20} color="#fbbf24" />, // yellow-400
//           label: 'Light',
//           nextLabel: 'Switch to Dark',
//         };
//       case 'dark':
//         return {
//           icon: <Moon size={20} color="#38bdf8" />, // sky-400
//           label: 'Dark',
//           nextLabel: 'Switch to System',
//         };
//       case 'system':
//         return {
//           icon: <Monitor size={20} color="#6b7280" />, // gray-500
//           label: 'System',
//           nextLabel: 'Switch to Light',
//         };
//       default:
//         return {
//           icon: <Monitor size={20} />,
//           label: 'System',
//           nextLabel: 'Switch to Light',
//         };
//     }
//   };

//   const { icon, label, nextLabel } = getThemeInfo();

//   return (
//     <TouchableOpacity
//       onPress={toggleTheme}
//       accessibilityLabel={nextLabel}
//       className="flex-row items-center space-x-2 p-2 rounded-md"
//     >
//       {icon}
//       <Text className="text-sm text-neutral-800 dark:text-neutral-200">{label}</Text>
//     </TouchableOpacity>
//   );
// };

// export default ThemeToggle;

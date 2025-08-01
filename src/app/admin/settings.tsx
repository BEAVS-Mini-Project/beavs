import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, useColorScheme } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const settingsSections = [
    {
      title: 'General',
      items: [
        { label: 'Notifications', type: 'switch', value: notifications, onValueChange: setNotifications },
        { label: 'Dark Mode', type: 'switch', value: darkMode, onValueChange: setDarkMode },
        { label: 'Auto Sync', type: 'switch', value: autoSync, onValueChange: setAutoSync },
      ]
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile Settings', type: 'link', icon: 'user' },
        { label: 'Change Password', type: 'link', icon: 'lock' },
        { label: 'Privacy Policy', type: 'link', icon: 'shield' },
      ]
    },
    {
      title: 'System',
      items: [
        { label: 'About', type: 'link', icon: 'info-circle' },
        { label: 'Help & Support', type: 'link', icon: 'question-circle' },
        { label: 'Logout', type: 'link', icon: 'sign-out', danger: true },
      ]
    }
  ];

  // const handleLogout = () => {
  //   Alert.alert(
  //     'Confirm Logout',
  //     'Are you sure you want to logout?',
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       { text: 'Logout', onPress: () =>{
  //         supabase.auth.signOut();
  //         router.replace('/login') },
  //       } 
  //     ]
  //   );
  // };

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <View className="p-6">
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mb-6">
            <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{section.title}</Text>
            <View className={`rounded-lg shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <TouchableOpacity className="flex-row items-center justify-between p-4">
                    <View className="flex-row items-center">
                      {('icon' in item) && (
                        <FontAwesome 
                          name={item.icon as any} 
                          size={16} 
                          color={'danger' in item && item.danger ? '#EF4444' : (isDark ? '#fff' : '#6B7280')} 
                          className="mr-3"
                        />
                      )}
                      <Text className={`${isDark ? 'text-white' : 'text-gray-800'} ${'danger' in item && item.danger ? 'text-red-500' : ''}`}>{item.label}</Text>
                    </View>
                    {item.type === 'switch' ? (
                      <Switch
                        value={'value' in item ? item.value : false}
                        onValueChange={'onValueChange' in item ? item.onValueChange : undefined}
                        trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                        thumbColor={'value' in item && item.value ? '#FFFFFF' : '#FFFFFF'}
                      />
                    ) : (
                      <FontAwesome name="chevron-right" size={12} color={isDark ? '#fff' : '#9CA3AF'} />
                    )}
                  </TouchableOpacity>
                  {itemIndex < section.items.length - 1 && (
                    <View className={`h-px ml-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
        {/* Version Info */}
        <View className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Version 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
} 
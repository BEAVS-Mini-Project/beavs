import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

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
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-6">

        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mb-6">
            <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {section.title}
            </Text>
            <View className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <TouchableOpacity className="flex-row items-center justify-between p-4">
                    <View className="flex-row items-center">
                      {('icon' in item) && (
                        <FontAwesome 
                          name={item.icon as any} 
                          size={16} 
                          color={'danger' in item && item.danger ? '#EF4444' : '#6B7280'} 
                          className="mr-3"
                        />
                      )}
                      <Text className={`text-gray-800 dark:text-white ${'danger' in item && item.danger ? 'text-red-500' : ''}`}>
                        {item.label}
                      </Text>
                    </View>
                    {item.type === 'switch' ? (
                      <Switch
                        value={'value' in item ? item.value : false}
                        onValueChange={'onValueChange' in item ? item.onValueChange : undefined}
                        trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                        thumbColor={'value' in item && item.value ? '#FFFFFF' : '#FFFFFF'}
                      />
                    ) : (
                      <FontAwesome name="chevron-right" size={12} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                  {itemIndex < section.items.length - 1 && (
                    <View className="h-px bg-gray-200 dark:bg-gray-700 ml-4" />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Version Info */}
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <Text className="text-center text-gray-500 dark:text-gray-400">
            Version 1.0.0
          </Text>
        </View>
      </View>
    </ScrollView>
  );
} 
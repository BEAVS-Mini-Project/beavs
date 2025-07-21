import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '../../utils/supabase';
import { Stack } from 'expo-router';

export default function AddInvigilatorScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddInvigilator = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields.'
      });
      return;
    }
    setLoading(true);
    // Generate a random password for the new user
    // const password = 'SecurePass123!' //Math.random().toString(36).slice(-10) + 'A1!';
    console.log(password);
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    setLoading(false);
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message
      });
      return;
    }
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: `Invigilator ${password} (${email}) added as invigilator. Password: ${password}`
    });
    setEmail('');
    setPassword('');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <View className="flex-1 justify-center items-center p-6 bg-white dark:bg-black">
        <Text className="text-2xl font-bold mb-6 text-black dark:text-white">Add New Invigilator</Text>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-4 bg-white dark:bg-gray-700 text-black dark:text-white w-full max-w-md"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-4 bg-white dark:bg-gray-700 text-black dark:text-white w-full max-w-md"
        />
        <TouchableOpacity
          className="bg-blue-500 rounded-lg p-4 mt-6 flex-row items-center justify-center w-full max-w-md"
          onPress={handleAddInvigilator}
          disabled={loading}
        >
          <Text className="text-white font-semibold ml-2">{loading ? 'Adding...' : 'Add Invigilator'}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
} 
import React, { useState } from 'react';
import { View, Text, TextInput, Button, useColorScheme, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '../../utils/supabase';
import { Stack } from 'expo-router';

export default function AddInvigilatorScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();

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
    //const password = 'SecurePass123!' //Math.random().toString(36).slice(-10) + 'A1!';
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

  const isDark = colorScheme === 'dark';
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      padding: 24,
      backgroundColor: isDark ? '#111' : '#f9f9f9',
    },
    label: {
      color: isDark ? '#fff' : '#222',
      fontSize: 24,
      marginBottom: 20,
    },
    input: {
      borderWidth: 1,
      borderRadius: 6,
      padding: 12,
      width: Dimensions.get('window').width - 48,
      marginBottom: 16,
      backgroundColor: isDark ? '#222' : '#fff',
      color: isDark ? '#fff' : '#000',
      borderColor: isDark ? '#444' : '#ccc',
    },
  });

  return (
    <>
     <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
    <View style={styles.container}>
      <Text style={styles.label}>Add New Invigilator</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor={isDark ? '#aaa' : '#888'}
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Full Name"
        placeholderTextColor={isDark ? '#aaa' : '#888'}
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TouchableOpacity className="bg-blue-500 rounded-lg p-4 mt-6 flex-row items-center justify-center"
        onPress={handleAddInvigilator}
        disabled={loading}
      >
          <Text className="text-white font-semibold ml-2">{loading ? 'Adding...' : 'Add Invigilator'}</Text>
        </TouchableOpacity>
    </View>
    </>
  );
} 
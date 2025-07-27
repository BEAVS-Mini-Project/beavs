import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import Toast from 'react-native-toast-message';
import { UserPlus, Mail, ArrowLeft } from 'lucide-react-native';
import { handleError, handleSuccess, isNetworkError, isDatabaseError, isAuthError } from '@/utils/errorHandler';

interface InvigilatorFormData {
  email: string;
  full_name: string;
  password: string;
  confirm_password: string;
}

export default function AddInvigilatorScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<InvigilatorFormData>({
    email: '',
    full_name: '',
    password: '',
    confirm_password: '',
  });
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSubmit = async () => {
    if (!formData.email || !formData.full_name || !formData.password || !formData.confirm_password) {
      handleError('Please fill all required fields', 'Missing Fields');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      handleError('Passwords do not match', 'Password Mismatch');
      return;
    }

    if (formData.password.length < 6) {
      handleError('Password must be at least 6 characters', 'Weak Password');
      return;
    }

    setLoading(true);
    try {
      // First, create the user account using signUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: 'invigilator',
          }
        }
      });

      if (authError) {
        if (isAuthError(authError)) {
          if (authError.message.includes('email')) {
            throw new Error('This email is already registered. Please use a different email.');
          } else {
            throw new Error('Authentication error. Please check your input and try again.');
          }
        } else if (isNetworkError(authError)) {
          throw new Error('Network connection issue. Please check your internet connection.');
        } else {
          throw authError;
        }
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user data returned');
      }

      // The profile should be automatically created by the trigger
      // But we can also manually update it to ensure all fields are set
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: 'invigilator',
        })
        .eq('id', authData.user.id);

      if (profileError) {
        // Don't throw here as the user was created successfully
        console.warn('Profile update error:', profileError);
      }

      handleSuccess('Invigilator added successfully. They can now sign in with their email and password.');

      // Reset form
      setFormData({
        email: '',
        full_name: '',
        password: '',
        confirm_password: '',
      });
    } catch (error: any) {
      if (isAuthError(error)) {
        handleError(error.message, 'Authentication Error');
      } else if (isNetworkError(error)) {
        handleError('Network connection issue. Please check your internet connection.', 'Connection Error');
      } else if (isDatabaseError(error)) {
        handleError('Database error occurred. Please try again.', 'Database Error');
      } else {
        handleError(error, 'Invigilator Creation');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>

      <ScrollView className="flex-1 p-4">
        <View className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-blue-800'}`}>
            <Text className="font-semibold">Note:</Text> This will create a new user account with invigilator role. 
            The user will be able to sign in immediately with the provided credentials.
          </Text>
        </View>

        <View className="gap-4">
          <View>
            <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Email Address *</Text>
            <View className={`flex-row items-center border rounded-lg px-4 py-3 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
              <Mail size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <TextInput
                placeholder="Enter email address"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                className={`flex-1 ml-3 ${isDark ? 'text-white' : 'text-black'}`}
              />
            </View>
          </View>

          <View>
            <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Full Name *</Text>
            <View className={`flex-row items-center border rounded-lg px-4 py-3 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
              <UserPlus size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <TextInput
                placeholder="Enter full name"
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                className={`flex-1 ml-3 ${isDark ? 'text-white' : 'text-black'}`}
              />
            </View>
          </View>

          <View>
            <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Password *</Text>
            <TextInput
              placeholder="Enter password (min 6 characters)"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              className={`border rounded-lg px-4 py-3 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
            />
          </View>

          <View>
            <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Confirm Password *</Text>
            <TextInput
              placeholder="Confirm password"
              value={formData.confirm_password}
              onChangeText={(text) => setFormData({ ...formData, confirm_password: text })}
              secureTextEntry
              className={`border rounded-lg px-4 py-3 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`py-3 px-4 rounded-lg ${loading ? 'bg-gray-400' : (isDark ? 'bg-blue-600' : 'bg-blue-500')}`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-semibold">Add Invigilator</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 
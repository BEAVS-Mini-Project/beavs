import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Shield } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useSelectedCourseStore, Course } from '@/contexts/SelectedCourseContext';
import { supabase } from '../../utils/supabase';

export default function ManualOverrideScreen() {
  const [pin, setPin] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [reason, setReason] = useState('');
  const [answerSheetNumber, setAnswerSheetNumber] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const router = useRouter();
  const selectedCourse  = useSelectedCourseStore((state) => state.selectedCourse);
  const course: Course | null = selectedCourse;

  // Auth check for invigilator
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Toast.show({
          type: 'error',
          text1: 'Not Authenticated',
          text2: 'Please log in to perform manual override.',
        });
        router.replace('/login');
        return;
      }
      const userId = session.user.id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (profile?.role !== 'invigilator') {
        Toast.show({
          type: 'error',
          text1: 'Access Denied',
          text2: 'Only invigilators can perform manual override.',
        });
        router.replace('/login');
        return;
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  const handleAuthenticate = () => {
    if (pin === '1234') {
      setIsAuthenticated(true);
      Toast.show({
        type: 'success',
        text1: 'Authentication Successful',
        text2: 'You can now proceed with manual override',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Authentication Failed',
        text2: 'Invalid PIN. Use 1234 for demo',
      });
    }
  };

  const handleConfirm = () => {
    if (!studentId || !studentName || !reason || !answerSheetNumber) {
      Toast.show({
        type: 'error',
        text1: 'Missing Info',
        text2: 'Please fill all fields',
      });
      return;
    }
    Toast.show({
      type: 'success',
      text1: 'Manual Override Recorded',
      text2: `${studentName} marked manually`,
    });
    router.back();
  };

  if (!authChecked) {
    return (
      <View className='flex justify-center'>
        <Text className='text-center m-10 text-muted-foreground'>Checking authentication...</Text>
      </View>
    )
  }

  if (!course) {
    return (
      <View className='flex justify-center'>
        <Text className='text-center m-10 text-red'>No course selected</Text>
      </View>
    )
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <KeyboardAvoidingView
        className='flex-1'
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView className='flex-1 bg-white p-4'>
          <View className='flex-row items-center justify-between mb-4'>
            <Text className='text-lg font-bold'>Manual Override - {course.title}</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className='text-primary text-base'>Cancel</Text>
            </TouchableOpacity>
          </View>

          {!isAuthenticated ? (
            <View className='bg-orange-100 rounded-lg p-4 mb-6'>
              <View className='flex-row items-center mb-2'>
                <Shield size={20} color="#ea580c" />
                <Text className='ml-2 text-orange-600 font-semibold'>Authentication Required</Text>
              </View>
              <TextInput
                placeholder="Enter PIN (demo: 1234)"
                value={pin}
                onChangeText={setPin}
                secureTextEntry
                className='border border-orange-300 rounded px-3 py-2 mt-2 bg-white'
              />
              <TouchableOpacity
                onPress={handleAuthenticate}
                className='bg-orange-600 rounded mt-4 py-3'
              >
                <Text className='text-center text-white font-medium'>Authenticate</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className='gap-4'>
              <TextInput
                placeholder="Student ID"
                value={studentId}
                onChangeText={setStudentId}
                className='border rounded px-3 py-2 bg-white'
              />
              <TextInput
                placeholder="Student Name"
                value={studentName}
                onChangeText={setStudentName}
                className='border rounded px-3 py-2 bg-white'
              />
              <TextInput
                placeholder="Reason (e.g. scanner issue)"
                value={reason}
                onChangeText={setReason}
                className='border rounded px-3 py-2 bg-white'
              />
              <TextInput
                placeholder="Answer Sheet Number"
                value={answerSheetNumber}
                onChangeText={setAnswerSheetNumber}
                className='border rounded px-3 py-2 bg-white'
              />

              <TouchableOpacity
                onPress={handleConfirm}
                className='bg-orange-600 rounded mt-4 py-4'
              >
                <Text className='text-center text-white font-semibold'>Confirm Override</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
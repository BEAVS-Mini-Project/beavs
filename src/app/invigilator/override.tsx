import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Shield } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useSelectedCourseStore, Course } from '@/contexts/SelectedCourseContext';
import { supabase, logAttendance } from '@/utils/supabase';

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
        setAuthChecked(true); // <-- set this before redirect
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
        setAuthChecked(true); // <-- set this before redirect
        router.replace('/login');
        return;
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  const handleConfirm = async () => {
    if (!studentId || !studentName || !reason || !answerSheetNumber) {
      Toast.show({
        type: 'error',
        text1: 'Missing Info',
        text2: 'Please fill all fields',
      });
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const invigilatorId = session.user.id;
      // Find the current exam session for this course (today)
      const today = new Date().toISOString().split('T')[0];
      const { data: sessionData, error: sessionError } = await supabase
        .from('exam_session')
        .select('id')
        .eq('course_id', course?.id)
        .eq('exam_date', today)
        .single();
      if (sessionError || !sessionData) throw sessionError || new Error('No exam session found');
      // Find the room assigned to this invigilator for this course
      const { data: roomData, error: roomError } = await supabase
        .from('exam_room')
        .select('id')
        .eq('invigilator_id', invigilatorId)
        .single();
      if (roomError || !roomData) throw roomError || new Error('No room found');
      // Upsert (insert or update) exam_allocation
      const { data: allocation, error: allocError } = await supabase
        .from('exam_allocation')
        .upsert([
          {
            exam_session_id: sessionData.id,
            exam_room_id: roomData.id,
            student_id: studentId,
            seat_number: answerSheetNumber,
            has_checked_in: true,
            check_in_time: new Date().toISOString(),
            verified_by: invigilatorId,
            fingerprint_matched: false,
            was_manually_verified: true,
            verified_student_number: studentId,
            manual_verification_note: reason,
          },
        ], { onConflict: 'exam_session_id,exam_room_id,student_id' })
        .select()
        .single();
      if (allocError || !allocation) throw allocError || new Error('Failed to upsert allocation');
      // Insert into attendance_log
      await logAttendance({
        exam_allocation_id: allocation.id,
        verified_by: invigilatorId,
        method: 'manual',
        note: reason,
        student_number: studentId,
        fingerprint_matched: false
      });
      Toast.show({
        type: 'success',
        text1: 'Manual Override Recorded',
        text2: `${studentName} marked manually`,
      });
      router.back();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to record manual override',
      });
    }
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
                // onPress={handleAuthenticate}
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
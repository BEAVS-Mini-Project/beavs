import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSelectedCourseStore } from '@/contexts/SelectedCourseContext';
import { supabase, logAttendance } from '@/utils/supabase';
import Toast from 'react-native-toast-message';

export default function ManualOverrideScreen() {
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [answerSheetNumber, setAnswerSheetNumber] = useState('');
  const [reason, setReason] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const router = useRouter();
  const selectedCourse = useSelectedCourseStore((state) => state.selectedCourse);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      setCourse(selectedCourse);
    }
  }, [selectedCourse]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      setAuthChecked(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.replace('/login');
    }
  };

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
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('invigilation_assignment')
        .select(`
          exam_room:exam_room_id(id)
        `)
        .eq('lecturer_id', invigilatorId)
        .eq('exam_session_id', sessionData.id)
        .single();
      if (assignmentError || !assignmentData) throw assignmentError || new Error('No invigilation assignment found');
      
      const roomId = (assignmentData as any)?.exam_room?.id;
      if (!roomId) throw new Error('No room found in assignment');
      
      // Find the course room allocation for this session and room
      const { data: allocationData, error: allocError } = await supabase
        .from('course_room_allocation')
        .select('id')
        .eq('exam_session_id', sessionData.id)
        .eq('exam_room_id', roomId)
        .eq('course_id', course?.id)
        .single();
      if (allocError || !allocationData) throw allocError || new Error('No course room allocation found');
      
      // Insert into attendance_log
      await logAttendance({
        course_room_allocation_id: allocationData.id,
        verified_by: invigilatorId,
        method: 'manual',
        note: reason,
        student_number: studentId,
        fingerprint_matched: false,
        answer_sheet_number: answerSheetNumber
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
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-black' : 'bg-white'}`}>
        <Text className={`text-center m-10 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>Checking authentication...</Text>
      </View>
    )
  }

  if (!course) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-black' : 'bg-white'}`}>
        <Text className={`text-center m-10 ${isDark ? 'text-red-400' : 'text-red-600'}`}>No course selected</Text>
      </View>
    )
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <View className={`px-4 py-2 ${isDark ? 'bg-white' : 'bg-primary'}`}>
        <Text className={`font-bold text-xl ${isDark ? 'text-black' : 'text-white'}`}>Manual Override</Text>
        <Text className={`text-sm opacity-80 ${isDark ? 'text-black' : 'text-white'}`}>Course: {course.title}</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="space-y-4">
          <View>
            <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Student Information</Text>
            <TextInput
              placeholder="Student ID"
              value={studentId}
              onChangeText={setStudentId}
              className={`border rounded-lg px-4 py-3 mb-3 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
            />
            <TextInput
              placeholder="Student Name"
              value={studentName}
              onChangeText={setStudentName}
              className={`border rounded-lg px-4 py-3 mb-3 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
            />
            <TextInput
              placeholder="Answer Sheet Number"
              value={answerSheetNumber}
              onChangeText={setAnswerSheetNumber}
              className={`border rounded-lg px-4 py-3 mb-3 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
            />
          </View>

          <View>
            <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Override Reason</Text>
            <TextInput
              placeholder="Enter reason for manual override..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              className={`border rounded-lg px-4 py-3 mb-3 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
            />
          </View>

          <TouchableOpacity
            onPress={handleConfirm}
            className="bg-blue-500 rounded-lg py-3 px-4"
          >
            <Text className="text-white text-center font-semibold text-lg">Confirm Manual Override</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, useColorScheme, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelectedCourseStore } from '@/contexts/SelectedCourseContext';
import { Fingerprint, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { fetchStudentsForCourse, supabase, logAttendance } from '@/utils/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { handleError, handleSuccess } from '@/utils/errorHandler';

export default function AttendanceScreen() {
  const selectedCourse = useSelectedCourseStore((state) => state.selectedCourse);
  const router = useRouter();
  const [scanStatus, setScanStatus] = useState('Select a student to scan');
  const [scanning, setScanning] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [attendedStudents, setAttendedStudents] = useState<Set<string>>(new Set());
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    
    if (!selectedCourse) {
      router.back();
      return;
    }
    
    if (selectedCourse && selectedCourse.allocation) {
      loadStudents();
    }
  }, [selectedCourse, authChecked]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      
      // Check if user is an invigilator
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (profile?.role !== 'invigilator') {
        router.replace('/login');
        return;
      }
      
      setAuthChecked(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.replace('/login');
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      if (!selectedCourse || !selectedCourse.allocation) {
        setStudents([]);
        setLoading(false);
        return;
      }
      
      const { indexStart, indexEnd } = selectedCourse.allocation;
      const courseId = selectedCourse.id;
      
      if (courseId) {
        const allStudents = await fetchStudentsForCourse(courseId);
        
        // Filter by index range
        const studentsList = allStudents.filter((student: any) => {
          const match = student.index_number.match(/(\d+)$/);
          if (!match) return false;
          const indexNum = parseInt(match[1], 10);
          return indexNum >= indexStart && indexNum <= indexEnd;
        });
        
        setStudents(studentsList);
        loadAttendanceRecords();
      }
    } catch (err) {
      console.error('Error loading students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      if (!selectedCourse?.allocation?.id) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Get existing attendance records for this allocation
      const { data: records } = await supabase
        .from('attendance_log')
        .select('student_number')
        .eq('course_room_allocation_id', selectedCourse.allocation.id);
      
      if (records) {
        const attendedSet = new Set(records.map(r => r.student_number));
        setAttendedStudents(attendedSet);
      }
    } catch (error) {
      console.error('Error loading attendance records:', error);
    }
  };

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    setScanStatus(`Ready to scan: ${student.full_name}`);
  };

  const handleFingerprintScan = async () => {
    if (!selectedStudent || !selectedCourse?.allocation?.id) {
      setScanStatus('Please select a student first');
      return;
    }

    setScanning(true);
    setScanStatus('Scanning fingerprint...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Simulate fingerprint scanning (replace with actual fingerprint verification)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log the attendance
      await logAttendance({
        course_room_allocation_id: selectedCourse.allocation.id,
        verified_by: user.id,
        method: 'biometric',
        student_number: selectedStudent.student_number,
        fingerprint_matched: true,
        note: `Fingerprint scan for ${selectedStudent.full_name}`
      });

      // Update local state
      setAttendedStudents(prev => new Set([...prev, selectedStudent.student_number]));
      setScanStatus('Attendance recorded successfully!');
      handleSuccess(`${selectedStudent.full_name} marked present`);
      
      // Reset selection after a delay
      setTimeout(() => {
        setSelectedStudent(null);
        setScanStatus('Select a student to scan');
      }, 2000);
      
    } catch (error) {
      setScanStatus('Scan failed. Please try again.');
      handleError(error, 'Fingerprint Scan');
    } finally {
      setScanning(false);
    }
  };

  if (!authChecked) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className={`text-lg mt-4 ${isDark ? 'text-white' : 'text-black'}`}>Checking authentication...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'} `}> 
      {/* Header */}
      <View className={`flex-row items-center p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
          Attendance for {selectedCourse ? selectedCourse.title : 'No course selected'}
        </Text>
      </View>
      
      {/* Fingerprint Section */}
      <View className="items-center mb-8 mt-10">
        <View className={`rounded-full p-8 mb-3 border-2 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
          <Fingerprint size={64} color={scanning ? '#2563eb' : (isDark ? '#fff' : '#6b7280')} />
        </View>
        <TouchableOpacity
          onPress={handleFingerprintScan}
          disabled={scanning || !selectedStudent}
          className={`rounded-lg mb-2 py-3 px-8 ${scanning || !selectedStudent ? 'bg-gray-400' : 'bg-blue-600'}`}
        >
          <Text className="text-white font-bold text-lg">
            {scanning ? 'Scanning...' : selectedStudent ? 'Scan Fingerprint' : 'Select Student First'}
          </Text>
        </TouchableOpacity>
        <Text className={`mt-1 ${scanning ? 'text-blue-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>{scanStatus}</Text>
      </View>
      
      <TouchableOpacity onPress={() => router.push('/invigilator/override')} className="mt-2 bg-orange-600 rounded-lg px-6 py-3">
        <Text className="text-white font-semibold">Manual Override</Text>
      </TouchableOpacity>

      {/* Student List */}
      <View className="mt-8 flex-1 px-4">
        <Text className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Students in this Room/Session ({students.length} found)
        </Text>
        {loading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading students...</Text>
          </View>
        ) : students.length === 0 ? (
          <View className="items-center py-8">
            <Text className={isDark ? 'text-gray-400' : 'text-gray-600'}>No students found for this allocation.</Text>
            <Text className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Check if the allocation data is correct
            </Text>
          </View>
        ) : (
          <ScrollView className="max-h-64">
            {students.map((student) => {
              const isAttended = attendedStudents.has(student.student_number);
              const isSelected = selectedStudent?.id === student.id;
              
              return (
                <TouchableOpacity
                  key={student.id}
                  onPress={() => handleStudentSelect(student)}
                  className={`flex-row justify-between py-2 px-4 border-b ${
                    isSelected 
                      ? isDark ? 'bg-blue-900 border-blue-500' : 'bg-blue-100 border-blue-500'
                      : isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <Text className={`${isDark ? 'text-white' : 'text-gray-800'} ${isSelected ? 'font-bold' : ''}`}>
                      {student.full_name}
                    </Text>
                    {isAttended && (
                      <CheckCircle size={16} color="#10B981" className="ml-2" />
                    )}
                  </View>
                  <Text className={isDark ? 'text-gray-400' : 'text-gray-600'}>{student.index_number}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
} 
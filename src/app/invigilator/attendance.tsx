import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, useColorScheme, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelectedCourseStore } from '@/contexts/SelectedCourseContext';
import { Fingerprint } from 'lucide-react-native';
import { fetchStudentsForAllocation } from '@/utils/supabase';

export default function AttendanceScreen() {
  const selectedCourse = useSelectedCourseStore((state) => state.selectedCourse);
  const router = useRouter();
  const [scanStatus, setScanStatus] = useState('Place your finger on the scanner');
  const [scanning, setScanning] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (selectedCourse && selectedCourse.allocation && (selectedCourse.program_id || selectedCourse.course?.program_id)) {
      loadStudents();
    }
  }, [selectedCourse]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      if (!selectedCourse || !selectedCourse.allocation) {
        setStudents([]);
        setLoading(false);
        return;
      }
      const { indexStart, indexEnd } = selectedCourse.allocation;
      const program_id = selectedCourse.program_id || selectedCourse.course?.program_id;
      if (!program_id) {
        setStudents([]);
        setLoading(false);
        return;
      }
      const studentsList = await fetchStudentsForAllocation({
        index_start: indexStart,
        index_end: indexEnd,
        program_id,
      });
      setStudents(studentsList);
    } catch (err) {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFingerprintScan = () => {
    setScanning(true);
    setScanStatus('Scanning...');
    setTimeout(() => {
      setScanning(false);
      setScanStatus('Fingerprint recognized!');
    }, 2000);
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}> 
      <Text className={`text-2xl m-5 ${isDark ? 'text-muted-foreground' : 'text-black'}`}>
        Attendance for {selectedCourse ? selectedCourse.title : 'No course selected'}
      </Text>
      {/* Fingerprint Section */}
      <View className="items-center mb-8">
        <View className={`rounded-full p-8 mb-3 border-2 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
          <Fingerprint size={64} color={scanning ? '#2563eb' : (isDark ? '#fff' : '#6b7280')} />
        </View>
        <TouchableOpacity
          onPress={handleFingerprintScan}
          disabled={scanning}
          className={`rounded-lg mb-2 py-3 px-8 ${scanning ? 'bg-indigo-200' : 'bg-blue-600'}`}
        >
          <Text className="text-white font-bold text-lg">{scanning ? 'Scanning...' : 'Scan Fingerprint'}</Text>
        </TouchableOpacity>
        <Text className={`mt-1 ${scanning ? 'text-blue-600' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>{scanStatus}</Text>
      </View>
      <TouchableOpacity onPress={() => router.push('/invigilator/override')} className="mt-2 bg-orange-600 rounded-lg px-6 py-3">
        <Text className="text-white font-semibold">Manual Override</Text>
      </TouchableOpacity>
      {/* Student List */}
      <View className="mt-8 flex-1">
        <Text className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Students in this Room/Session</Text>
        {loading ? (
          <Text className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading students...</Text>
        ) : students.length === 0 ? (
          <Text className={isDark ? 'text-gray-400' : 'text-gray-600'}>No students found for this allocation.</Text>
        ) : (
          <ScrollView className="max-h-64">
            {students.map((student) => (
              <View key={student.id} className={`flex-row justify-between py-2 px-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <Text className={isDark ? 'text-white' : 'text-gray-800'}>{student.full_name}</Text>
                <Text className={isDark ? 'text-gray-400' : 'text-gray-600'}>{student.index_number}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
} 
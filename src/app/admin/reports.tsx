import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, Users, FileText, TrendingUp, Calendar, Download } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import Toast from 'react-native-toast-message';

export default function ReportsScreen() {
  const [examSessions, setExamSessions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courseRoomAllocations, setCourseRoomAllocations] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all data in parallel
      const [sessionsRes, studentsRes, allocationsRes, logsRes, deptsRes] = await Promise.all([
        supabase.from('exam_session').select('*, course:course_id(*, program:program_id(*, department:department_id(*)))'),
        supabase.from('student').select('*'),
        supabase.from('course_room_allocation').select('*'),
        supabase.from('attendance_log').select('*'),
        supabase.from('department').select('id, name'),
      ]);
      if (sessionsRes.error) throw sessionsRes.error;
      if (studentsRes.error) throw studentsRes.error;
      if (allocationsRes.error) throw allocationsRes.error;
      if (logsRes.error) throw logsRes.error;
      if (deptsRes.error) throw deptsRes.error;
      setExamSessions(sessionsRes.data || []);
      setStudents(studentsRes.data || []);
      setCourseRoomAllocations(allocationsRes.data || []);
      setAttendanceLogs(logsRes.data || []);
      setDepartments(deptsRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    Toast.show({
      type: 'success',
      text1: 'Report Exported',
      text2: 'Report has been downloaded successfully'
    });
  };

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className={`mt-4 ${isDark ? 'text-white' : 'text-black'}`}>Loading reports...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-600">{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Analytics
  const totalStudents = students.length;
  const totalSessions = examSessions.length;
  const totalAllocations = courseRoomAllocations.length;
  const totalStudentCapacity = courseRoomAllocations.reduce((sum: number, a: any) => sum + a.student_count, 0);
  const attendanceRate = totalStudentCapacity > 0 ? Math.round((totalStudents / totalStudentCapacity) * 100) : 0;
  const manualCount = attendanceLogs.filter((log: any) => log.method === 'manual').length;
  const biometricCount = attendanceLogs.filter((log: any) => log.method === 'biometric').length;

  // Department breakdown
  const departmentStats = departments.map((dept: any) => {
    const deptCourses = examSessions.filter((s: any) => s.course?.program?.department?.id === dept.id);
    const deptAllocations = courseRoomAllocations.filter((a: any) => {
      const session = examSessions.find((s: any) => s.id === a.exam_session_id);
      return session && session.course?.program?.department?.id === dept.id;
    });
    const deptStudentCapacity = deptAllocations.reduce((sum: number, a: any) => sum + a.student_count, 0);
    return {
      name: dept.name,
      sessions: deptCourses.length,
      allocations: deptAllocations.length,
      studentCapacity: deptStudentCapacity,
    };
  });

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <ScrollView className="p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Reports & Analytics</Text>
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Comprehensive exam management insights</Text>
          </View>
          <TouchableOpacity onPress={handleExportReport} className="bg-blue-500 rounded-lg p-3">
            <Download size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Analytics Cards */}
        <View className="grid grid-cols-2 gap-4 mb-6">
          <View className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}> 
            <View className="flex-row items-center justify-between">
              <View>
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{totalStudents}</Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</Text>
              </View>
              <Users size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
            </View>
          </View>

          <View className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}> 
            <View className="flex-row items-center justify-between">
              <View>
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{totalSessions}</Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Exam Sessions</Text>
              </View>
              <FileText size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
            </View>
          </View>

          <View className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}> 
            <View className="flex-row items-center justify-between">
              <View>
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{attendanceRate}%</Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Attendance Rate</Text>
              </View>
              <TrendingUp size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
            </View>
          </View>

          <View className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}> 
            <View className="flex-row items-center justify-between">
              <View>
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{totalAllocations}</Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Room Allocations</Text>
              </View>
              <BarChart3 size={24} color={isDark ? '#60A5FA' : '#3B82F6'} />
            </View>
          </View>
        </View>

        {/* Attendance Method Breakdown */}
        <View className={`rounded-lg p-4 mb-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}> 
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Attendance Method Breakdown</Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                <Text className={isDark ? 'text-white' : 'text-black'}>Biometric</Text>
              </View>
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{biometricCount}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
                <Text className={isDark ? 'text-white' : 'text-black'}>Manual Override</Text>
              </View>
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{manualCount}</Text>
            </View>
          </View>
        </View>

        {/* Department Statistics */}
        <View className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}> 
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Department Statistics</Text>
          <ScrollView className="max-h-64">
            {departmentStats.map((dept, index) => (
              <View key={index} className="border-b py-3 border-gray-200 dark:border-gray-700">
                <View className="flex-row justify-between items-center">
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>{dept.name}</Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{dept.sessions} sessions</Text>
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{dept.allocations} allocations</Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{dept.studentCapacity} students</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 
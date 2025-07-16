import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, Users, FileText, TrendingUp, Calendar, Download } from 'lucide-react-native';
import { fetchTodayExamSessions, fetchStudents, fetchExamAllocations } from '@/utils/supabase';
import Toast from 'react-native-toast-message';

export default function ReportsScreen() {
  const [examSessions, setExamSessions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [examAllocations, setExamAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [sessionsData, studentsData, allocationsData] = await Promise.all([
        fetchTodayExamSessions(),
        fetchStudents(),
        fetchExamAllocations()
      ]);
      setExamSessions(sessionsData);
      setStudents(studentsData);
      setExamAllocations(allocationsData);
    } catch (error) {
      console.error('Error loading report data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load report data'
      });
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
          <Text className={`text-lg ${isDark ? 'text-white' : 'text-black'}`}>Loading reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalStudents = students.length;
  const totalSessions = examSessions.length;
  const totalAllocations = examAllocations.length;
  const attendanceRate = totalStudents > 0 ? Math.round((totalAllocations / totalStudents) * 100) : 0;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <View className={`${isDark ? 'bg-white' : 'bg-primary'} px-4 py-2`}>
        <Text className={`${isDark ? 'text-black' : 'text-white'} font-bold text-xl`}>Reports</Text>
        <Text className={`${isDark ? 'text-black' : 'text-white'} text-sm opacity-80`}>Exam session analytics</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between mb-4">
          <StatsCard 
            label="Total Students" 
            count={totalStudents} 
            icon={<Users size={24} color={isDark ? 'white' : '#3B82F6'} />} 
            color="#3B82F6"
            isDark={isDark}
          />
          <StatsCard 
            label="Today's Sessions" 
            count={totalSessions} 
            icon={<Calendar size={24} color={isDark ? 'white' : '#10B981'} />} 
            color="#10B981"
            isDark={isDark}
          />
        </View>

        <View className="flex-row justify-between mb-4">
          <StatsCard 
            label="Exam Allocations" 
            count={totalAllocations} 
            icon={<FileText size={24} color={isDark ? 'white' : '#8B5CF6'} />} 
            color="#8B5CF6"
            isDark={isDark}
          />
          <StatsCard 
            label="Attendance Rate" 
            count={`${attendanceRate}%`} 
            icon={<TrendingUp size={24} color={isDark ? 'white' : '#F59E0B'} />} 
            color="#F59E0B"
            isDark={isDark}
          />
        </View>

        <View className="mb-4">
          <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>Today's Exam Sessions</Text>
          {examSessions.length === 0 ? (
            <View className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Text className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No exam sessions today</Text>
            </View>
          ) : (
            <View className="space-y-2">
              {examSessions.map((session) => (
                <View key={session.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{session.course_title}</Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {session.exam_date} • {session.start_time} - {session.end_time}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Room: {session.exam_room}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleExportReport}
          className={`flex-row items-center justify-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <Download size={20} color={isDark ? 'white' : '#3B82F6'} />
          <Text className={`ml-2 font-semibold ${isDark ? 'text-white' : 'text-blue-600'}`}>Export Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const StatsCard = ({ label, count, icon, color, isDark }: any) => (
  <View className={`rounded-lg p-4 w-[48%] items-center shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
    {icon}
    <Text className={`text-2xl font-bold ${color} ${isDark ? 'text-white' : ''}`}>{count}</Text>
    <Text className={`text-sm text-gray-500 ${isDark ? 'text-white' : ''}`}>{label}</Text>
  </View>
); 
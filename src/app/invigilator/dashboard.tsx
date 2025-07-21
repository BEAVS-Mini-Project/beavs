import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserCheck, Users, FileText, RefreshCw, LogOut, Wifi, WifiOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { useSelectedCourseStore } from '@/contexts/SelectedCourseContext';
import { supabase, fetchCourses, fetchTodayExamSessions } from '@/utils/supabase';

export default function DashboardScreen() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [examSessions, setExamSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const selectedCourse = useSelectedCourseStore((state) => state.selectedCourse);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, sessionsData] = await Promise.all([
        fetchCourses(),
        fetchTodayExamSessions()
      ]);
      setCourses(coursesData);
      setExamSessions(sessionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load dashboard data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await loadData();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Data synced successfully'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to sync data'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/login');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to logout'
      });
    }
  };

  const hallName = selectedCourse?.hall || 'Main Hall';
  const totalStudents = selectedCourse?.expectedCount || 0;
  const presentStudents = Math.floor(totalStudents * 0.85); // Mock attendance //TODO: replace with scan count
  const overrideStudents = 0 //attendanceRecords.filter(r => r.status === 'manual_override').length; //TODO: replace with actual overide count
  const absentStudents = totalStudents - presentStudents - overrideStudents;

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className={`text-lg ${isDark ? 'text-white' : 'text-black'}`}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 gap-2 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <View className={`px-4 py-2 flex-row justify-between items-center ${isDark ? 'bg-white' : 'bg-primary'}`}>
        <View>
          <Text className={`font-bold text-lg ${isDark ? 'text-black' : 'text-white'}`}>{hallName} - Dashboard</Text>
          <View className="flex-row items-center">
            {isOnline ? <Wifi size={16} color={isDark ? 'black' : 'white'} /> : <WifiOff size={16} color={isDark ? 'black' : 'white'} />}
            <Text className={`ml-1 text-sm ${isDark ? 'text-black' : 'text-white'}`}>{isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-black' : 'bg-white'}`}>
          <Text className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>{new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="flex-row justify-between flex-wrap gap-4">
          <StatsCard
            label="Total Students"
            count={totalStudents}
            icon={<Users size={24} color={isDark ? '#fff' : '#3B82F6'} />}
            color={isDark ? 'text-white' : 'text-blue-600'}
            isDark={isDark}
          />
          <StatsCard
            label="Present"
            count={presentStudents}
            icon={<UserCheck size={24} color={isDark ? '#fff' : '#10B981'} />}
            color={isDark ? 'text-white' : 'text-green-600'}
            isDark={isDark}
          />
          <StatsCard
            label="Manual Overrides"
            count={overrideStudents}
            icon={<FileText size={32} color={isDark ? '#fff' : 'orange'} />}
            color={isDark ? 'text-white' : 'text-orange-600'}
            isDark={isDark}
          />
          <StatsCard
            label="Absent"
            count={absentStudents}
            icon={<FileText size={24} color={isDark ? '#fff' : '#EF4444'} />}
            color={isDark ? 'text-white' : 'text-red-600'}
            isDark={isDark}
          />
          <StatsCard
            label="Today's Sessions"
            count={examSessions.length}
            icon={<FileText size={24} color={isDark ? '#fff' : '#8B5CF6'} />}
            color={isDark ? 'text-white' : 'text-purple-600'}
            isDark={isDark}
          />
        </View>

        <Divider style={{ marginVertical: 16 }} />
        <QuickAction text={isSyncing ? 'Syncing...' : 'Sync Data'} icon={<RefreshCw size={20} color={isDark ? '#fff' : '#3B82F6'} />} onPress={handleSync} loading={isSyncing} isDark={isDark} />
        <QuickAction text="Logout" icon={<LogOut size={20} color={isDark ? '#fff' : '#EF4444'} />} onPress={handleLogout} danger isDark={isDark} />
      </ScrollView>
    </SafeAreaView>
  );
}

const StatsCard = ({ label, count, icon, color, isDark }: any) => (
  <View className={`rounded-lg p-4 w-[48%] items-center shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
    {icon}
    <Text className={`text-2xl font-bold ${color}`}>{count}</Text>
    <Text className={`text-sm ${isDark ? 'text-white' : 'text-gray-500'}`}>{label}</Text>
  </View>
);

const QuickAction = ({ text, icon, onPress, danger, loading, isDark }: any) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    className={`flex-row items-center p-3 rounded shadow m-2 ${danger ? 'border border-red-600' : ''} ${isDark ? 'bg-gray-800' : 'bg-white'}`}
  >
    {icon}
    <Text className={`ml-2 text-base ${danger ? 'text-red-600' : isDark ? 'text-white' : 'text-black'}`}>{text}</Text>
  </TouchableOpacity>
);
const Divider = ({ style }: any) => (
  <View className={`h-px ${style?.marginVertical ? 'my-4' : ''}`} style={[{ backgroundColor: '#E5E7EB' }, style]} />
);

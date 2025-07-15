import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserCheck, Users, FileText, RefreshCw, LogOut, Wifi, WifiOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { useSelectedCourse } from '../../contexts/SelectedCourseContext';
import { supabase } from '@/utils/supabase';

export default function DashboardScreen() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();
  const { selectedCourse } = useSelectedCourse();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Mock attendance data
  const attendanceRecords = [
    { id: '1', studentName: 'John Doe', studentId: '001', status: 'present', timestamp: Date.now() },
    { id: '2', studentName: 'Jane Smith', studentId: '002', status: 'manual_override', timestamp: Date.now() },
    { id: '3', studentName: 'Mike Johnson', studentId: '003', status: 'present', timestamp: Date.now() },
  ];

  const hallName = selectedCourse ? selectedCourse.title : 'No Course Selected';
  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const overrideCount = attendanceRecords.filter(r => r.status === 'manual_override').length;
  const totalExpected = 150;
  const absentCount = totalExpected - presentCount - overrideCount;

  const handleSync = () => {
    if (!isOnline) {
      Toast.show({
        type: 'error',
        text1: 'No Internet Connection',
        text2: 'Sync pending - will retry when online',
      });
      return;
    }
    setIsSyncing(true);
    // TODO; handle syncing to database
    setTimeout(() => {
      setIsSyncing(false);
      Toast.show({
        type: 'success',
        text1: 'Sync Complete!',
        text2: `${attendanceRecords.length} records uploaded successfully`,
      });
    }, 2000);
  };

  const handleLogout = () => {
    Toast.show({
      type: 'info',
      text1: 'Logging out',
      text2: 'You have been logged out.',
    });
    supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <SafeAreaView className={`flex-1 gap-2 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <View className={`${isDark ? 'bg-white' : 'bg-primary'} px-4 py-2 flex-row justify-between items-center`}>
        <View>
          <Text className={`${isDark ? 'text-black' : 'text-white'} font-bold text-lg`}>{hallName} - Dashboard</Text>
          <View className="flex-row items-center">
            {isOnline ? <Wifi size={16} color={isDark ? 'black' : 'white'} /> : <WifiOff size={16} color={isDark ? 'black' : 'white'} />}
            <Text className={`${isDark ? 'text-black' : 'text-white'} ml-1 text-sm`}>{isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
      </View>

      <ScrollView className={`p-4 space-x-4 ${isDark ?'bg-black':'bg-white'}`}>
        <View className="flex-row justify-between flex-wrap gap-4">
          <StatsCard label="Present" count={presentCount} icon={<UserCheck size={32} color="green" />} color="text-green-600" isDark={isDark} />
          <StatsCard label="Absent" count={absentCount} icon={<Users size={32} color="red" />} color="text-red-600" isDark={isDark} />
          <StatsCard label="Manual Overrides" count={overrideCount} icon={<FileText size={32} color="orange" />} color="text-orange-600" isDark={isDark} />
        </View>

        <QuickAction text={isSyncing ? 'Syncing...' : 'Sync Data'} icon={<RefreshCw size={20} />} onPress={handleSync} isDark={isDark} />
        <QuickAction text="Logout" icon={<LogOut size={20} />} onPress={handleLogout} danger isDark={isDark} />

        {attendanceRecords.length > 0 && (
          <View className="mt-4">
            <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Recent Activity</Text>
            {attendanceRecords.slice(-3).reverse().map(record => (
              <View key={record.id} className={`flex-row justify-between items-center p-3 rounded mb-2 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <View>
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>{record.studentName}</Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{record.studentId}</Text>
                </View>
                <View className="items-end">
                  <Text className={`text-xs font-bold px-2 py-1 rounded ${record.status === 'present' ? (isDark ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800') : (isDark ? 'bg-orange-800 text-orange-100' : 'bg-orange-100 text-orange-800')}`}>{record.status === 'present' ? 'Present' : 'Override'}</Text>
                  <Text className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{new Date(record.timestamp).toLocaleTimeString()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
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

const QuickAction = ({ text, icon, onPress, danger, isDark }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center p-3 rounded shadow m-2 ${danger ? 'border border-red-600' : ''} ${isDark ? 'bg-gray-800' : 'bg-white'}`}
  >
    {icon}
    <Text className={`ml-2 text-base ${danger ? 'text-red-600' : isDark ? 'text-white' : 'text-black'}`}>{text}</Text>
  </TouchableOpacity>
);
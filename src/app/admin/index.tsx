import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    rooms: 0,
    invigilators: 0,
    attendanceRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch stats
      const [{ count: studentCount }, { count: roomCount }, { count: invigilatorCount }] = await Promise.all([
        supabase.from('student').select('*', { count: 'exact', head: true }),
        supabase.from('exam_room').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'invigilator'),
      ]);
      
      // Attendance rate: percent of course_room_allocation with attendance logs
      const { count: totalAllocations } = await supabase
        .from('course_room_allocation')
        .select('*', { count: 'exact', head: true });
      
      const { count: attendanceLogs } = await supabase
        .from('attendance_log')
        .select('*', { count: 'exact', head: true });
      
      const attendanceRate = totalAllocations ? Math.round((attendanceLogs! / totalAllocations) * 100) : 0;
      
      setStats({
        students: studentCount || 0,
        rooms: roomCount || 0,
        invigilators: invigilatorCount || 0,
        attendanceRate,
      });
      
      // Fetch recent activity from attendance_log (last 5 entries)
      const { data: activity } = await supabase
        .from('attendance_log')
        .select(`
          *,
          course_room_allocation:course_room_allocation_id(
            exam_session:exam_session_id(
              course:course_id(*)
            ),
            exam_room:exam_room_id(*)
          )
        `)
        .order('verified_at', { ascending: false })
        .limit(5);
      setRecentActivity(activity || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { title: 'Add Invigilator', icon: "users" as const, route: '/add-invigilator' as const },
    { title: 'Manage Rooms', icon: 'building' as const, route: '/admin/room-management' as const },
    { title: 'View Reports', icon: 'bar-chart' as const, route: '/admin/reports' as const },
    { title: 'Settings', icon: 'cog' as const, route: '/admin/settings' as const },
  ];

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading dashboard...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-600">{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}> 
      <View className="p-6">
        {/* Stats Cards */}
        <View className="grid grid-cols-2 gap-4 mb-6">
          <View className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}> 
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-blue-600'}`}>{stats.students}</Text>
            <Text className={` ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</Text>
          </View>
          <View className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}> 
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-green-600'}`}>{stats.rooms}</Text>
            <Text className={` ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Exam Rooms</Text>
          </View>
          <View className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}> 
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-purple-600'}`}>{stats.invigilators}</Text>
            <Text className={` ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Invigilators</Text>
          </View>
          <View className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}> 
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-orange-600'}`}>{stats.attendanceRate}%</Text>
            <Text className={` ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Attendance Rate</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Quick Actions</Text>
          <View className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.title}
                className={`rounded-lg p-4 shadow-sm flex-row items-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                onPress={() => router.push(action.route)}
              >
                <FontAwesome name={action.icon} size={20} color={isDark ? '#fff' : '#3B82F6'} />
                <Text className={`ml-3 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View>
          <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Recent Activity</Text>
          <View className="space-y-3">
            {recentActivity.map((activity, index) => (
              <View key={index} className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{activity.course_room_allocation?.exam_session?.course?.name || 'Unknown Course'}</Text>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{activity.course_room_allocation?.exam_room?.name || 'Unknown Room'}</Text>
                    <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{new Date(activity.verified_at).toLocaleString()}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${activity.method === 'biometric' ? (isDark ? 'bg-green-900' : 'bg-green-100') : (isDark ? 'bg-orange-900' : 'bg-orange-100')}`}> 
                    <Text className={`text-xs font-medium ${activity.method === 'biometric' ? (isDark ? 'text-green-300' : 'text-green-700') : (isDark ? 'text-orange-300' : 'text-orange-700')}`}>{activity.method === 'biometric' ? 'Biometric' : 'Manual'}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 
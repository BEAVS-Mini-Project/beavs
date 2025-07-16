import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
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
      // Attendance rate: percent of exam_allocation with has_checked_in true
      const { count: checkedInCount } = await supabase
        .from('exam_allocation')
        .select('*', { count: 'exact', head: true })
        .eq('has_checked_in', true);
      const { count: totalAllocations } = await supabase
        .from('exam_allocation')
        .select('*', { count: 'exact', head: true });
      const attendanceRate = totalAllocations ? Math.round((checkedInCount! / totalAllocations) * 100) : 0;
      setStats({
        students: studentCount || 0,
        rooms: roomCount || 0,
        invigilators: invigilatorCount || 0,
        attendanceRate,
      });
      // Fetch recent activity from attendance_log (last 5 entries)
      const { data: activity } = await supabase
        .from('attendance_log')
        .select('*, exam_allocation:exam_allocation_id(seat_number, exam_room_id, exam_session_id, student_id)')
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
    { title: 'Add Invigilator', icon: "users", route: '/add-invigilator' },
    { title: 'Manage Rooms', icon: 'building', route: '/admin/rooms' },
    { title: 'View Reports', icon: 'bar-chart', route: '/admin/reports' },
    { title: 'Settings', icon: 'cog', route: '/admin/settings' },
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
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's an overview of your exam management system.
          </Text>
        </View>

        {/* Statistics Cards */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Overview
          </Text>
          <View className="grid grid-cols-2 gap-4">
            <StatCard title="Total Students" value={stats.students} icon="users" color="bg-blue-500" />
            <StatCard title="Active Rooms" value={stats.rooms} icon="building" color="bg-green-500" />
            <StatCard title="Invigilators" value={stats.invigilators} icon="user-secret" color="bg-purple-500" />
            <StatCard title="Attendance Rate" value={`${stats.attendanceRate}%`} icon="check-circle" color="bg-yellow-500" />
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Quick Actions
          </Text>
          <View className="space-y-3">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => router.push(action.route as any)}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 flex-row items-center shadow-sm"
              >
                <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg items-center justify-center mr-4">
                  <FontAwesome name={action.icon as any} size={16} color="#3B82F6" />
                </View>
                <Text className="flex-1 text-gray-800 dark:text-white font-medium">
                  {action.title}
                </Text>
                <FontAwesome name={"chevron-right" as any} size={12} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View>
          <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Recent Activity
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <View className="space-y-3">
              {recentActivity.length === 0 ? (
                <Text className="text-gray-500">No recent activity</Text>
              ) : recentActivity.map((log, idx) => (
                <View key={log.id || idx} className="flex-row items-center">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  <Text className="flex-1 text-gray-700 dark:text-gray-300">
                    {log.method === 'manual' ? 'Manual override' : 'Biometric'} for student {log.student_number} in seat {log.exam_allocation?.seat_number || ''}
                  </Text>
                  <Text className="text-xs text-gray-500">{log.verified_at ? new Date(log.verified_at).toLocaleString() : ''}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: any, icon: string, color: string }) {
  return (
    <View className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm`}>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-gray-800 dark:text-white">
            {value}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {title}
          </Text>
        </View>
        <View className={`w-10 h-10 rounded-full ${color} items-center justify-center`}>
          <FontAwesome name={icon as any} size={16} color="#FFFFFF" />
        </View>
      </View>
    </View>
  );
} 
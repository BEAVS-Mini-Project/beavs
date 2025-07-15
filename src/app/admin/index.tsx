import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';

export default function AdminDashboard() {
  const [attendanceRate, setAttendanceRate] = useState(94);
  const stats = [
    { title: 'Total Students', value: '1,234', icon: 'users', color: 'bg-blue-500' },
    { title: 'Active Rooms', value: '12', icon: 'building', color: 'bg-green-500' },
    { title: 'Invigilators', value: '8', icon: 'user-secret', color: 'bg-purple-500' },
    { title: 'Attendance Rate', value: `${attendanceRate}%`, icon: 'check-circle', color: 'bg-yellow-500' },
  ];

  const quickActions = [
    { title: 'Add Invigilator', icon: "users", route: '/admin/add-invigilator' },
    { title: 'Manage Rooms', icon: 'building', route: '/admin/rooms' },
    { title: 'View Reports', icon: 'bar-chart', route: '/admin/reports' },
    { title: 'Settings', icon: 'cog', route: '/admin/settings' },
  ];

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
            {stats.map((stat, index) => (
              <View
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-2xl font-bold text-gray-800 dark:text-white">
                      {stat.value}
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </Text>
                  </View>
                  <View className={`w-10 h-10 rounded-full ${stat.color} items-center justify-center`}>
                    <FontAwesome name={stat.icon} size={16} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            ))}
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
                onPress={() => router.push(action.route)}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 flex-row items-center shadow-sm"
              >
                <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg items-center justify-center mr-4">
                  <FontAwesome name={action.icon} size={16} color="#3B82F6" />
                </View>
                <Text className="flex-1 text-gray-800 dark:text-white font-medium">
                  {action.title}
                </Text>
                <FontAwesome name="chevron-right" size={12} color="#9CA3AF" />
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
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                <Text className="flex-1 text-gray-700 dark:text-gray-300">
                  Room A101 attendance updated - 95% present
                </Text>
                <Text className="text-xs text-gray-500">2 min ago</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                <Text className="flex-1 text-gray-700 dark:text-gray-300">
                  New student data uploaded - 150 students added
                </Text>
                <Text className="text-xs text-gray-500">15 min ago</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
                <Text className="flex-1 text-gray-700 dark:text-gray-300">
                  Invigilator assigned to Room B205
                </Text>
                <Text className="text-xs text-gray-500">1 hour ago</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 
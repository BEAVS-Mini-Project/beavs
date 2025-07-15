import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ReportsScreen() {
  const attendanceData = [
    { room: 'A101', total: 30, present: 28, absent: 2, rate: '93%' },
    { room: 'A102', total: 25, present: 25, absent: 0, rate: '100%' },
    { room: 'B201', total: 40, present: 35, absent: 5, rate: '88%' },
    { room: 'B202', total: 35, present: 32, absent: 3, rate: '91%' },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-6">

        {/* Summary Cards */}
        <View className="grid grid-cols-2 gap-4 mb-6">
          <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <Text className="text-2xl font-bold text-blue-500">94%</Text>
            <Text className="text-gray-600 dark:text-gray-400">Overall Attendance</Text>
          </View>
          <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <Text className="text-2xl font-bold text-green-500">130</Text>
            <Text className="text-gray-600 dark:text-gray-400">Total Students</Text>
          </View>
        </View>

        {/* Room-wise Attendance */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Room-wise Attendance
          </Text>
          <View className="space-y-3">
            {attendanceData.map((room) => (
              <View
                key={room.room}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-lg font-semibold text-gray-800 dark:text-white">
                    Room {room.room}
                  </Text>
                  <Text className={`text-lg font-bold ${
                    parseInt(room.rate) >= 90 ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {room.rate}
                  </Text>
                </View>
                <View className="flex-row justify-between text-sm">
                  <Text className="text-gray-600 dark:text-gray-400">
                    Present: {room.present}
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-400">
                    Absent: {room.absent}
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-400">
                    Total: {room.total}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Export Options */}
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Export Reports
          </Text>
          <View className="space-y-3">
            <TouchableOpacity className="flex-row items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FontAwesome name="file-pdf-o" size={20} color="#3B82F6" />
              <Text className="flex-1 text-gray-800 dark:text-white ml-3 font-medium">
                Export as PDF
              </Text>
              <FontAwesome name="download" size={16} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <FontAwesome name="file-excel-o" size={20} color="#10B981" />
              <Text className="flex-1 text-gray-800 dark:text-white ml-3 font-medium">
                Export as Excel
              </Text>
              <FontAwesome name="download" size={16} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <FontAwesome name="file-text-o" size={20} color="#8B5CF6" />
              <Text className="flex-1 text-gray-800 dark:text-white ml-3 font-medium">
                Export as CSV
              </Text>
              <FontAwesome name="download" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 
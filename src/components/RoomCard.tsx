import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface RoomCardProps {
  id: string;
  capacity: number;
  assigned: number;
  invigilator: string;
  status: 'active' | 'inactive';
  onPress?: () => void;
}

export default function RoomCard({ 
  id, 
  capacity, 
  assigned, 
  invigilator, 
  status, 
  onPress 
}: RoomCardProps) {
  return (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xl font-bold text-gray-800 dark:text-white">
          Room {id}
        </Text>
        <View className={`px-3 py-1 rounded-full ${
          status === 'active' 
            ? 'bg-green-100 dark:bg-green-900' 
            : 'bg-gray-100 dark:bg-gray-700'
        }`}>
          <Text className={`text-xs font-medium ${
            status === 'active' 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View className="space-y-2">
        <View className="flex-row justify-between">
          <Text className="text-gray-600 dark:text-gray-400">Capacity:</Text>
          <Text className="text-gray-800 dark:text-white font-medium">
            {assigned}/{capacity}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600 dark:text-gray-400">Invigilator:</Text>
          <Text className="text-gray-800 dark:text-white font-medium">
            {invigilator}
          </Text>
        </View>
      </View>

      {onPress && (
        <View className="flex-row items-center justify-between mt-4">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            Tap to view details
          </Text>
          <FontAwesome name="chevron-right" size={12} color="#9CA3AF" />
        </View>
      )}
    </TouchableOpacity>
  );
} 
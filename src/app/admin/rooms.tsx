import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function RoomsScreen() {
  const [rooms] = useState([
    { id: 'A101', capacity: 30, assigned: 28, invigilator: 'John Smith', status: 'active' },
    { id: 'A102', capacity: 25, assigned: 25, invigilator: 'Sarah Johnson', status: 'active' },
    { id: 'B201', capacity: 40, assigned: 35, invigilator: 'Mike Davis', status: 'active' },
    { id: 'B202', capacity: 35, assigned: 0, invigilator: 'Unassigned', status: 'inactive' },
  ]);

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-6">

        {/* Room Cards */}
        <View className="space-y-4 gap-2">
          {rooms.map((room) => (
            <View
              key={room.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xl font-bold text-gray-800 dark:text-white">
                  Room {room.id}
                </Text>
                <View className={`px-3 py-1 rounded-full ${
                  room.status === 'active' 
                    ? 'bg-green-100 dark:bg-green-900' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Text className={`text-xs font-medium ${
                    room.status === 'active' 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {room.status === 'active' ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

              <View className="space-y-2 gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 dark:text-gray-400">Capacity:</Text>
                  <Text className="text-gray-800 dark:text-white font-medium">
                    {room.assigned}/{room.capacity}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 dark:text-gray-400">Invigilator:</Text>
                  <Text className="text-gray-800 dark:text-white font-medium">
                    {room.invigilator}
                  </Text>
                </View>
              </View>

              <View className="flex-row space-x-2 mt-4 gap-2">
                <TouchableOpacity className="flex-1 bg-blue-500 rounded-lg py-2">
                  <Text className="text-white text-center font-medium">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-gray-500 rounded-lg py-2">
                  <Text className="text-white text-center font-medium">View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Add New Room Button */}
        <TouchableOpacity className="bg-green-500 rounded-lg p-4 mt-6 flex-row items-center justify-center">
          <FontAwesome name="plus" size={16} color="#FFFFFF" />
          <Text className="text-white font-semibold ml-2">Add New Room</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 
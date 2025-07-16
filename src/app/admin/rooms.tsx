import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/utils/supabase';

export default function RoomsScreen() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all rooms
      const { data: roomData, error: roomError } = await supabase
        .from('exam_room')
        .select('id, name, capacity, invigilator_id');
      if (roomError) throw roomError;
      // Fetch all allocations to count assigned students per room
      const { data: allocations, error: allocError } = await supabase
        .from('exam_allocation')
        .select('exam_room_id');
      if (allocError) throw allocError;
      // Fetch invigilator names
      const invigilatorIds = [...new Set(roomData.map((r: any) => r.invigilator_id).filter(Boolean))];
      let invigilators: Record<string, string> = {};
      if (invigilatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name');
        if (profiles) {
          invigilators = Object.fromEntries(profiles.map((p: any) => [p.id, p.full_name]));
        }
      }
      // Compose room info
      const roomsWithStats = roomData.map((room: any) => {
        const assigned = allocations.filter((a: any) => a.exam_room_id === room.id).length;
        return {
          ...room,
          assigned,
          invigilator: room.invigilator_id ? (invigilators[room.invigilator_id] || 'Assigned') : 'Unassigned',
          status: assigned > 0 ? 'active' : 'inactive',
        };
      });
      setRooms(roomsWithStats);
    } catch (err: any) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading rooms...</Text>
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
        {/* Room Cards */}
        <View className="space-y-4 gap-2">
          {rooms.map((room) => (
            <View
              key={room.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xl font-bold text-gray-800 dark:text-white">
                  {room.name}
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
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, useColorScheme } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/utils/supabase';
import RoomModal from '@/components/RoomModal';

export default function RoomsScreen() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [colleges, setColleges] = useState<any[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    // Load colleges first, then rooms
    const loadAll = async () => {
      await loadColleges();
      await loadRooms();
    };
    loadAll();
  }, []);

  const loadColleges = async () => {
    const { data, error } = await supabase.from('college').select('id, name');
    if (!error) setColleges(data || []);
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: roomData, error: roomError } = await supabase
        .from('exam_room')
        .select('id, name, capacity, college_id');
      if (roomError) throw roomError;
      const { data: allocations, error: allocError } = await supabase
        .from('course_room_allocation')
        .select('exam_room_id, student_count');
      if (allocError) throw allocError;
      let collegeMap: Record<string, string> = {};
      if (colleges && colleges.length > 0) {
        collegeMap = Object.fromEntries(colleges.map((c: any) => [c.id, c.name]));
      }
      const roomsWithStats = roomData.map((room: any) => {
        const roomAllocations = allocations.filter((a: any) => a.exam_room_id === room.id);
        const totalAssigned = roomAllocations.reduce((sum: number, a: any) => sum + a.student_count, 0);
        return {
          ...room,
          assigned: totalAssigned,
          status: totalAssigned > 0 ? 'active' : 'inactive',
          collegeName: room.college_id ? (collegeMap[room.college_id] || 'Unknown') : 'Unknown',
        };
      });
      setRooms(roomsWithStats);
    } catch (err: any) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setSelectedRoom(null);
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (room: any) => {
    setSelectedRoom(room);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (roomId: string) => {
    Alert.alert('Delete Room', 'Are you sure you want to delete this room?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setActionLoading(true);
        const { error } = await supabase.from('exam_room').delete().eq('id', roomId);
        setActionLoading(false);
        if (error) {
          Alert.alert('Error', error.message);
        } else {
          loadRooms();
        }
      }}
    ]);
  };

  const handleModalSave = async () => {
    setActionLoading(true);
    await loadRooms();
    setActionLoading(false);
    setShowModal(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedRoom(null);
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
    <ScrollView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}> 
      <View className="p-6">
        {/* Room Cards */}
        <View className="space-y-4 gap-2">
          {rooms.map((room) => (
            <View
              key={room.id}
              className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{room.name}</Text>
                <View className={`px-3 py-1 rounded-full ${room.status === 'active' ? (isDark ? 'bg-green-900' : 'bg-green-100') : (isDark ? 'bg-gray-700' : 'bg-gray-100')}`}> 
                  <Text className={`text-xs font-medium ${room.status === 'active' ? (isDark ? 'text-green-300' : 'text-green-700') : (isDark ? 'text-gray-400' : 'text-gray-600')}`}>{room.status === 'active' ? 'Active' : 'Inactive'}</Text>
                </View>
              </View>

              <View className="space-y-2 gap-2">
                <View className="flex-row justify-between">
                  <Text className={` ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Capacity:</Text>
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{room.assigned}/{room.capacity}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={` ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>College:</Text>
                  <Text className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{room.collegeName}</Text>
                </View>
              </View>

              <View className="flex-row space-x-2 mt-4 gap-2">
                <TouchableOpacity className="flex-1 bg-blue-500 rounded-lg py-2" onPress={() => openEditModal(room)}>
                  <Text className="text-white text-center font-medium">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-gray-500 rounded-lg py-2" onPress={() => handleDelete(room.id)}>
                  <Text className="text-white text-center font-medium">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Add New Room Button */}
        <TouchableOpacity className="bg-green-500 rounded-lg p-4 mt-6 flex-row items-center justify-center" onPress={openAddModal}>
          <FontAwesome name="plus" size={16} color="#FFFFFF" />
          <Text className="text-white font-semibold ml-2">Add New Room</Text>
        </TouchableOpacity>

        {/* Room Modal */}
        <RoomModal
          visible={showModal}
          mode={modalMode}
          roomData={selectedRoom}
          onClose={handleModalClose}
          onSave={handleModalSave}
          loading={actionLoading}
        />
      </View>
    </ScrollView>
  );
} 
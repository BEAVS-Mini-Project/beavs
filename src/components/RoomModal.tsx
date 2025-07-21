import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { supabase } from '@/utils/supabase';

interface RoomModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  roomData?: {
    id: string;
    name: string;
    capacity: number;
    college_id?: string;
  };
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
}

export default function RoomModal({ visible, mode, roomData, onClose, onSave, loading }: RoomModalProps) {
  const [roomForm, setRoomForm] = useState({ id: '', name: '', capacity: '', college_id: '' });
  const [colleges, setColleges] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      loadColleges();
      if (mode === 'edit' && roomData) {
        setRoomForm({
          id: roomData.id,
          name: roomData.name,
          capacity: String(roomData.capacity),
          college_id: roomData.college_id || '',
        });
      } else {
        setRoomForm({ id: '', name: '', capacity: '', college_id: '' });
      }
    }
  }, [visible, mode, roomData]);

  const loadColleges = async () => {
    try {
      const { data, error } = await supabase.from('college').select('id, name');
      if (error) throw error;
      setColleges(data || []);
    } catch (error) {
      console.error('Error loading colleges:', error);
    }
  };

  const handleSave = async () => {
    if (!roomForm.name || !roomForm.capacity || !roomForm.college_id) {
      Alert.alert('Validation', 'Room name, capacity, and college are required.');
      return;
    }

    try {
      if (mode === 'add') {
        const { error } = await supabase.from('exam_room').insert([{
          name: roomForm.name,
          capacity: Number(roomForm.capacity),
          college_id: roomForm.college_id,
        }]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('exam_room').update({
          name: roomForm.name,
          capacity: Number(roomForm.capacity),
          college_id: roomForm.college_id,
        }).eq('id', roomForm.id);
        if (error) throw error;
      }
      onSave();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50">
        <View className="flex-1 justify-center items-center p-4">
          <View className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <Text className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
              {mode === 'add' ? 'Add New Room' : 'Edit Room'}
            </Text>
            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">Room Name</Text>
                <TextInput
                  placeholder="Enter room name"
                  value={roomForm.name}
                  onChangeText={val => setRoomForm(f => ({ ...f, name: val }))}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-black dark:text-white"
                />
              </View>
              <View>
                <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">Capacity</Text>
                <TextInput
                  placeholder="Enter capacity"
                  value={roomForm.capacity}
                  onChangeText={val => setRoomForm(f => ({ ...f, capacity: val.replace(/[^0-9]/g, '') }))}
                  keyboardType="numeric"
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-black dark:text-white"
                />
              </View>
              <View>
                <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">College</Text>
                <ScrollView className="max-h-40 border border-gray-300 dark:border-gray-600 rounded-lg">
                  {colleges.map((college) => (
                    <TouchableOpacity
                      key={college.id}
                      className={`p-3 border-b border-gray-200 dark:border-gray-600 ${roomForm.college_id === college.id ? 'bg-blue-100 dark:bg-blue-900' : 'bg-white dark:bg-gray-700'}`}
                      onPress={() => setRoomForm(f => ({ ...f, college_id: college.id }))}
                    >
                      <Text className={`${roomForm.college_id === college.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-white'}`}>{college.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View className="flex-row mt-6 space-x-3">
              <TouchableOpacity 
                className="flex-1 bg-gray-400 rounded-lg py-3" 
                onPress={onClose} 
                disabled={loading}
              >
                <Text className="text-white text-center font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-blue-500 rounded-lg py-3" 
                onPress={handleSave} 
                disabled={loading}
              >
                <Text className="text-white text-center font-medium">
                  {loading ? 'Saving...' : (mode === 'add' ? 'Add' : 'Save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
} 
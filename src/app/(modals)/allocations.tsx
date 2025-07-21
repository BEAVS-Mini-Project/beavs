import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, useColorScheme } from 'react-native';
import { fetchAllCourseRoomAllocations, deleteCourseRoomAllocation, createCourseRoomAllocation, updateCourseRoomAllocation, fetchAllExamSessions, fetchAllRooms } from '@/utils/supabase';

function AllocationModal({ visible, mode, allocationData, onClose, onSave, loading }: {
  visible: boolean;
  mode: 'add' | 'edit';
  allocationData?: any;
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    exam_session_id: '',
    exam_room_id: '',
    course_id: '',
    index_start: '',
    index_end: '',
    student_count: '',
  });
  const [sessions, setSessions] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (visible) {
      loadSessions();
      loadRooms();
      if (mode === 'edit' && allocationData) {
        setForm({
          exam_session_id: allocationData.exam_session_id,
          exam_room_id: allocationData.exam_room_id,
          course_id: allocationData.course_id,
          index_start: String(allocationData.index_start),
          index_end: String(allocationData.index_end),
          student_count: String(allocationData.student_count),
        });
        setSelectedSession(allocationData.exam_session || null);
      } else {
        setForm({ exam_session_id: '', exam_room_id: '', course_id: '', index_start: '', index_end: '', student_count: '' });
        setSelectedSession(null);
      }
    }
  }, [visible, mode, allocationData]);

  const loadSessions = async () => {
    try {
      const data = await fetchAllExamSessions();
      setSessions(data || []);
    } catch (error) {
      setSessions([]);
    }
  };

  const loadRooms = async () => {
    try {
      const data = await fetchAllRooms();
      setRooms(data || []);
    } catch (error) {
      setRooms([]);
    }
  };

  const handleSessionSelect = (session: any) => {
    setForm(f => ({ ...f, exam_session_id: session.id, course_id: session.course_id }));
    setSelectedSession(session);
  };

  const handleRoomSelect = (room: any) => {
    setForm(f => ({ ...f, exam_room_id: room.id }));
  };

  const handleSave = async () => {
    if (!form.exam_session_id || !form.exam_room_id || !form.course_id || !form.index_start || !form.index_end || !form.student_count) {
      Alert.alert('Validation', 'All fields are required.');
      return;
    }
    try {
      const payload = {
        exam_session_id: form.exam_session_id,
        exam_room_id: form.exam_room_id,
        course_id: form.course_id,
        index_start: Number(form.index_start),
        index_end: Number(form.index_end),
        student_count: Number(form.student_count),
      };
      if (mode === 'add') {
        await createCourseRoomAllocation(payload);
      } else {
        await updateCourseRoomAllocation(allocationData.id, payload);
      }
      onSave();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  // Filter rooms to only show those not already allocated for the selected session
  const allocatedRoomIds = sessions
    .filter(s => s.id === form.exam_session_id)
    .flatMap(s => (s.course_room_allocations || []).map((a: any) => a.exam_room_id));

  const availableRooms = rooms.filter(
    (room: any) =>
      !allocatedRoomIds.includes(room.id) || room.id === form.exam_room_id // allow editing current allocation
  );

  if (!visible) return null;
  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
      <View className={`rounded-2xl p-6 w-[90%] max-w-md shadow-lg ${isDark ? 'bg-gray-900' : 'bg-white'}`}> 
        <Text className={`text-2xl font-bold mb-5 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>{mode === 'add' ? 'Add Allocation' : 'Edit Allocation'}</Text>
        <View className="space-y-4">
          <View>
            <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Exam Session</Text>
            <ScrollView className={`max-h-32 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-300'}`}> 
              {sessions.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} ${form.exam_session_id === session.id ? (isDark ? 'bg-blue-900' : 'bg-blue-100') : (isDark ? 'bg-gray-900' : 'bg-white')}`}
                  onPress={() => handleSessionSelect(session)}
                >
                  <Text className={`${form.exam_session_id === session.id ? (isDark ? 'text-blue-300' : 'text-blue-700') : (isDark ? 'text-white' : 'text-gray-900')}`}>{session.course?.name} ({session.exam_date} {session.start_time})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {selectedSession && (
            <View>
              <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Course</Text>
              <View className={`border rounded-lg px-3 py-2 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-100'}`}>
                <Text className={isDark ? 'text-white' : 'text-gray-900'}>{selectedSession.course?.name || 'Unknown Course'}</Text>
              </View>
            </View>
          )}
          <View>
            <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Room</Text>
            <ScrollView className={`max-h-32 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-300'}`}> 
              {availableRooms.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} ${form.exam_room_id === room.id ? (isDark ? 'bg-blue-900' : 'bg-blue-100') : (isDark ? 'bg-gray-900' : 'bg-white')}`}
                  onPress={() => handleRoomSelect(room)}
                >
                  <Text className={`${form.exam_room_id === room.id ? (isDark ? 'text-blue-300' : 'text-blue-700') : (isDark ? 'text-white' : 'text-gray-900')}`}>{room.name} (Capacity: {room.capacity})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Index Start</Text>
              <TextInput
                placeholder="Start"
                value={form.index_start}
                onChangeText={val => setForm(f => ({ ...f, index_start: val.replace(/[^0-9]/g, '') }))}
                keyboardType="numeric"
                className={`border rounded-lg px-3 py-2 ${isDark ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              />
            </View>
            <View className="flex-1">
              <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Index End</Text>
              <TextInput
                placeholder="End"
                value={form.index_end}
                onChangeText={val => setForm(f => ({ ...f, index_end: val.replace(/[^0-9]/g, '') }))}
                keyboardType="numeric"
                className={`border rounded-lg px-3 py-2 ${isDark ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              />
            </View>
          </View>
          <View>
            <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Student Count</Text>
            <TextInput
              placeholder="Number of students"
              value={form.student_count}
              onChangeText={val => setForm(f => ({ ...f, student_count: val.replace(/[^0-9]/g, '') }))}
              keyboardType="numeric"
              className={`border rounded-lg px-3 py-2 ${isDark ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
            />
          </View>
        </View>
        <View className="flex-row mt-7 space-x-3">
          <TouchableOpacity 
            className={`flex-1 rounded-lg py-3 items-center ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`}
            onPress={onClose} 
            disabled={loading}
          >
            <Text className="text-white font-semibold text-base">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-1 bg-blue-600 rounded-lg py-3 items-center"
            onPress={handleSave} 
            disabled={loading}
          >
            <Text className="text-white font-semibold text-base">{loading ? 'Saving...' : (mode === 'add' ? 'Add' : 'Save')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function AllocationsTab() {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedAllocation, setSelectedAllocation] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadAllocations();
  }, []);

  const loadAllocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllCourseRoomAllocations();
      setAllocations(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load allocations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Allocation', 'Are you sure you want to delete this allocation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setActionLoading(true);
        await deleteCourseRoomAllocation(id);
        await loadAllocations();
        setActionLoading(false);
      }}
    ]);
  };

  const openAddModal = () => {
    setSelectedAllocation(null);
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (allocation: any) => {
    setSelectedAllocation(allocation);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleModalSave = async () => {
    setActionLoading(true);
    await loadAllocations();
    setActionLoading(false);
    setShowModal(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedAllocation(null);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading allocations...</Text>
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
        <View className="flex-row justify-between items-center mb-6">
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Room Allocations</Text>
          <TouchableOpacity className="bg-blue-500 rounded-lg px-4 py-2" onPress={openAddModal}>
            <Text className="text-white font-semibold">Add Allocation</Text>
          </TouchableOpacity>
        </View>
        <View className="space-y-4 gap-2">
          {allocations.length === 0 ? (
            <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No allocations found.</Text>
          ) : (
            allocations.map((a) => (
              <View key={a.id} className={`rounded-lg p-4 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}> 
                <View className="flex-row items-center justify-between mb-2">
                  <Text className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{a.exam_room?.name || 'Unknown Room'}</Text>
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{a.exam_session?.course?.name || 'Unknown Course'}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Index Range:</Text>
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{a.index_start} - {a.index_end}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Student Count:</Text>
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{a.student_count}</Text>
                </View>
                <View className="flex-row space-x-2 mt-3">
                  <TouchableOpacity className="flex-1 bg-blue-500 rounded-lg py-2" onPress={() => openEditModal(a)}>
                    <Text className="text-white text-center font-medium">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-gray-500 rounded-lg py-2" onPress={() => handleDelete(a.id)}>
                    <Text className="text-white text-center font-medium">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
        <AllocationModal
          visible={showModal}
          mode={modalMode}
          allocationData={selectedAllocation}
          onClose={handleModalClose}
          onSave={handleModalSave}
          loading={actionLoading}
        />
      </View>
    </ScrollView>
  );
} 
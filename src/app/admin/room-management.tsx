import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import RoomsScreen from '../(modals)/rooms';
import SessionsTab from '../(modals)/sessions';
import UploadScreen from '../(modals)/upload';
import AllocationsTab from '../(modals)/allocations';
import { fetchAllCourseRoomAllocations, deleteCourseRoomAllocation, fetchAllInvigilationAssignments, deleteInvigilationAssignment, fetchAllExamSessions, deleteExamSession, createInvigilationAssignment } from '@/utils/supabase';
import { supabase } from '@/utils/supabase';
import { handleError, handleSuccess, isNetworkError, isDatabaseError, isAuthError } from '@/utils/errorHandler';

function InvigilatorsTab() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [invigilators, setInvigilators] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedInvigilator, setSelectedInvigilator] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadAssignments();
    loadDropdowns();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllInvigilationAssignments();
      setAssignments(data || []);
    } catch (err: any) {
      const errorMessage = isNetworkError(err) 
        ? 'Network connection issue. Please check your internet connection.'
        : isDatabaseError(err)
        ? 'Database error occurred. Please try again.'
        : err.message || 'Failed to load assignments';
      
      setError(errorMessage);
      handleError(err, 'Assignment Load');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    // Fetch invigilators
    const { data: invigilatorsData } = await supabase.from('profiles').select('id, full_name').eq('role', 'invigilator');
    setInvigilators(invigilatorsData || []);
    // Fetch sessions
    const { data: sessionsData } = await supabase.from('exam_session').select('id, exam_date, start_time, end_time').order('exam_date');
    setSessions(sessionsData || []);
    // Fetch rooms
    const { data: roomsData } = await supabase.from('exam_room').select('id, name');
    setRooms(roomsData || []);
  };

  const handleAssign = async () => {
    if (!selectedInvigilator || !selectedSession || !selectedRoom) {
      handleError('Please select invigilator, session, and room.', 'Missing Fields');
      return;
    }
    setAssigning(true);
    try {
      // Get the current user's ID (admin)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user logged in');

      await createInvigilationAssignment({
        profile_id: selectedInvigilator,
        exam_session_id: selectedSession,
        exam_room_id: selectedRoom,
        assigned_by: user.id, // Use the actual admin's UUID instead of 'admin'
      });
      setShowModal(false);
      setSelectedInvigilator('');
      setSelectedSession('');
      setSelectedRoom('');
      loadAssignments();
      handleSuccess('Assignment created successfully');
    } catch (err: any) {
      if (isAuthError(err)) {
        handleError('Authentication error. Please log in again.', 'Assignment Error');
      } else if (isDatabaseError(err)) {
        handleError('Database error. Please check your input and try again.', 'Assignment Error');
      } else {
        handleError(err, 'Assignment Creation');
      }
    } finally {
      setAssigning(false);
    }
  };

  // const handleDelete = async (id: string) => {
  //   Alert.alert('Remove Assignment', 'Are you sure you want to remove this invigilator assignment?', [
  //     { text: 'Cancel', style: 'cancel' },
  //     { text: 'Remove', style: 'destructive', onPress: async () => {
  //       try {
  //         await deleteInvigilationAssignment(id);
  //         loadAssignments();
  //       } catch (err: any) {
  //         Alert.alert('Error', err.message || 'Failed to remove assignment');
  //       }
  //     }}
  //   ]);
  // };

  return (
    <View className="flex-1">
      <View className="flex-row justify-between items-center p-4">
        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Invigilator Assignments</Text>
        <TouchableOpacity className="bg-blue-500 rounded-lg px-4 py-2" onPress={() => setShowModal(true)}>
          <Text className="text-white font-semibold">Add Assignment</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className={`w-11/12 p-6 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-white'}`}> 
            <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Assign Invigilator</Text>
            <Text className={`mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Invigilator</Text>
            <ScrollView horizontal className="mb-4">
              {invigilators.map((inv) => (
                <TouchableOpacity key={inv.id} onPress={() => setSelectedInvigilator(inv.id)} className={`mr-2 px-3 py-1 rounded-full ${selectedInvigilator === inv.id ? (isDark ? 'bg-blue-600' : 'bg-blue-500') : (isDark ? 'bg-gray-600' : 'bg-gray-200')}`}> 
                  <Text className={selectedInvigilator === inv.id ? 'text-white' : (isDark ? 'text-white' : 'text-gray-800')}>{inv.full_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text className={`mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Session</Text>
            <ScrollView horizontal className="mb-4">
              {sessions.map((sess) => (
                <TouchableOpacity key={sess.id} onPress={() => setSelectedSession(sess.id)} className={`mr-2 px-3 py-1 rounded-full ${selectedSession === sess.id ? (isDark ? 'bg-blue-600' : 'bg-blue-500') : (isDark ? 'bg-gray-600' : 'bg-gray-200')}`}> 
                  <Text className={selectedSession === sess.id ? 'text-white' : (isDark ? 'text-white' : 'text-gray-800')}>{sess.exam_date} {sess.start_time}-{sess.end_time}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text className={`mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Room</Text>
            <ScrollView horizontal className="mb-4">
              {rooms.map((room) => (
                <TouchableOpacity key={room.id} onPress={() => setSelectedRoom(room.id)} className={`mr-2 px-3 py-1 rounded-full ${selectedRoom === room.id ? (isDark ? 'bg-blue-600' : 'bg-blue-500') : (isDark ? 'bg-gray-600' : 'bg-gray-200')}`}> 
                  <Text className={selectedRoom === room.id ? 'text-white' : (isDark ? 'text-white' : 'text-gray-800')}>{room.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View className="flex-row justify-end gap-2 mt-4">
              <TouchableOpacity onPress={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-gray-400">
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAssign} className={`px-4 py-2 rounded-lg ${assigning ? 'bg-gray-400' : 'bg-blue-600'}`} disabled={assigning}>
                {assigning ? <ActivityIndicator color="#fff" /> : <Text className="text-white">Assign</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading assignments...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-600">{error}</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          {assignments.length === 0 ? (
            <Text className="text-gray-500 text-center">No assignments found.</Text>
          ) : (
            assignments.map((a) => (
              <View key={a.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
                <View className="flex-row justify-between mb-2">
                  <Text className="font-bold text-gray-800 dark:text-white">
                    {a.profile?.full_name || 'Unknown Invigilator'}
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-400">
                    {a.exam_room?.name || 'Unknown Room'}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600 dark:text-gray-400">Session:</Text>
                  <Text className="text-gray-800 dark:text-white">
                    {a.exam_session?.course?.name || 'Unknown Course'} | {a.exam_session?.exam_date} {a.exam_session?.start_time} - {a.exam_session?.end_time}
                  </Text>
                </View>
                <View className="flex-row space-x-2 mt-3">
                  <TouchableOpacity className="flex-1 bg-gray-500 rounded-lg py-2" onPress={() => handleDelete(a.id)}>
                    <Text className="text-white text-center font-medium">Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )} */}
    </View>
  );
}

const TABS = [
  { key: 'rooms', label: 'Rooms' },
  { key: 'allocations', label: 'Allocations' },
  { key: 'invigilators', label: 'Invigilators' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'upload', label: 'Upload' },
];

export default function RoomManagementDashboard() {
  const [tab, setTab] = useState('rooms');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Tab Bar */}
      <View className={`flex-row border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            className={`flex-1 py-4 items-center ${tab === t.key ? (isDark ? 'border-b-2 border-blue-400' : 'border-b-2 border-blue-500') : ''}`}
            onPress={() => setTab(t.key)}
          >
            <Text className={`font-semibold ${tab === t.key ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-gray-300' : 'text-gray-600')}`}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Tab Content */}
      <View className="flex-1">
        {tab === 'rooms' && <RoomsScreen />}
        {tab === 'allocations' && <AllocationsTab />}
        {tab === 'invigilators' && <InvigilatorsTab />}
        {tab === 'sessions' && <SessionsTab />}
        {tab === 'upload' && <UploadScreen />}
      </View>
    </View>
  );
} 
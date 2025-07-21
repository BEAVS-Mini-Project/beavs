import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import RoomsScreen from '../(modals)/rooms';
import SessionsTab from '../(modals)/sessions';
import UploadScreen from '../(modals)/upload';
import AllocationsTab from '../(modals)/allocations';
import { fetchAllCourseRoomAllocations, deleteCourseRoomAllocation, fetchAllInvigilationAssignments, deleteInvigilationAssignment, fetchAllExamSessions, deleteExamSession } from '@/utils/supabase';

function InvigilatorsTab() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // useEffect(() => {
  //   loadAssignments();
  // }, []);

  // const loadAssignments = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const data = await fetchAllInvigilationAssignments();
  //     setAssignments(data || []);
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to load assignments');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
        <TouchableOpacity className="bg-blue-500 rounded-lg px-4 py-2" onPress={() => {}}>
          <Text className="text-white font-semibold">Add Assignment</Text>
        </TouchableOpacity>
      </View>
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
                    {a.lecturer?.full_name || 'Unknown Invigilator'}
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
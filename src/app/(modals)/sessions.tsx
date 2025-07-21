import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, useColorScheme } from 'react-native';
import { fetchAllExamSessions, deleteExamSession, createExamSession, updateExamSession } from '@/utils/supabase';

function SessionModal({ visible, mode, sessionData, onClose, onSave, loading }: {
  visible: boolean;
  mode: 'add' | 'edit';
  sessionData?: any;
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    course_id: '',
    exam_date: '',
    start_time: '',
    end_time: '',
    semester: '',
    academic_year: '',
  });
  const [courses, setCourses] = useState<any[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  useEffect(() => {
    if (visible) {
      loadCourses();
      if (mode === 'edit' && sessionData) {
        setForm({
          course_id: sessionData.course_id,
          exam_date: sessionData.exam_date,
          start_time: sessionData.start_time,
          end_time: sessionData.end_time,
          semester: sessionData.semester,
          academic_year: sessionData.academic_year,
        });
      } else {
        setForm({ course_id: '', exam_date: '', start_time: '', end_time: '', semester: '', academic_year: '' });
      }
    }
  }, [visible, mode, sessionData]);

  const loadCourses = async () => {
    try {
      const { data, error } = await import('@/utils/supabase').then(m => m.fetchCourses());
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      setCourses([]);
    }
  };

  const handleSave = async () => {
    if (!form.course_id || !form.exam_date || !form.start_time || !form.end_time || !form.semester || !form.academic_year) {
      Alert.alert('Validation', 'All fields are required.');
      return;
    }
    try {
      if (mode === 'add') {
        await createExamSession(form);
      } else {
        await updateExamSession(sessionData.id, form);
      }
      onSave();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (!visible) return null;
  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
      <View className={`rounded-lg p-6 w-full max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}> 
        <Text className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>{mode === 'add' ? 'Add Exam Session' : 'Edit Exam Session'}</Text>
        <View className="gap-4">
          <View>
            <Text className={`mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Course</Text>
            <ScrollView className={`max-h-40 border rounded-lg ${isDark ? 'border-gray-600' : 'border-gray-300'}`}> 
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  className={`p-3 border-b ${isDark ? 'border-gray-600' : 'border-gray-200'} ${form.course_id === course.id ? (isDark ? 'bg-blue-900' : 'bg-blue-100') : (isDark ? 'bg-gray-700' : 'bg-white')}`}
                  onPress={() => setForm(f => ({ ...f, course_id: course.id }))}
                >
                  <Text className={`${form.course_id === course.id ? (isDark ? 'text-blue-300' : 'text-blue-700') : (isDark ? 'text-white' : 'text-gray-800')}`}>{course.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View>
            <Text className={`mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Exam Date</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={form.exam_date}
              onChangeText={val => setForm(f => ({ ...f, exam_date: val }))}
              className={`border rounded-lg px-4 py-3 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
            />
          </View>
          <View className="flex-row gap-2 ">
            <View className="flex-1">
              <Text className={`mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Start Time</Text>
              <TextInput
                placeholder="HH:MM:SS"
                value={form.start_time}
                onChangeText={val => setForm(f => ({ ...f, start_time: val }))}
                className={`border rounded-lg px-4 py-3 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
              />
            </View>
            <View className="flex-1">
              <Text className={`mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>End Time</Text>
              <TextInput
                placeholder="HH:MM:SS"
                value={form.end_time}
                onChangeText={val => setForm(f => ({ ...f, end_time: val }))}
                className={`border rounded-lg px-4 py-3 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
              />
            </View>
          </View>
          <View>
            <Text className={`mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Semester</Text>
            <TextInput
              placeholder="e.g. First"
              value={form.semester}
              onChangeText={val => setForm(f => ({ ...f, semester: val }))}
              className={`border rounded-lg px-4 py-3 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
            />
          </View>
          <View>
            <Text className={`mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Academic Year</Text>
            <TextInput
              placeholder="e.g. 2024/2025"
              value={form.academic_year}
              onChangeText={val => setForm(f => ({ ...f, academic_year: val }))}
              className={`border rounded-lg px-4 py-3 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
            />
          </View>
        </View>
        <View className="flex-row mt-6 gap-2">
          <TouchableOpacity 
            className={`flex-1 rounded-lg py-3 items-center ${isDark ? 'bg-gray-400' : 'bg-gray-400'}`}
            onPress={onClose} 
            disabled={loading}
          >
            <Text className="text-white text-center font-medium">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-1 bg-blue-500 rounded-lg py-3 items-center" 
            onPress={handleSave} 
            disabled={loading}
          >
            <Text className="text-white text-center font-medium">{loading ? 'Saving...' : (mode === 'add' ? 'Add' : 'Save')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function SessionsTab() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllExamSessions();
      setSessions(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Session', 'Are you sure you want to delete this exam session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteExamSession(id);
          loadSessions();
        } catch (err: any) {
          Alert.alert('Error', err.message || 'Failed to delete session');
        }
      }}
    ]);
  };

  const openAddModal = () => {
    setSelectedSession(null);
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (session: any) => {
    setSelectedSession(session);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleModalSave = async () => {
    setActionLoading(true);
    await loadSessions();
    setActionLoading(false);
    setShowModal(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedSession(null);
  };

  return (
    <View className="flex-1">
      <View className="flex-row justify-between items-center p-4">
        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Exam Sessions</Text>
        <TouchableOpacity className="bg-blue-500 rounded-lg px-4 py-2" onPress={openAddModal}>
          <Text className="text-white font-semibold">Add Session</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading sessions...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-600">{error}</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          {sessions.length === 0 ? (
            <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No sessions found.</Text>
          ) : (
            sessions.map((s) => (
              <View key={s.id} className={`rounded-lg p-4 mb-4 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}> 
                <View className="flex-row justify-between mb-2">
                  <Text className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{s.course?.name || 'Unknown Course'}</Text>
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{s.exam_date}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Time:</Text>
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{s.start_time} - {s.end_time}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Semester:</Text>
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{s.semester}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Academic Year:</Text>
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{s.academic_year}</Text>
                </View>
                <View className="flex-row  mt-4 gap-2">
                  <TouchableOpacity className="flex-1 bg-blue-500 rounded-lg py-2" onPress={() => openEditModal(s)}>
                    <Text className="text-white text-center font-medium">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-gray-500 rounded-lg py-2" onPress={() => handleDelete(s.id)}>
                    <Text className="text-white text-center font-medium">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
      <SessionModal
        visible={showModal}
        mode={modalMode}
        sessionData={selectedSession}
        onClose={handleModalClose}
        onSave={handleModalSave}
        loading={actionLoading}
      />
    </View>
  );
} 
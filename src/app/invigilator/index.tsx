
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Book, Users, Clock, ArrowRight, BarChart3 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSelectedCourseStore } from '@/contexts/SelectedCourseContext';
import { fetchInvigilatorCourses } from '@/utils/supabase';
import Toast from 'react-native-toast-message';

export default function InvigilatorIndex() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const setSelectedCourse = useSelectedCourseStore((state) => state.setSelectedCourse);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await fetchInvigilatorCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load courses'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (item: any) => {
    setSelectedCourse(item.course);
    router.push('/invigilator/attendance');
  };

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className={`text-lg ${isDark ? 'text-white' : 'text-black'}`}>Loading courses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <View className={`px-4 py-2 flex justify-between flex-row ${isDark ? 'bg-white' : 'bg-primary'}`}>
        <View>
          <Text className={`font-bold text-xl ${isDark ? 'text-black' : 'text-white'}`}>Select Course</Text>
          <Text className={`text-sm opacity-80 ${isDark ? 'text-black' : 'text-white'}`}>Choose a course to invigilate</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/invigilator/dashboard')}>
          <BarChart3 size={30} color={isDark ? '#111827' : '#6b7280'} />
        </TouchableOpacity>
      </View>

      {/* Course List */}
      <ScrollView className="p-4 space-y-4 ">
        {courses && courses.length > 0 ? courses.map((item) => (
          <TouchableOpacity
            key={item.course.id + '-' + item.hallName}
            onPress={() => handleCourseSelect(item)}
            className={`rounded-lg p-4 m-2 border ${isDark ? 'border-gray-500 bg-gray-900' : 'border-gray-300 bg-white'}`}
          >
            <Text className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-primary'}`}>{item.course.name}</Text>
            <Text className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>Course Code: {item.course.code}</Text>
            <Text className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>Hall: {item.hallName}</Text>
            <View className="space-y-1">
              <View className="flex-row items-center ">
                <Users size={16} color={isDark ? '#fff' : '#6b7280'} />
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>{' '}Expected: {item.course.expectedCount || 0} students</Text>
              </View>
            </View>
          </TouchableOpacity>
        )) : (
          <View className="flex justify-center align-center flex-col space-y-1.5 p-6">
            <View className="p-8 text-center pt-0">
              <Clock color={isDark ? '#fff' : '#111827'} size={48} />
              <Text className={`text-lg font-medium mb-2 ${isDark ? 'text-primary-foreground' : 'text-muted-foreground'}`}>No Exams Today</Text>
              <Text className={isDark ? 'text-gray-400' : 'text-muted-foreground'}>
                There are no hall sessions assigned to you for today.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

  
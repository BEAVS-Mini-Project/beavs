
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme,ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Book, Users, Clock, ArrowRight,BarChart3 } from 'lucide-react-native';
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
      <View className={`${isDark ? 'bg-white' : 'bg-primary'} px-4 py-2 flex justify-between flex-row`}>
        <View>
          <Text className={`${isDark ? 'text-black' : 'text-white'} font-bold text-xl`}>Select Course</Text>
          <Text className={`${isDark ? 'text-black' : 'text-white'} text-sm opacity-80`}>Choose a course to invigilate</Text>
        </View>
        <TouchableOpacity onPress={()=>router.push('/invigilator/dashboard')}>
          <BarChart3 size={30} className='mt-5 color-muted-foreground' color={'#6b7280'} />
        </TouchableOpacity>
      </View>

        {/* Course List */}
        <ScrollView className="p-4 space-y-4 ">
          {courses.map((item) => (
            <TouchableOpacity
              key={item.course.id + '-' + item.hallName}
              onPress={() => handleCourseSelect(item)}
              className="rounded-lg p-4 text-black dark:text-white m-2 border border-gray-300 dark:border-gray-500"
            >
              <Text className="text-lg font-bold text-primary mb-1">{item.course.name}</Text>
              <Text className="text-sm text-muted-foreground mb-2">
                Course Code: {item.course.code}
              </Text>
              <Text className="text-sm text-muted-foreground mb-2">
                Hall: {item.hallName}
              </Text>
              <View className="space-y-1">
                <View className="flex-row items-center ">
                  <Users size={16} className="mr-2 color-muted-foreground" />
                  <Text className='text-sm text-muted-foreground'>{' '}Expected: {item.course.expectedCount || 0} students</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
    </SafeAreaView>
  );
}

  
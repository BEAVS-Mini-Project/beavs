
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Users, Clock, BarChart3 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelectedCourse } from '@/contexts/SelectedCourseContext';

interface Course {
  id: string;
  title: string;
  code: string;
  studentRange: string;
  expectedCount: number;
  hall: string;
}

export default function InvigilatorIndex() {
  const router = useRouter();
  const { setSelectedCourse } = useSelectedCourse();
  const hallName = 'Hall A - Main Building';


  const courses: Course[] = [
    {
      id: 'CS101',
      title: 'AI Exam - CSS3',
      code: 'CS101',
      studentRange: '3300000 - 3399999',
      expectedCount: 150,
      hall: hallName,
    },
    {
      id: 'MATH201',
      title: 'Advanced Mathematics',
      code: 'MATH201',
      studentRange: '3400000 - 3449999',
      expectedCount: 120,
      hall: hallName,
    },
    {
      id: 'ENG102',
      title: 'Technical English',
      code: 'ENG102',
      studentRange: '3450000 - 3499999',
      expectedCount: 200,
      hall: hallName,
    },
  ];

  const onCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    Toast.show({
      type: 'success',
      text1: 'Course Selected',
      text2: `${course.title} selected.`,
    });
    router.replace('/invigilator/attendance');
  };

  return (
    <SafeAreaView className="flex-1 ">
      {/* Top Header */}
      <View className="flex flex-row justify-between bg-primary text-primary-foreground px-4 py-5">
        <View>
        <Text className="text-xl font-bold">{hallName}</Text>
        <Text className="text-primary-foreground/80 ">Select Course to Begin</Text>
        </View>
        <TouchableOpacity >
          <BarChart3 size={30} className='mt-5 color-muted-foreground'/>
        </TouchableOpacity>
      </View>

      {/* Course List */}
      <ScrollView className="p-4 space-y-4 ">
        {courses.map((course) => (
          <TouchableOpacity
            key={course.id}
            onPress={() => onCourseSelect(course)}
            className="rounded-lg p-4 text-black dark:text-white m-2 border border-gray-300 dark:border-gray-500"
          >
            <Text className="text-lg font-bold text-primary mb-1">{course.title}</Text>
            <Text className="text-sm text-muted-foreground mb-2">
              Course Code: {course.code}
            </Text>

            <View className="space-y-1">
              <View className="flex-row items-center ">
                <Users size={16} className="mr-2 color-muted-foreground" />
                <Text className='text-sm text-muted-foreground'>{' '}Students: {course.studentRange}</Text>
              </View>
              <View className="flex-row items-center py-2">
                <Clock size={16} className="mr-2 color-muted-foreground" />
                <Text className='text-sm text-muted-foreground'>{' '}Expected: {course.expectedCount} students</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

  

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Book, Users, Clock, ArrowRight, BarChart3, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSelectedCourseStore } from '@/contexts/SelectedCourseContext';
import { supabase, fetchCoursesForInvigilator, fetchCourseRoomAllocationForSession, fetchComprehensiveInvigilationAssignments } from '@/utils/supabase';
import Toast from 'react-native-toast-message';
import { handleError, isNetworkError, isDatabaseError } from '@/utils/errorHandler';

export default function InvigilatorIndex() {
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [todayCourses, setTodayCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const setSelectedCourse = useSelectedCourseStore((state) => state.setSelectedCourse);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user logged in');

      // Get all assignments and filter by current user
      const comprehensiveAssignments = await fetchComprehensiveInvigilationAssignments();
      const userAssignments = comprehensiveAssignments.filter(assignment => 
        assignment.profile_id === user.id
      );
      
      // Transform the data to match the expected format
      const transformedAssignments = userAssignments.map(assignment => {
        const session = assignment.exam_session;
        const course = session?.course;
        const room = assignment.exam_room;
        
        if (!course || !room) return null;
        
        return {
          id: assignment.id,
          course: {
            ...course,
            expectedCount: room.capacity,
            program_id: course.program_id
          },
          hallName: room.name,
          exam_session: {
            id: session.id,
            exam_date: session.exam_date,
            start_time: session.start_time,
            end_time: session.end_time
          },
          exam_room: {
            id: room.id,
            name: room.name,
            capacity: room.capacity
          }
        };
      }).filter(Boolean);
      
      // Filter today's courses from all assignments
      const today = new Date().toISOString().split('T')[0];
      const todayCoursesData = transformedAssignments.filter(assignment => 
        assignment && assignment.exam_session && assignment.exam_session.exam_date === today
      );
      
      setAllAssignments(transformedAssignments);
      setTodayCourses(todayCoursesData);
    } catch (error) {
      const errorMessage = isNetworkError(error) 
        ? 'Network connection issue. Please check your internet connection.'
        : isDatabaseError(error)
        ? 'Database error occurred. Please try again.'
        : 'Failed to load assignments';
      
      handleError(error, 'Assignment Data Load');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = async (item: any) => {
    try {
      // Fetch allocation data for this session and room
      const allocation = await fetchCourseRoomAllocationForSession(
        item.exam_session.id, // Use session ID
        item.exam_room.id // Use room ID
      );
      
      // Pass the complete item structure to include all necessary data
      setSelectedCourse({
        ...item.course,
        hall: item.hallName,
        allocation: allocation ? {
          id: allocation.id,
          indexStart: allocation.index_start,
          indexEnd: allocation.index_end,
          studentCount: allocation.student_count
        } : undefined,
        program_id: item.course.program_id
      });
      router.push('/invigilator/attendance');
    } catch (error) {
      handleError(error, 'Course Selection');
    }
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Remove seconds
  };

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className={`text-lg ${isDark ? 'text-white' : 'text-black'}`}>Loading assignments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <View className={`px-4 py-2 flex justify-between flex-row ${isDark ? 'bg-white' : 'bg-primary'}`}>
        <View>
          <Text className={`font-bold text-xl ${isDark ? 'text-black' : 'text-white'}`}>My Assignments</Text>
          <Text className={`text-sm opacity-80 ${isDark ? 'text-black' : 'text-white'}`}>All current and future invigilation assignments</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/invigilator/dashboard')}>
          <BarChart3 size={30} color={isDark ? '#111827' : '#6b7280'} />
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4 space-y-4">
        {/* Today's Assignments */}
        {todayCourses && todayCourses.length > 0 && (
          <View>
            <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Today's Sessions (Selectable)
            </Text>
            {todayCourses.map((item) => (
              <TouchableOpacity
                key={item.course.id + '-' + item.hallName}
                onPress={() => handleCourseSelect(item)}
                className={`rounded-lg p-4 m-2 border-2 ${isDark ? 'border-blue-500 bg-gray-900' : 'border-blue-500 bg-white'}`}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-primary'}`}>{item.course.name}</Text>
                  <View className={`px-2 py-1 rounded-full ${isDark ? 'bg-blue-600' : 'bg-blue-100'}`}>
                    <Text className={`text-xs font-medium ${isDark ? 'text-white' : 'text-blue-700'}`}>TODAY</Text>
                  </View>
                </View>
                <Text className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>Course Code: {item.course.code}</Text>
                <Text className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>Hall: {item.hallName}</Text>
                <View className="flex-row items-center">
                  <Users size={16} color={isDark ? '#fff' : '#6b7280'} />
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>{' '}Expected: {item.course.expectedCount || 0} students</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Future Assignments */}
        {allAssignments && allAssignments.length > 0 && (
          <View>
            <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Future Assignments (View Only)
            </Text>
            {allAssignments
              .filter(assignment => !isToday(assignment.exam_session.exam_date))
              .map((assignment) => (
                <View
                  key={assignment.id}
                  className={`rounded-lg p-4 m-2 border ${isDark ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-gray-50'}`}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {assignment.course.name}
                    </Text>
                    <View className={`px-2 py-1 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <Text className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatDate(assignment.exam_session.exam_date)}
                      </Text>
                    </View>
                  </View>
                  <Text className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Course Code: {assignment.course.code}
                  </Text>
                  <Text className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Hall: {assignment.hallName}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Users size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                      <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {' '}Capacity: {assignment.exam_room.capacity} students
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Clock size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                      <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {' '}{formatTime(assignment.exam_session.start_time)} - {formatTime(assignment.exam_session.end_time)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* No Assignments */}
        {allAssignments.length === 0 && (
          <View className="flex justify-center align-center flex-col space-y-1.5 p-6">
            <View className="p-8 text-center pt-0">
              <Calendar color={isDark ? '#fff' : '#111827'} size={48} />
              <Text className={`text-lg font-medium mb-2 ${isDark ? 'text-primary-foreground' : 'text-muted-foreground'}`}>No Assignments</Text>
              <Text className={isDark ? 'text-gray-400' : 'text-muted-foreground'}>
                You have no current or future invigilation assignments.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

  
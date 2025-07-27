import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Redirect, useRouter } from 'expo-router';
import { GraduationCap, Book, School } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../utils/supabase';
import { handleError, handleInfo, isAuthError } from '@/utils/errorHandler';

const Index = () => {
  const Router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (!session) {
          handleInfo('Redirecting to login', 'Welcome');
          Router.replace('/login');
          return;
        }

        // Get user id
        const userId = session.user.id;
        
        // Fetch role from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (profileError) throw profileError;
        
        const userRole = profile?.role;
        if (!userRole) {
          handleError('No role assigned to user', 'Access Denied');
          Router.replace('/login');
          return;
        }

        if (userRole === 'admin') {
          handleInfo('Redirecting to Admin Dashboard', 'Welcome');
          Router.replace('/admin');
        } else if (userRole === 'invigilator') {
          handleInfo('Redirecting to Invigilator Dashboard', 'Welcome');
          Router.replace('/invigilator');
        } else {
          handleError('Invalid user role', 'Access Denied');
          Router.replace('/login');
        }
      } catch (error) {
        if (isAuthError(error)) {
          handleError(error, 'Authentication Error');
          Router.replace('/login');
        } else {
          handleError(error, 'Session Check');
        }
      }
    };

    checkSessionAndRedirect();
  }, []);

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-gradient-to-br from-blue-600 to-blue-500 dark:from-gray-900 dark:to-gray-800 relative">
      {/* Floating icons */}
      <View className="absolute top-10 left-5 opacity-30">
        <Book size={32} color="white" />
      </View>
      <View className="absolute top-10 right-5 opacity-40">
        <School size={28} color="white" />
      </View>
      {/* Main icon */}
      <BlurView intensity={30} tint="light" className="rounded-full p-6 mb-6 items-center justify-center">
        <GraduationCap size={64} color="white" />
      </BlurView>
      <Text className="text-white dark:text-blue-400 text-4xl font-bold mb-2">BEAVS</Text>
      <Text className="text-white dark:text-blue-200 text-lg opacity-90">Biometric Exam Attendance</Text>
      <Text className="text-white dark:text-blue-200 text-base opacity-80">Verification System</Text>
      {/* Pulsing dots */}
      <View className="flex flex-row space-x-2 mt-8 mb-4">
        <View className="w-2 h-2 bg-white/60 rounded-full" />
        <View className="w-2 h-2 bg-white/60 rounded-full" />
        <View className="w-2 h-2 bg-white/60 rounded-full" />
      </View>
      <Text className="text-white dark:text-blue-200 text-xs opacity-70 absolute bottom-10">
        Academic Excellence Through Technology
      </Text>
    </SafeAreaView>
  );
};

export default Index;





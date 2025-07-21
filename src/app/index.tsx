import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Redirect, useRouter } from 'expo-router';
import { GraduationCap, Book, School } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../utils/supabase';

const Index = () => {
  const Router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redir= setTimeout(() => {
    const checkSessionAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Toast.show({
          type: 'info',
          text1: 'Welcome',
          text2: 'Redirecting to login',
        });
        Router.replace('/login');
        return;
      }
      // Get user id
      const userId = session.user.id;
      console.log('User ID from session:', userId);
      // Fetch role from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        console.log('Profile from query:', profile, 'Error:', error);
      const userRole = profile?.role;
      if (userRole === 'admin') {
        Toast.show({
          type: 'success',
          text1: 'Welcome',
          text2: 'Redirecting to Admin Dashboard',
        });
        Router.replace('/admin');
      } else if (userRole === 'invigilator') {
        Toast.show({
          type: 'success',
          text1: 'Welcome',
          text2: 'Redirecting to Invigilator Dashboard',
        });
        Router.replace('/invigilator');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Role not found',
          text2: 'Contact admin for access',
        });
        Router.replace('/login');
      }
    };
    checkSessionAndRedirect();
    }, 2000);
    return ()=>clearTimeout(redir);
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





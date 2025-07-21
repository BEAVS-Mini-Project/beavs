import { Link, Stack } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { GraduationCap } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center px-6 bg-white dark:bg-gray-900">
        {/* Main Icon */}
        <View className="mb-6 p-6 rounded-full bg-gray-100 dark:bg-white/10">
          <GraduationCap size={72} color="#2563eb" />
        </View>
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</Text>
        <Text className="text-lg text-gray-600 dark:text-gray-300 mb-6 text-center">
          Oops! The page you are looking for doesn't exist or has been moved.
        </Text>
        <Link href="/" asChild>
          <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4">
            <Text className="text-white font-semibold text-base">Go to Home</Text>
          </TouchableOpacity>
        </Link>
        <Text className="text-xs text-gray-400 dark:text-gray-500 mt-8">
          BEAVS - Biometric Exam Attendance Verification System
        </Text>
      </View>
    </>
  );
}
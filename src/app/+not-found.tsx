import { Link, Stack } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { GraduationCap } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center bg-gradient-to-br from-blue-600 to-blue-500 px-6">
        {/* Main Icon */}
        <View className="mb-6 p-6 rounded-full bg-white/10">
          <GraduationCap size={72} color="white" />
        </View>
        <Text className="text-3xl font-bold text-white mb-2">Page Not Found</Text>
        <Text className="text-lg text-white/80 dark:text-white mb-6 text-center">
          Oops! The page you are looking for doesn't exist or has been moved.
        </Text>
        <Link href="/" asChild>
            <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4">
              <Text className="text-white font-semibold text-base">Go to Home</Text>
            </TouchableOpacity>
          </Link>
        <Text className="text-xs text-white/60 dark:text-white mt-8">
          BEAVS - Biometric Exam Attendance Verification System
        </Text>
      </View>
    </>
  );
}
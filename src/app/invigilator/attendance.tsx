import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelectedCourse } from '../../contexts/SelectedCourseContext';
import { Fingerprint } from 'lucide-react-native';

export default function AttendanceScreen() {
  const { selectedCourse } = useSelectedCourse();
  const router = useRouter();
  const [scanStatus, setScanStatus] = useState('Place your finger on the scanner');
  const [scanning, setScanning] = useState(false);

  const handleFingerprintScan = () => {
    setScanning(true);
    setScanStatus('Scanning...');
    setTimeout(() => {
      setScanning(false);
      setScanStatus('Fingerprint recognized!');
    }, 2000);
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-2xl m-5 dark:text-muted-foreground">
        Attendance for {selectedCourse ? selectedCourse.title : 'No course selected'}
      </Text>
      {/* Fingerprint Section */}
      <View className="items-center mb-8">
        <View className="bg-gray-100 rounded-full p-8 mb-3 border-2 border-gray-300">
          <Fingerprint size={64} color={scanning ? '#2563eb' : '#6b7280'} />
        </View>
        <TouchableOpacity
          onPress={handleFingerprintScan}
          disabled={scanning}
          className={`rounded-lg mb-2 py-3 px-8 ${scanning ? 'bg-indigo-200' : 'bg-blue-600'}`}
        >
          <Text className="text-white font-bold text-lg">{scanning ? 'Scanning...' : 'Scan Fingerprint'}</Text>
        </TouchableOpacity>
        <Text className={`mt-1 ${scanning ? 'text-blue-600' : 'text-gray-500'}`}>{scanStatus}</Text>
      </View>
      <TouchableOpacity onPress={() => router.push(`/override/${selectedCourse}`)} className="mt-2 bg-orange-600 rounded-lg px-6 py-3">
        <Text className="text-white font-semibold">Manual Override</Text>
      </TouchableOpacity>
    </View>
  );
} 
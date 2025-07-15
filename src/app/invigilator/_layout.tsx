import React from 'react';
import { Stack } from 'expo-router';
import { BarChart3, CheckCircle, FileText, Book } from 'lucide-react-native';

export default function InvigilatorLayout() {
  return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Courses' }} />
        <Stack.Screen name="dashboard" options={{headerBackVisible:true, title: 'Dashboard' }} />
        <Stack.Screen name="override" options={{headerBackVisible:true, title: 'Manual Override' }} />
        <Stack.Screen name="attendance" options={{headerBackVisible:true, title: 'Attendance' }} />
      </Stack>
  );
} 


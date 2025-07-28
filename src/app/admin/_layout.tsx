import React from 'react';
import { Tabs } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
        },
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#FFFFFF',
        headerRight: () => (
          <TouchableOpacity
            onPress={async () => {
              try {
                await supabase.auth.signOut();
                await AsyncStorage.clear();
                router.replace('/login');
                // Additional safety: reset navigation stack
                setTimeout(() => {
                  router.replace('/login');
                }, 100);
              } catch (error) {
                console.error('Logout error:', error);
                router.replace('/login');
              }
            }}
            className="mr-4"
          >
            <FontAwesome name="sign-out" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Admin Dashboard',
          tabBarLabel:'Dashboard',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="dashboard" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="room-management"
        options={{
          title: 'Room Management',
          tabBarLabel:'Rooms',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="building" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Attendance Reports',
          tabBarLabel:'Reports',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="bar-chart" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel:'Settings',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="cog" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-student"
        options={{
          title: 'Add Student',
          href: null, // Hide from tab bar
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/admin')}
              className="ml-4"
            >
              <FontAwesome name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="add-invigilator"
        options={{
          title: 'Add Invigilator',
          href: null, // Hide from tab bar
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/admin')}
              className="ml-4"
            >
              <FontAwesome name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
} 
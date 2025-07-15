import React from 'react';
import { Tabs } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';

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
            onPress={() => {
              supabase.auth.signOut();
              router.replace('/login') }
            }
             
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
      {/* <Tabs.Screen
        name="upload"
        options={{
          title: 'Upload',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="upload" size={20} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="rooms"
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
    </Tabs>
  );
} 
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import {  User,Fingerprint,Settings, LogOut, RefreshCw, FileText, LucideFingerprint, LucideSettings } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { Card, Menu ,Divider} from 'react-native-paper';
import { supabase } from '@/utils/supabase';
// import { styled } from 'nativewind';
// import { useTheme } from '@/contexts/ThemeContext';


export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'invigilator'>('invigilator');
  // const { colorMode, toggleTheme } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Toast.show({
        type:'error',
        text1:'Missing input',
        text2: 'Please enter both username and password'
      })
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });
      
      if (error) {
        Toast.show({
          type:'error',
          text1:'Invalid credentials',
          text2: 'Please check and input the right credentials. Contact support for help'
        })
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        
        const role = profile?.role;
        
        if (!profile || !role) {
          Toast.show({
            type: 'error',
            text1: 'Profile not found',
            text2: 'Your account is missing a profile or role. Contact admin.'
          });
          setIsLoading(false);
          return;
        }
        
        if (userType === role) {
          Toast.show({
            type: 'success',
            text1: 'Login Successful',
            text2: 'Welcome to BEAVS system'
          });
          router.replace(`/${role}`);
        } else {
          Toast.show({
            type: 'error',
            text1: `Invalid credentials for ${role}`,
            text2: 'Please check and input the right credentials. Contact support for help'
          });
        }
      }
    } catch (error) {
      Toast.show({
        type:'error',
        text1:'An unexpected error occurred',
        text2: 'Please try again later'
      })
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <View className="flex-1 bg-gradient-to-br from-background to-muted items-center justify-center p-4 relative">
      {/* Dropdown Settings Menu */}
      <View className="absolute top-10 right-4">
        {/* <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <View className="p-2 rounded-full bg-accent dark:bg-white">
                <Settings size={24} className='text-black dark:text-white'/>
              </View>
            </TouchableOpacity>
          }
        >
          <Menu.Item
            title={
              <View className="flex-row items-center dark:bg-white">
                <User size={16} color="black" />
                <Text className="ml-2">Guest User</Text>
              </View>
            }
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              toggleTheme();
              setMenuVisible(false);
            }}
            title="Theme"
            right={() => <Text>Toggle</Text>}
          />
        </Menu>  */}
      </View>

      {/* Login Card */}
      <View className="w-full max-w-md rounded-lg shadow p-6 dark:bg-blue-900/20">
        <View className="items-center">
          <View className="mb-4 p-3 bg-primary/10 dark:bg-white rounded-full w-fit">
            <Fingerprint size={32} color="black" />
          </View>
          <Text className="text-2xl font-bold text-black dark:text-white">BEAVS Login</Text>
          <Text className="text-muted-foreground text-center p-2">
            Biometric Exam Attendance Verification System
          </Text>
        </View>

                 {/* User Type Selector */}
          <View className="flex-row mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
             <TouchableOpacity
              className={`flex-1 py-2 px-4 rounded-md ${
                userType === 'admin' 
                  ? 'bg-blue-500' 
                  : 'bg-transparent'
              }`}
              onPress={() => setUserType('admin')}
            >
              <Text className={`text-center font-medium ${
                userType === 'admin' 
                  ? 'text-white' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                Admin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2 px-4 rounded-md ${
                userType === 'invigilator' 
                  ? 'bg-blue-500' 
                  : 'bg-transparent'
              }`}
              onPress={() => setUserType('invigilator')}
            >
              <Text className={`text-center font-medium ${
                userType === 'invigilator' 
                  ? 'text-white' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                Invigilator
              </Text>
            </TouchableOpacity>
          </View>

        <View className="space-y-4 mt-4">
          <View>
            <Text className="text-sm font-medium mb-2 text-black dark:text-white">{userType=='admin'? 'Admin ID' :'Invigilator ID'}</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your ID"
              className="border border-gray-300 rounded p-3 mb-4 text-black dark:text-white"
              placeholderTextColor="#777"
            />
          </View>

          <View>
            <Text className="text-sm font-medium mb-2 text-black dark:text-white">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              className="border border-gray-300 rounded p-3 mb-4 text-black dark:text-white"
              placeholderTextColor="#777"
              
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="bg-blue-500 rounded p-2 items-center"
          >
            <Text className="text-white">
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

           {/* Footer Information */}
           <View className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
             <Text className="w-full text-center text-sm text-blue-600 dark:text-muted-foreground">
               This platform is private so seek help from Admin
             </Text>
           </View>
        </View>
      </View>
    </View>
  );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  settingsContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 4,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    marginTop: 8,
  },
  input: {
    width: '100%',
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  demoText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 12,
    color: '#888',
  },
});
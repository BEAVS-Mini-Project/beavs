import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import Toast from 'react-native-toast-message';
import { Upload, UserPlus, FileText, ArrowLeft } from 'lucide-react-native';
import { handleError, handleSuccess, isNetworkError, isDatabaseError } from '@/utils/errorHandler';

interface StudentFormData {
  student_number: string;
  index_number: string;
  full_name: string;
  class_id: string;
  program_id: string;
  fingerprint_hash?: string;
}

interface Class {
  id: string;
  name: string;
  program_id: string;
}

interface Program {
  id: string;
  name: string;
  code: string;
}

export default function AddStudentScreen() {
  const [mode, setMode] = useState<'manual' | 'bulk'>('manual');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [formData, setFormData] = useState<StudentFormData>({
    student_number: '',
    index_number: '',
    full_name: '',
    class_id: '',
    program_id: '',
    fingerprint_hash: '',
  });
  const [bulkData, setBulkData] = useState<string>('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      const [classesRes, programsRes] = await Promise.all([
        supabase.from('class').select('id, name, program_id'),
        supabase.from('program').select('id, name, code'),
      ]);
      
      if (classesRes.error) throw classesRes.error;
      if (programsRes.error) throw programsRes.error;
      
      setClasses(classesRes.data || []);
      setPrograms(programsRes.data || []);
    } catch (error) {
      const errorMessage = isNetworkError(error) 
        ? 'Network connection issue. Please check your internet connection.'
        : isDatabaseError(error)
        ? 'Database error occurred. Please try again.'
        : 'Failed to load dropdown data';
      
      handleError(error, 'Dropdown Data Load');
    }
  };

  const handleManualSubmit = async () => {
    if (!formData.student_number || !formData.index_number || !formData.full_name || !formData.class_id || !formData.program_id) {
      handleError('Please fill all required fields', 'Missing Fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('student').insert([{
        student_number: formData.student_number,
        index_number: formData.index_number,
        full_name: formData.full_name,
        class_id: formData.class_id,
        program_id: formData.program_id,
        fingerprint_hash: formData.fingerprint_hash || null,
      }]);

      if (error) throw error;

      handleSuccess('Student added successfully');

      // Reset form
      setFormData({
        student_number: '',
        index_number: '',
        full_name: '',
        class_id: '',
        program_id: '',
        fingerprint_hash: '',
      });
    } catch (error: any) {
      if (isDatabaseError(error)) {
        handleError('Database error. Please check your input and try again.', 'Student Creation Error');
      } else {
        handleError(error, 'Student Creation');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkData.trim()) {
      handleError('Please enter CSV data', 'No Data');
      return;
    }

    setLoading(true);
    try {
      const lines = bulkData.trim().split('\n');
      const students = [];

      for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i].trim();
        if (!line) continue;

        const [student_number, index_number, full_name, class_name, program_code, fingerprint_hash] = line.split(',').map(s => s.trim());
        
        const program = programs.find(p => p.code === program_code);
        const classItem = classes.find(c => c.name === class_name && c.program_id === program?.id);

        if (!program || !classItem) {
          throw new Error(`Invalid program or class on line ${i + 1}`);
        }

        students.push({
          student_number,
          index_number,
          full_name,
          class_id: classItem.id,
          program_id: program.id,
          fingerprint_hash: fingerprint_hash || null,
        });
      }

      const { error } = await supabase.from('student').insert(students);
      if (error) throw error;

      handleSuccess(`${students.length} students added successfully`);

      setBulkData('');
    } catch (error: any) {
      if (isDatabaseError(error)) {
        handleError('Database error. Please check your CSV format and try again.', 'Bulk Upload Error');
      } else {
        handleError(error, 'Bulk Upload');
      }
    } finally {
      setLoading(false);
    }
  };

  const getClassesForProgram = (programId: string) => {
    const filteredClasses = classes.filter(c => c.program_id === programId);
    // console.log('Filtering classes for program:', programId);
    // console.log('Available classes:', classes);
    // console.log('Filtered classes:', filteredClasses);
    return filteredClasses;
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      

      {/* Mode Toggle */}
      <View className={`flex-row p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <TouchableOpacity
          className={`flex-1 py-2 px-4 rounded-lg mr-2 ${mode === 'manual' ? (isDark ? 'bg-blue-600' : 'bg-blue-500') : (isDark ? 'bg-gray-700' : 'bg-gray-200')}`}
          onPress={() => setMode('manual')}
        >
          <View className="flex-row items-center justify-center">
            <UserPlus size={16} color={mode === 'manual' ? '#fff' : (isDark ? '#fff' : '#000')} />
            <Text className={`ml-2 font-medium ${mode === 'manual' ? 'text-white' : (isDark ? 'text-white' : 'text-gray-800')}`}>Manual Entry</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2 px-4 rounded-lg ${mode === 'bulk' ? (isDark ? 'bg-blue-600' : 'bg-blue-500') : (isDark ? 'bg-gray-700' : 'bg-gray-200')}`}
          onPress={() => setMode('bulk')}
        >
          <View className="flex-row items-center justify-center">
            <Upload size={16} color={mode === 'bulk' ? '#fff' : (isDark ? '#fff' : '#000')} />
            <Text className={`ml-2 font-medium ${mode === 'bulk' ? 'text-white' : (isDark ? 'text-white' : 'text-gray-800')}`}>Bulk Upload</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {mode === 'manual' ? (
          <View>
            <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Add Single Student</Text>
            
            <View className="gap-4">
              <View>
                <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Student Number *</Text>
                <TextInput
                  placeholder="e.g., 2022020001"
                  value={formData.student_number}
                  onChangeText={(text) => setFormData({ ...formData, student_number: text })}
                  className={`border rounded-lg px-4 py-3 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
                />
              </View>

              <View>
                <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Index Number *</Text>
                <TextInput
                  placeholder="e.g., CS/22/001"
                  value={formData.index_number}
                  onChangeText={(text) => setFormData({ ...formData, index_number: text })}
                  className={`border rounded-lg px-4 py-3 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
                />
              </View>

              <View>
                <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Full Name *</Text>
                <TextInput
                  placeholder="e.g., John Doe"
                  value={formData.full_name}
                  onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                  className={`border rounded-lg px-4 py-3 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
                />
              </View>

              <View>
                <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Program *</Text>
                <View className={`border rounded-lg px-4 py-3 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row">
                      {programs.map((program) => (
                        <TouchableOpacity
                          key={program.id}
                          onPress={() => {
                            setFormData({ ...formData, program_id: program.id, class_id: '' });
                          }}
                          className={`mr-2 px-3 py-1 rounded-full ${
                            formData.program_id === program.id
                              ? (isDark ? 'bg-blue-600' : 'bg-blue-500')
                              : (isDark ? 'bg-gray-600' : 'bg-gray-200')
                          }`}
                        >
                          <Text className={`text-sm ${formData.program_id === program.id ? 'text-white' : (isDark ? 'text-white' : 'text-gray-800')}`}>
                            {program.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>

              <View>
                <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Class *</Text>
                <View className={`border rounded-lg px-4 py-3 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                  {formData.program_id ? (
                    getClassesForProgram(formData.program_id).length > 0 ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row">
                          {getClassesForProgram(formData.program_id).map((classItem) => (
                            <TouchableOpacity
                              key={classItem.id}
                              onPress={() => setFormData({ ...formData, class_id: classItem.id })}
                              className={`mr-2 px-3 py-1 rounded-full ${
                                formData.class_id === classItem.id
                                  ? (isDark ? 'bg-blue-600' : 'bg-blue-500')
                                  : (isDark ? 'bg-gray-600' : 'bg-gray-200')
                              }`}
                            >
                              <Text className={`text-sm ${formData.class_id === classItem.id ? 'text-white' : (isDark ? 'text-white' : 'text-gray-800')}`}>
                                {classItem.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    ) : (
                      <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        No classes available for selected program
                      </Text>
                    )
                  ) : (
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Please select a program first
                    </Text>
                  )}
                </View>
                {classes.length > 0 && (
                  <Text className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total classes loaded: {getClassesForProgram(formData.program_id).length}
                  </Text>
                )}
              </View>

              <View>
                <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Fingerprint Hash (Optional)</Text>
                <TextInput
                  placeholder="Enter fingerprint hash if available"
                  value={formData.fingerprint_hash}
                  onChangeText={(text) => setFormData({ ...formData, fingerprint_hash: text })}
                  className={`border rounded-lg px-4 py-3 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
                />
              </View>

              <TouchableOpacity
                onPress={handleManualSubmit}
                disabled={loading}
                className={`py-3 px-4 rounded-lg ${loading ? 'bg-gray-400' : (isDark ? 'bg-blue-600' : 'bg-blue-500')}`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-semibold">Add Student</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Bulk Upload Students</Text>
            
            <View className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
              <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-blue-800'}`}>
                <Text className="font-semibold">CSV Format:</Text>{'\n'}
                student_number,index_number,full_name,class_name,program_code,fingerprint_hash{'\n\n'}
                <Text className="font-semibold">Example:</Text>{'\n'}
                2022020001,CS/22/001,John Doe,Level 200 A,CS,hash123{'\n'}
                2022020002,CS/22/002,Jane Smith,Level 200 A,CS,hash456
              </Text>
            </View>

            <View>
              <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>CSV Data</Text>
              <TextInput
                placeholder="Paste CSV data here..."
                value={bulkData}
                onChangeText={setBulkData}
                multiline
                numberOfLines={10}
                className={`border rounded-lg px-4 py-3 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              onPress={handleBulkUpload}
              disabled={loading}
              className={`py-3 px-4 rounded-lg mt-4 ${loading ? 'bg-gray-400' : (isDark ? 'bg-blue-600' : 'bg-blue-500')}`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-semibold">Upload Students</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 
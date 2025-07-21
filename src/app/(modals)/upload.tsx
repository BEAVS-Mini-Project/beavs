import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, useColorScheme } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import { createExamSession, updateExamSession, fetchAllExamSessions } from '@/utils/supabase';

const REQUIRED_FIELDS = [
  'course_id',
  'exam_date',
  'start_time',
  'end_time',
  'semester',
  'academic_year',
];

function validateSession(session: any) {
  for (const field of REQUIRED_FIELDS) {
    if (!session[field] || typeof session[field] !== 'string') {
      return `Missing or invalid field: ${field}`;
    }
  }
  // Basic format checks
  if (!/^\d{4}-\d{2}-\d{2}$/.test(session.exam_date)) return 'Invalid exam_date format (YYYY-MM-DD)';
  if (!/^\d{2}:\d{2}:\d{2}$/.test(session.start_time)) return 'Invalid start_time format (HH:MM:SS)';
  if (!/^\d{2}:\d{2}:\d{2}$/.test(session.end_time)) return 'Invalid end_time format (HH:MM:SS)';
  return null;
}

export default function UploadScreen() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (result.type === 'success') {
        setUploadedFiles([result.name, ...uploadedFiles]);
        handleFileUpload(result);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'File Picker Error',
        text2: error.message || 'Failed to pick file',
      });
    }
  };

  const handleFileUpload = async (file: any) => {
    setIsUploading(true);
    setUploadResult(null);
    setUploadErrors([]);
    try {
      const fileUri = file.uri;
      const response = await fetch(fileUri);
      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid JSON format');
      }
      if (!Array.isArray(json)) {
        throw new Error('JSON must be an array of exam sessions');
      }
      // Fetch existing sessions to check for updates
      const existingSessions = await fetchAllExamSessions();
      let created = 0, updated = 0, failed = 0;
      const errors: string[] = [];
      for (let i = 0; i < json.length; i++) {
        const session = json[i];
        const validationError = validateSession(session);
        if (validationError) {
          failed++;
          errors.push(`Row ${i + 1}: ${validationError}`);
          continue;
        }
        try {
          // Check if session exists (by course_id, exam_date, start_time)
          const match = existingSessions.find((s: any) =>
            s.course_id === session.course_id &&
            s.exam_date === session.exam_date &&
            s.start_time === session.start_time
          );
          if (match) {
            await updateExamSession(match.id, session);
            updated++;
          } else {
            await createExamSession(session);
            created++;
          }
        } catch (e: any) {
          failed++;
          errors.push(`Row ${i + 1}: ${e.message || 'Unknown error'}`);
        }
      }
      setUploadResult(`Upload complete: ${created} created, ${updated} updated, ${failed} failed.`);
      setUploadErrors(errors);
      Toast.show({
        type: failed === 0 ? 'success' : 'error',
        text1: failed === 0 ? 'Upload Complete' : 'Upload Completed with Errors',
        text2: `${created} created, ${updated} updated, ${failed} failed.`
      });
    } catch (error: any) {
      setUploadResult('Upload failed: ' + (error.message || 'Unknown error'));
      setUploadErrors([error.message || 'Unknown error']);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: error.message || 'Unknown error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}> 
      <View className="p-6">
        {/* Header */}
        <View className="mb-6">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Upload Exam Session Data</Text>
          <Text className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Upload a JSON file containing exam session information to update the database.</Text>
        </View>

        {/* JSON Format Guide */}
        <View className={`rounded-lg p-4 mb-6 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}> 
          <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>JSON Format Requirements</Text>
          <Text className={`text-sm mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Each object in your JSON array should include:</Text>
          <View className="space-y-1">
            <Text className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>• course_id (required, UUID)</Text>
            <Text className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>• exam_date (required, YYYY-MM-DD)</Text>
            <Text className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>• start_time (required, HH:MM:SS)</Text>
            <Text className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>• end_time (required, HH:MM:SS)</Text>
            <Text className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>• semester (required, string)</Text>
            <Text className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>• academic_year (required, string)</Text>
          </View>
          <Text className={`text-xs mt-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Example:</Text>
          <Text className={`text-xs rounded p-2 mt-1 ${isDark ? 'text-blue-400 bg-blue-950' : 'text-blue-600 bg-blue-100'}`}>{`[
  {
    "course_id": "880e8400-e29b-41d4-a716-446655440001",
    "exam_date": "2024-07-20",
    "start_time": "09:00:00",
    "end_time": "12:00:00",
    "semester": "First",
    "academic_year": "2024/2025"
  }
]`}</Text>
        </View>

        {/* Upload Area */}
        <View className={`rounded-lg p-6 mb-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}> 
          <View className={`border-2 border-dashed rounded-lg p-8 items-center ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
            <FontAwesome name="cloud-upload" size={48} color={isDark ? '#fff' : '#9CA3AF'} />
            <Text className={`text-lg font-semibold mt-4 mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Drop your JSON file here</Text>
            <Text className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>or click to browse files</Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity
                className={`rounded-lg px-6 py-3 ${isUploading ? 'opacity-50' : 'bg-blue-500'}`}
                onPress={handleFileSelect}
                disabled={isUploading}
              >
                <Text className="text-white font-semibold">{isUploading ? 'Uploading...' : 'Browse Files'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Upload Result */}
        {uploadResult && (
          <View className={`rounded-lg p-4 mb-2 ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <Text className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>{uploadResult}</Text>
          </View>
        )}
        {uploadErrors.length > 0 && (
          <View className={`rounded-lg p-4 mb-6 ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
            <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-red-300' : 'text-red-700'}`}>Errors:</Text>
            {uploadErrors.map((err, idx) => (
              <Text key={idx} className={`text-xs ${isDark ? 'text-red-300' : 'text-red-700'}`}>{err}</Text>
            ))}
          </View>
        )}

        {/* Uploaded Files */}
        <View>
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Recently Uploaded Files</Text>
          {uploadedFiles.length === 0 ? (
            <View className={`rounded-lg p-6 items-center shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <FontAwesome name="file-text-o" size={32} color={isDark ? '#fff' : '#9CA3AF'} />
              <Text className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No files uploaded yet</Text>
            </View>
          ) : (
            <View className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <View
                  key={index}
                  className={`rounded-lg p-4 flex-row items-center shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <FontAwesome name="file-text-o" size={20} color={isDark ? '#fff' : '#3B82F6'} />
                  <Text className={`flex-1 ml-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{file}</Text>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: isDark ? '#22C55E' : '#22C55E' }} />
                    <Text className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>Uploaded</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      <Toast />
    </ScrollView>
  );
} 
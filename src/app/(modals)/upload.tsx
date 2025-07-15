import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';

export default function UploadScreen() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileUpload = () => {
    setIsUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      setIsUploading(false);
      const newFile = `students_${new Date().toISOString().split('T')[0]}.csv`;
      setUploadedFiles([newFile, ...uploadedFiles]);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Student data uploaded successfully!',
      });
    }, 2000);
  };

  const handleFileSelect = () => {
    // TODO: Implement actual file picker
    Toast.show({
      type: 'info',
      text1: 'File Picker',
      text2: 'File picker functionality would be implemented here',
    });
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 dark:text-white">
            Upload Student Data
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mt-1">
            Upload CSV files containing student information for exam management.
          </Text>
        </View>

        {/* Upload Area */}
        <View className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
          <View className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 items-center">
            <FontAwesome name="cloud-upload" size={48} color="#9CA3AF" />
            <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">
              Drop your CSV file here
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
              or click to browse files
            </Text>
            
            <View className="flex-row space-x-4">
              <TouchableOpacity
                className="bg-blue-500 rounded-lg px-6 py-3"
                onPress={handleFileSelect}
                disabled={isUploading}
              >
                <Text className="text-white font-semibold">
                  Browse Files
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`rounded-lg px-6 py-3 ${
                  isUploading 
                    ? 'bg-gray-400' 
                    : 'bg-green-500'
                }`}
                onPress={handleFileUpload}
                disabled={isUploading}
              >
                <Text className="text-white font-semibold">
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* CSV Format Guide */}
        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <Text className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
            CSV Format Requirements
          </Text>
          <Text className="text-blue-600 dark:text-blue-400 text-sm mb-2">
            Your CSV file should include the following columns:
          </Text>
          <View className="space-y-1">
            <Text className="text-blue-600 dark:text-blue-400 text-sm">
              • Student ID (required)
            </Text>
            <Text className="text-blue-600 dark:text-blue-400 text-sm">
              • First Name (required)
            </Text>
            <Text className="text-blue-600 dark:text-blue-400 text-sm">
              • Last Name (required)
            </Text>
            <Text className="text-blue-600 dark:text-blue-400 text-sm">
              • Email (optional)
            </Text>
            <Text className="text-blue-600 dark:text-blue-400 text-sm">
              • Course/Program (optional)
            </Text>
          </View>
        </View>

        {/* Uploaded Files */}
        <View>
          <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Recently Uploaded Files
          </Text>
          {uploadedFiles.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-lg p-6 items-center shadow-sm">
              <FontAwesome name="file-text-o" size={32} color="#9CA3AF" />
              <Text className="text-gray-500 dark:text-gray-400 mt-2">
                No files uploaded yet
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <View
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 flex-row items-center shadow-sm"
                >
                  <FontAwesome name="file-text-o" size={20} color="#3B82F6" />
                  <Text className="flex-1 text-gray-800 dark:text-white ml-3">
                    {file}
                  </Text>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    <Text className="text-xs text-green-600 dark:text-green-400">
                      Uploaded
                    </Text>
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
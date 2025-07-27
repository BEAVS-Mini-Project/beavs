import Toast from 'react-native-toast-message';

export interface AppError {
  message: string;
  context?: string;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  context?: string;
  code?: string;
  details?: any;

  constructor(message: string, context?: string, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.context = context;
    this.code = code;
    this.details = details;
  }
}

export const handleError = (error: any, context: string = 'Unknown') => {
  console.error(`Error in ${context}:`, error);

  let errorMessage = 'Something went wrong';
  let errorTitle = 'Error';

  // Handle different types of errors
  if (error instanceof AppError) {
    errorMessage = error.message;
    errorTitle = error.context || 'Error';
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.details) {
    errorMessage = error.details;
  }

  // Handle specific Supabase errors
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        errorMessage = 'No data found';
        break;
      case 'PGRST100':
        errorMessage = 'Invalid request format';
        break;
      case 'PGRST301':
        errorMessage = 'Access denied';
        break;
      case 'PGRST302':
        errorMessage = 'Authentication required';
        break;
      case 'PGRST303':
        errorMessage = 'Insufficient permissions';
        break;
      case '23505': // Unique constraint violation
        errorMessage = 'This record already exists';
        break;
      case '23503': // Foreign key constraint violation
        errorMessage = 'Related data not found';
        break;
      case '23514': // Check constraint violation
        errorMessage = 'Invalid data provided';
        break;
    }
  }

  // Show toast notification
  Toast.show({
    type: 'error',
    text1: errorTitle,
    text2: errorMessage,
  });

  return errorMessage;
};

export const handleSuccess = (message: string, title: string = 'Success') => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
  });
};

export const handleInfo = (message: string, title: string = 'Info') => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
  });
};

export const handleWarning = (message: string, title: string = 'Warning') => {
  Toast.show({
    type: 'error', // Using error type for warning since Toast doesn't have warning
    text1: title,
    text2: message,
  });
};

// Network error handling
export const isNetworkError = (error: any): boolean => {
  return error?.message?.includes('network') || 
         error?.message?.includes('fetch') ||
         error?.message?.includes('timeout') ||
         error?.code === 'NETWORK_ERROR';
};

// Authentication error handling
export const isAuthError = (error: any): boolean => {
  return error?.message?.includes('auth') ||
         error?.code === 'PGRST302' ||
         error?.code === 'PGRST303';
};

// Database error handling
export const isDatabaseError = (error: any): boolean => {
  return error?.code?.startsWith('PGRST') ||
         error?.code?.startsWith('235');
}; 
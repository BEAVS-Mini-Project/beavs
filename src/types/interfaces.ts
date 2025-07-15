export interface Course {
    id: string;
    title: string;
    code: string;
    studentRange: string;
    expectedCount: number;
    hall: string;
  }
  
  export interface Student {
    id: string;
    name: string;
    program: string;
    fingerprintId?: string;
  }
  
  export interface AttendanceRecord {
    id: string;
    studentId: string;
    studentName: string;
    courseId: string;
    timestamp: Date;
    answerSheetNumber?: string;
    status: 'present' | 'manual_override';
    overrideReason?: string;
    invigilatorId: string;
  }
  
  export interface VerificationResult {
    success: boolean;
    student?: Student;
    reason?: string;
  }
  
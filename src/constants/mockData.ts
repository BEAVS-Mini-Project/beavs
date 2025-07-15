export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  course?: string;
}

export interface Room {
  id: string;
  capacity: number;
  assigned: number;
  invigilator: string;
  status: 'active' | 'inactive';
  students?: Student[];
}

export interface Invigilator {
  id: string;
  name: string;
  email: string;
  assignedRooms: string[];
}

export const mockStudents: Student[] = [
  { id: '001', firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com', course: 'Computer Science' },
  { id: '002', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@email.com', course: 'Mathematics' },
  { id: '003', firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@email.com', course: 'Physics' },
  { id: '004', firstName: 'Sarah', lastName: 'Wilson', email: 'sarah.wilson@email.com', course: 'Chemistry' },
  { id: '005', firstName: 'David', lastName: 'Brown', email: 'david.brown@email.com', course: 'Biology' },
  { id: '006', firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@email.com', course: 'Computer Science' },
  { id: '007', firstName: 'Chris', lastName: 'Miller', email: 'chris.miller@email.com', course: 'Mathematics' },
  { id: '008', firstName: 'Lisa', lastName: 'Garcia', email: 'lisa.garcia@email.com', course: 'Physics' },
];

export const mockRooms: Room[] = [
  { id: 'A101', capacity: 30, assigned: 28, invigilator: 'John Smith', status: 'active' },
  { id: 'A102', capacity: 25, assigned: 25, invigilator: 'Sarah Johnson', status: 'active' },
  { id: 'B201', capacity: 40, assigned: 35, invigilator: 'Mike Davis', status: 'active' },
  { id: 'B202', capacity: 35, assigned: 0, invigilator: 'Unassigned', status: 'inactive' },
  { id: 'C301', capacity: 20, assigned: 18, invigilator: 'Emily Wilson', status: 'active' },
  { id: 'C302', capacity: 30, assigned: 24, invigilator: 'Chris Brown', status: 'active' },
];

export const mockInvigilators: Invigilator[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@university.edu', assignedRooms: ['A101'] },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@university.edu', assignedRooms: ['A102'] },
  { id: '3', name: 'Mike Davis', email: 'mike.davis@university.edu', assignedRooms: ['B201'] },
  { id: '4', name: 'Emily Wilson', email: 'emily.wilson@university.edu', assignedRooms: ['C301'] },
  { id: '5', name: 'Chris Brown', email: 'chris.brown@university.edu', assignedRooms: ['C302'] },
];

export const mockAttendanceData = [
  { room: 'A101', total: 30, present: 28, absent: 2, rate: '93%' },
  { room: 'A102', total: 25, present: 25, absent: 0, rate: '100%' },
  { room: 'B201', total: 40, present: 35, absent: 5, rate: '88%' },
  { room: 'B202', total: 35, present: 32, absent: 3, rate: '91%' },
  { room: 'C301', total: 20, present: 18, absent: 2, rate: '90%' },
  { room: 'C302', total: 30, present: 24, absent: 6, rate: '80%' },
];

export const mockRecentActivity = [
  { type: 'attendance', message: 'Room A101 attendance updated - 95% present', time: '2 min ago', color: 'green' },
  { type: 'upload', message: 'New student data uploaded - 150 students added', time: '15 min ago', color: 'blue' },
  { type: 'assignment', message: 'Invigilator assigned to Room B205', time: '1 hour ago', color: 'yellow' },
  { type: 'attendance', message: 'Room C301 attendance completed', time: '2 hours ago', color: 'green' },
  { type: 'upload', message: 'Room assignments updated', time: '3 hours ago', color: 'blue' },
]; 
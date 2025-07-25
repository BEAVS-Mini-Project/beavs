
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {}

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://aevssppcozwgdwhtkwdn.supabase.co';
const supabaseAnonKey =Constants.expoConfig?.extra?.supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFldnNzcHBjb3p3Z2R3aHRrd2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzM1MDQsImV4cCI6MjA2NzkwOTUwNH0.wGQUX4cE6o7ngA9M2Xd2XrKJ1b2WkEFLn6LVw4ZzdGc"
        ;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
  },
});

// Fetch all courses
export async function fetchCourses() {
  const { data, error } = await supabase
    .from('course')
    .select('*, program:program_id(*)');
  if (error) throw error;
  return data;
}

// Fetch today's exam sessions
export async function fetchTodayExamSessions() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('exam_session')
    .select('*, course:course_id(*)')
    .eq('exam_date', today);
  if (error) throw error;
  return data;
}

// Fetch course room allocations for a given session and room
export async function fetchCourseRoomAllocations(sessionId: string, roomId: string) {
  const { data, error } = await supabase
    .from('course_room_allocation')
    .select('*')
    .eq('exam_session_id', sessionId)
    .eq('exam_room_id', roomId);
  if (error) throw error;
  return data;
}

// Fetch courses assigned to the current invigilator for today, including hall name
export async function fetchInvigilatorCourses() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('No user logged in');

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Get all invigilation assignments for this invigilator for today
  const { data: assignments, error: assignmentError } = await supabase
    .from('invigilation_assignment')
    .select(`
      *,
      exam_session:exam_session_id(
        *,
        course:course_id(*)
      ),
      exam_room:exam_room_id(*)
    `)
    .eq('profile_id', user.id)
    .eq('exam_session.exam_date', today);
  if (assignmentError) throw assignmentError;
  if (!assignments || assignments.length === 0) return [];

  // Get course room allocations for the assigned rooms
  const roomIds = assignments.map(a => a.exam_room_id);
  const { data: allocations, error: allocError } = await supabase
    .from('course_room_allocation')
    .select(`
      *,
      exam_session:exam_session_id(
        *,
        course:course_id(*)
      ),
      exam_room:exam_room_id(*)
    `)
    .in('exam_room_id', roomIds)
    .eq('exam_session.exam_date', today);
  if (allocError) throw allocError;
  if (!allocations) return [];

  // Transform the data to match the expected format
  const result = allocations.map((allocation) => {
    const session = allocation.exam_session;
    const course = session?.course;
    const room = allocation.exam_room;
    
    if (!course || !room) return null;
    
    return {
      course: {
        ...course,
        expectedCount: allocation.student_count
      },
      hallName: room.name,
      allocation: {
        id: allocation.id,
        indexStart: allocation.index_start,
        indexEnd: allocation.index_end,
        studentCount: allocation.student_count
      }
    };
  }).filter(Boolean);

  // Remove duplicates by course id and hallName
  const nonNullResult = result.filter((item): item is { course: any, hallName: string, allocation: any } => !!item);
  const unique = nonNullResult.filter((item, i, arr) =>
    arr.findIndex(x => x.course.id === item.course.id && x.hallName === item.hallName) === i
  );
  return unique;
}

// Fetch all invigilation assignments (with session, room, and profile info)
export async function fetchAllInvigilationAssignments() {
  const { data, error } = await supabase
    .from('invigilation_assignment')
    .select(`
      *,
      exam_session:exam_session_id(*, course:course_id(*)),
      exam_room:exam_room_id(*),
      profile:profile_id(*)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Create a new invigilation assignment
export async function createInvigilationAssignment({
  profile_id,
  exam_session_id,
  exam_room_id,
  assigned_by
}: {
  profile_id: string,
  exam_session_id: string,
  exam_room_id: string,
  assigned_by: string
}) {
  const { data, error } = await supabase
    .from('invigilation_assignment')
    .insert([
      { profile_id, exam_session_id, exam_room_id, assigned_by }
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Delete an invigilation assignment
export async function deleteInvigilationAssignment(id: string) {
  const { error } = await supabase
    .from('invigilation_assignment')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Insert a record into attendance_log
export async function logAttendance({
  course_room_allocation_id,
  verified_by,
  method,
  note,
  student_number,
  fingerprint_matched,
  answer_sheet_number
}: {
  course_room_allocation_id: string,
  verified_by: string,
  method: 'manual' | 'biometric',
  note?: string,
  student_number: string,
  fingerprint_matched?: boolean,
  answer_sheet_number?: string
}) {
  const { error } = await supabase
    .from('attendance_log')
    .insert([
      {
        course_room_allocation_id,
        verified_by,
        method,
        note,
        student_number,
        fingerprint_matched,
        answer_sheet_number
      }
    ]);
  if (error) throw error;
}
        
// Fetch all exam sessions (with course info)
export async function fetchAllExamSessions() {
  const { data, error } = await supabase
    .from('exam_session')
    .select('*, course:course_id(*)')
    .order('exam_date', { ascending: false })
    .order('start_time', { ascending: true });
  if (error) throw error;
  return data;
}

// Create a new exam session
export async function createExamSession({
  course_id,
  exam_date,
  start_time,
  end_time,
  semester,
  academic_year
}: {
  course_id: string,
  exam_date: string,
  start_time: string,
  end_time: string,
  semester: string,
  academic_year: string
}) {
  const { data, error } = await supabase
    .from('exam_session')
    .insert([
      { course_id, exam_date, start_time, end_time, semester, academic_year }
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Update an existing exam session
export async function updateExamSession(id: string, update: Partial<{
  course_id: string,
  exam_date: string,
  start_time: string,
  end_time: string,
  semester: string,
  academic_year: string
}>) {
  const { data, error } = await supabase
    .from('exam_session')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Delete an exam session
export async function deleteExamSession(id: string) {
  const { error } = await supabase
    .from('exam_session')
    .delete()
    .eq('id', id);
  if (error) throw error;
}        

// Fetch all course room allocations (with session, room, and course info)
export async function fetchAllCourseRoomAllocations() {
  const { data, error } = await supabase
    .from('course_room_allocation')
    .select(`
      *,
      exam_session:exam_session_id(*, course:course_id(*)),
      exam_room:exam_room_id(*)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Create a new course room allocation
export async function createCourseRoomAllocation({
  exam_session_id,
  exam_room_id,
  course_id,
  index_start,
  index_end,
  student_count
}: {
  exam_session_id: string,
  exam_room_id: string,
  course_id: string,
  index_start: number,
  index_end: number,
  student_count: number
}) {
  const { data, error } = await supabase
    .from('course_room_allocation')
    .insert([
      { exam_session_id, exam_room_id, course_id, index_start, index_end, student_count }
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Update an existing course room allocation
export async function updateCourseRoomAllocation(id: string, update: Partial<{
  exam_session_id: string,
  exam_room_id: string,
  course_id: string,
  index_start: number,
  index_end: number,
  student_count: number
}>) {
  const { data, error } = await supabase
    .from('course_room_allocation')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Delete a course room allocation
export async function deleteCourseRoomAllocation(id: string) {
  const { error } = await supabase
    .from('course_room_allocation')
    .delete()
    .eq('id', id);
  if (error) throw error;
}        

export async function fetchAllRooms() {
  const { data, error } = await supabase
    .from('exam_room')
    .select('*');
  if (error) throw error;
  return data;
}        
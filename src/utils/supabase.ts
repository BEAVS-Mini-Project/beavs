
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, processLock } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  })
        
// Fetch all students
export async function fetchStudents() {
  const { data, error } = await supabase
    .from('student')
    .select('*');
  if (error) throw error;
  return data;
}

// Fetch all courses
export async function fetchCourses() {
  const { data, error } = await supabase
    .from('course')
    .select('*');
  if (error) throw error;
  return data;
}

// Fetch today's exam sessions
export async function fetchTodayExamSessions() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('exam_session')
    .select('*')
    .eq('exam_date', today);
  if (error) throw error;
  return data;
}

// Fetch exam allocations for a given session and room
export async function fetchExamAllocations(sessionId: string, roomId: string) {
  const { data, error } = await supabase
    .from('exam_allocation')
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

  // Get all rooms assigned to this invigilator
  const { data: rooms, error: roomError } = await supabase
    .from('exam_room')
    .select('id, name')
    .eq('invigilator_id', user.id);
  if (roomError) throw roomError;
  if (!rooms || rooms.length === 0) return [];
  const roomIds = rooms.map(r => r.id);
  const roomMap = Object.fromEntries(rooms.map(r => [r.id, r.name]));

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Join exam_session and course for sessions in these rooms today
  const { data: sessions, error: sessionError } = await supabase
    .from('exam_session')
    .select('*, course:course_id(*)')
    .eq('exam_date', today);
  if (sessionError) throw sessionError;
  if (!sessions) return [];

  // Find sessions that are in the invigilator's rooms
  const { data: allocations, error: allocError } = await supabase
    .from('exam_allocation')
    .select('exam_session_id, exam_room_id')
    .in('exam_room_id', roomIds);
  if (allocError) throw allocError;
  if (!allocations) return [];
  const sessionRoomPairs = allocations.map(a => ({ sessionId: a.exam_session_id, roomId: a.exam_room_id }));

  // For each session/room pair, find the session and its course, and the room name
  const result = sessionRoomPairs.map(({ sessionId, roomId }) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || !session.course) return null;
    return {
      course: session.course,
      hallName: roomMap[roomId] || '',
    };
  }).filter(Boolean);

  // Remove duplicates by course id and hallName
  const nonNullResult = result.filter((item): item is { course: any, hallName: string } => !!item);
  const unique = nonNullResult.filter((item, i, arr) =>
    arr.findIndex(x => x.course.id === item.course.id && x.hallName === item.hallName) === i
  );
  return unique;
}
        
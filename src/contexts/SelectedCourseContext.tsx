import { create } from 'zustand';

export type Course = {
  id: string;
  title: string;
  code?: string;
  studentRange?: string;
  expectedCount?: number;
  hall?: string;
  program_id?: string;
  allocation?: {
    id: string;
    indexStart: number;
    indexEnd: number;
    studentCount: number;
  };
  course?: any; // for compatibility with supabase result
};

type SelectedCourseState = {
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
};

export const useSelectedCourseStore = create<SelectedCourseState>((set) => ({
  selectedCourse: null,
  setSelectedCourse: (course) => set({ selectedCourse: course }),
}));


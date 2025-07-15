import React, { createContext, useState, useContext, ReactNode } from 'react';

export type Course = {
  id: string;
  title: string;
  code?: string;
  studentRange?: string;
  expectedCount?: number;
  hall?: string;
};

type SelectedCourseContextType = {
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
};

const SelectedCourseContext = createContext<SelectedCourseContextType>({
  selectedCourse: null,
  setSelectedCourse: () => {},
});

export function SelectedCourseProvider({ children }: { children: ReactNode }) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  return (
    <SelectedCourseContext.Provider value={{ selectedCourse, setSelectedCourse }}>
      {children}
    </SelectedCourseContext.Provider>
  );
}

export function useSelectedCourse() {
  return useContext(SelectedCourseContext);
} 
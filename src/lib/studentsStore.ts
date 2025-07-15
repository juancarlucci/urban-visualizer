//* src/lib/studentsStore.ts
//* Zustand-based state management for storing and updating student data and animation time across the app.

import { create } from "zustand";

export interface Student {
  id: string;
  name: string;
  lat: number;
  lng: number;
  speed: number;
  color: string;
  currentTime?: number; //* 0.0 to 1.0
  route: [number, number][]; //* Array of [lat, lng] pairs representing the route
  startDelay: number; //* Delay before the student starts moving,
  isFixed: boolean; //* Whether the student is fixed in place or can move
  visitedPath: [number, number][]; //* Path the student has visited
}

interface StudentStore {
  students: Student[];
  currentTime: number; //* 0.0 to 1.0
  addStudent: (s: Student) => void;
  setStudents: (s: Student[]) => void;
  setTime: (t: number) => void;
}

export const useStudentStore = create<StudentStore>()((set) => ({
  students: [],
  addStudent: (s) => set((state) => ({ students: [...state.students, s] })),
  setStudents: (s) => set({ students: s }),
  currentTime: 0,
  setTime: (t) => set({ currentTime: t }),
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Transport = "walk" | "bike" | "car" | "subway";

export interface Student {
  id: string;
  name: string;
  lat: number;
  lng: number;
  mode: Transport;
  speed: number;
  color: string;
  currentTime?: number; //* 0.0 to 1.0
  route: [number, number][]; //* Array of [lat, lng] pairs representing the route
  startDelay: number; //* Delay before the student starts moving,
}

interface StudentStore {
  students: Student[];
  currentTime: number; //* 0.0 to 1.0
  addStudent: (s: Student) => void;
  setStudents: (s: Student[]) => void;
  setTime: (t: number) => void;
}

export const useStudentStore = create<StudentStore>()(
  persist(
    (set) => ({
      students: [],
      addStudent: (s) => set((state) => ({ students: [...state.students, s] })),
      setStudents: (s) => set({ students: s }),
      currentTime: 0,
      setTime: (t) => set({ currentTime: t }),
    }),
    { name: "student-store" }
  )
);

import { Student } from "./studentsStore";

export function getAnimatedPosition(
  student: Student,
  time: number
): [number, number] {
  if (!student.route || student.route.length < 2) {
    return [student.lng, student.lat];
  }

  const index = Math.floor((student.route.length - 1) * time);
  const nextIndex = Math.min(index + 1, student.route.length - 1);

  const [x1, y1] = student.route[index];
  const [x2, y2] = student.route[nextIndex];

  const localT = (student.route.length - 1) * time - index;

  return [x1 + (x2 - x1) * localT, y1 + (y2 - y1) * localT];
}

export function getTrailPoints(
  student: Student,
  time: number,
  steps = 20
): [number, number][] {
  const [start, end] = student.route ?? [];
  if (!Array.isArray(student.route) || student.route.length < 2) {
    console.warn("Invalid route for student", student.id, student.route);
    return [];
  }
  if (!start || !end) return [];

  return Array.from({ length: steps }, (_, i) => {
    const t = Math.max(0, Math.min(1, time - (student.startDelay ?? 0)));

    return [
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
    ];
  });
}

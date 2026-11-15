import { CourseList } from "../types/types";

// isExtra describes the plan, not the course, so it is deleted (never set to
// false or undefined: Firestore rejects undefined) whenever a course leaves
// the grid. Returns the same object when nothing changes.
export const clearExtra = (courses: CourseList, codes: string[]): CourseList => {
  const flagged = codes.filter((code) => courses[code]?.isExtra);
  if (!flagged.length) return courses;
  const next = { ...courses };
  flagged.forEach((code) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isExtra: _, ...rest } = next[code];
    next[code] = rest;
  });
  return next;
};

export const toggleExtra = (courses: CourseList, code: string): CourseList => {
  const course = courses[code];
  if (!course) return courses;
  if (course.isExtra) return clearExtra(courses, [code]);
  return { ...courses, [code]: { ...course, isExtra: true } };
};

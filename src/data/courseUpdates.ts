// Each entry describes one change to mockCourses that existing users should
// receive. Append a new entry (with the next version number) whenever
// mockCourses changes in a way existing users need.
export interface CourseUpdate {
  version: number; // 1, 2, 3, ... strictly increasing
  // Add every mockCourses code the user does not have. Used once, for
  // version 1, because nothing was tracked before it.
  addMissing?: true;
  // Replace (or add) these codes with the current mockCourses entry.
  upsert?: string[];
  // Remove these codes (only if they are not on the user's grid).
  remove?: string[];
}

export const courseUpdates: CourseUpdate[] = [
  // ECE390 became second term only (ab4cf58), ECE412 gained a prerequisite (474a745)
  { version: 1, addMissing: true, upsert: ["ECE390", "ECE412"] },
];

export const COURSE_DATA_VERSION =
  courseUpdates[courseUpdates.length - 1].version;

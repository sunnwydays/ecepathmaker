import { UniqueIdentifier } from "@dnd-kit/core";
import { courseUpdates, COURSE_DATA_VERSION } from "../data/courseUpdates";
import mockCourses from "../data/mockCourses";
import { CourseList, CoursesUsed } from "../types/types";
import { addDependencies } from "./addDependencies";

export interface CourseUpdateResult {
  courses: CourseList;
  coursesUsed: CoursesUsed;
  version: number;
  // codes replaced by upsert (callers use this to refresh dependencies)
  upserted: string[];
}

// Brings a user's stored course data up to date with courseUpdates.
export function applyCourseUpdates(input: {
  courses: CourseList;
  coursesUsed: CoursesUsed;
  version: number; // the user's stored version, 0 if none
}): CourseUpdateResult {
  const courses: CourseList = { ...input.courses };
  const coursesUsed: CoursesUsed = { ...input.coursesUsed };
  const upserted = new Set<string>();

  for (const update of courseUpdates) {
    if (update.version <= input.version) continue;

    if (update.addMissing) {
      for (const code of Object.keys(mockCourses)) {
        if (code in courses) continue;
        courses[code] = mockCourses[code];
        coursesUsed[code] = "";
      }
    }

    for (const code of update.upsert ?? []) {
      if (!(code in mockCourses)) continue;
      courses[code] = mockCourses[code];
      // coursesUsed drives the bucket, so a course needs an entry there
      if (!(code in coursesUsed)) coursesUsed[code] = "";
      upserted.add(code);
    }

    for (const code of update.remove ?? []) {
      if (coursesUsed[code]) continue; // on the grid
      delete courses[code];
      delete coursesUsed[code];
      upserted.delete(code);
    }
  }

  return {
    courses,
    coursesUsed,
    version: COURSE_DATA_VERSION,
    upserted: [...upserted],
  };
}

// An upserted course already on the grid may have new prerequisites that are
// missing from the dependencies map; add them. Returns a new map.
export function refreshDependencies(
  upserted: string[],
  courses: CourseList,
  coursesUsed: CoursesUsed,
  dependencies: Map<UniqueIdentifier, Set<UniqueIdentifier>>
) {
  const updated = new Map<UniqueIdentifier, Set<UniqueIdentifier>>(
    Array.from(dependencies, ([key, set]) => [key, new Set(set)])
  );
  for (const code of upserted) {
    if (!coursesUsed[code] || !courses[code]) continue;
    addDependencies({ code, courses, dependencies: updated });
  }
  return updated;
}

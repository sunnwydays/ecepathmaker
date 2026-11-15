import {
  CourseList,
  CoursesOnGrid,
  CoursesUsed,
  GridPosition,
  YearTerm,
} from "../types/types";
import { coreCourses } from "../data/coreCourses";
import { getValidYearTerms } from "./getValidYearTerms";

export type CourseStatus =
  | { kind: "onGrid"; slot: GridPosition }
  | { kind: "canTake"; from: YearTerm }
  | { kind: "missing" }
  | { kind: "taken" } // a first- or second-year course
  | { kind: "external" }; // not in the course list

const TERMS: YearTerm[] = ["3F", "3S", "4F", "4S"];

// Where a course stands for the user's current grid. Uses the same rules as
// the Maker, so the explorer and the Maker agree.
export const getCourseStatus = (
  code: string,
  courses: CourseList,
  coursesUsed: CoursesUsed,
  coursesOnGrid: CoursesOnGrid
): CourseStatus => {
  const slot = coursesUsed[code];
  if (slot) return { kind: "onGrid", slot };
  if (coreCourses.has(code)) return { kind: "taken" };
  const course = courses[code];
  if (!course) return { kind: "external" };

  const valid = getValidYearTerms({ coursesOnGrid, coursesUsed, course });
  const from = TERMS.find((term) => valid[term]);
  return from ? { kind: "canTake", from } : { kind: "missing" };
};

// Short text for a status, or null when there is nothing to say
export const describeStatus = (status: CourseStatus): string | null => {
  switch (status.kind) {
    case "onGrid":
      return `In ${status.slot.split(".")[0]} on your grid`;
    case "canTake":
      return `Can take from ${status.from}`;
    case "missing":
      return "Missing prerequisites";
    case "taken":
      return "Already taken";
    default:
      return null;
  }
};

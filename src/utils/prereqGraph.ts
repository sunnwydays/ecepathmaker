import { CourseCardPropsWithoutCode, CourseList } from "../types/types";

export type EdgeKind = "preq" | "coreq"; // later: "related"

// One requirement of a course: a single course, or "one of" several
export interface Requirement {
  kind: EdgeKind;
  options: string[]; // length 1 = required, more = one of
}

export interface Unlock {
  code: string;
  kind: EdgeKind;
}

type Reqs = Pick<CourseCardPropsWithoutCode, "preq" | "coreq">;

export const getRequirements = (course: Reqs | undefined): Requirement[] => {
  if (!course) return [];
  const result: Requirement[] = [];
  const add = (kind: EdgeKind, reqs?: (string | string[])[]) => {
    for (const req of reqs ?? []) {
      result.push({ kind, options: Array.isArray(req) ? req : [req] });
    }
  };
  add("preq", course.preq);
  add("coreq", course.coreq);
  return result;
};

// Reverse map over the whole course list: code -> courses that list it as a
// prerequisite or corequisite (including as an option of a "one of" group).
export const buildUnlocks = (courses: CourseList): Map<string, Unlock[]> => {
  const unlocks = new Map<string, Unlock[]>();
  for (const [code, course] of Object.entries(courses)) {
    for (const { kind, options } of getRequirements(course)) {
      for (const option of options) {
        const list = unlocks.get(option) ?? [];
        // a course may name the same code in both preq and coreq; keep each kind once
        if (!list.some((u) => u.code === code && u.kind === kind)) {
          list.push({ code, kind });
        }
        unlocks.set(option, list);
      }
    }
  }
  return unlocks;
};

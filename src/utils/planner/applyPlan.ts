import { UniqueIdentifier } from "@dnd-kit/core";
import {
  CourseList,
  CoursesOnGrid,
  CoursesUsed,
  GridPositionBase,
} from "../../types/types";
import { addDependencies } from "../addDependencies";
import { getValidYearTerms } from "../getValidYearTerms";
import { PLAN_TERMS, PlanTerms } from "./parsePlan";

const SLOTS = [1, 2, 3, 4, 5, 6];

export interface ApplyPlanResult {
  coursesOnGrid: CoursesOnGrid;
  coursesUsed: CoursesUsed;
  dependencies: Map<UniqueIdentifier, Set<UniqueIdentifier>>;
  placed: number;
  warnings: string[];
}

/**
 * Writes a plan onto a copy of the grid. Only the terms in the plan are
 * replaced; the others (XX, locked terms) stay as they are.
 */
export const applyPlan = ({
  plan,
  courses,
  coursesOnGrid,
}: {
  plan: PlanTerms;
  courses: CourseList;
  coursesOnGrid: CoursesOnGrid;
}): ApplyPlanResult => {
  const grid: CoursesOnGrid = { ...coursesOnGrid };
  const warnings: string[] = [];
  let placed = 0;

  const slotKey = (term: string, slot: number) =>
    `${term}.${slot}` as GridPositionBase;

  PLAN_TERMS.forEach((term) => {
    if (plan[term]) SLOTS.forEach((slot) => (grid[slotKey(term, slot)] = ""));
  });

  const onGrid = new Set(Object.values(grid).filter((code) => code !== ""));

  PLAN_TERMS.forEach((term) => {
    (plan[term] ?? []).forEach((code) => {
      if (!courses[code]) {
        warnings.push(
          `${code} is not in your course list (add it as a custom course in the Maker, then load again)`
        );
        return;
      }
      if (onGrid.has(code)) {
        const current = Object.entries(grid).find(([, c]) => c === code)![0];
        warnings.push(`${code} is already in ${current.split(".")[0]}`);
        return;
      }
      const free = SLOTS.find((slot) => grid[slotKey(term, slot)] === "");
      if (free === undefined) {
        warnings.push(`${term} is full, ${code} was left out`);
        return;
      }
      grid[slotKey(term, free)] = code;
      onGrid.add(code);
      placed++;
    });
  });

  const coursesUsed: CoursesUsed = {};
  Object.keys(courses).forEach((code) => (coursesUsed[code] = ""));

  const dependencies = new Map<UniqueIdentifier, Set<UniqueIdentifier>>();
  (Object.keys(grid) as GridPositionBase[]).forEach((position) => {
    const code = grid[position];
    if (!code || !courses[code]) return;
    coursesUsed[code] = position;
    addDependencies({ code, courses, dependencies });
  });

  // The same term and prerequisite check the Maker uses to grey out a card
  PLAN_TERMS.forEach((term) => {
    if (!plan[term] || term === "XX") return;
    SLOTS.forEach((slot) => {
      const code = grid[slotKey(term, slot)];
      if (!code) return;
      const course = courses[code];
      const valid = getValidYearTerms({ coursesOnGrid: grid, coursesUsed, course });
      if (valid[term]) return;
      const fall = term.endsWith("F");
      if (course.onlyF && !fall) warnings.push(`${code} is F only but is in ${term}`);
      else if (course.onlyS && fall) warnings.push(`${code} is S only but is in ${term}`);
      else
        warnings.push(
          `${code} is in ${term} without its prerequisites or corequisites in time`
        );
    });
  });

  return { coursesOnGrid: grid, coursesUsed, dependencies, placed, warnings };
};

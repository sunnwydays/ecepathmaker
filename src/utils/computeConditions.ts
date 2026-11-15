import {
  CoursesOnGrid,
  CourseList,
  CoursesUsed,
  StreamRequirements,
} from "../types/types";
import { evaluate } from "../requirements/evaluate";
import { ecePre2026 } from "../requirements/curricula/ecePre2026";

// Adapter: the pre-2026 rules now live in requirements/curricula/ecePre2026.
export const computeConditions = ({
  coursesOnGrid,
  courses,
  coursesUsed,
}: {
  coursesOnGrid: CoursesOnGrid;
  courses: CourseList;
  coursesUsed: CoursesUsed;
}): StreamRequirements => {
  const result = evaluate(ecePre2026, { courses, coursesOnGrid, coursesUsed });
  const met = (id: string) => result.results.find((r) => r.id === id)?.met;

  const streamCounts: Record<number, number> = {};
  for (let i = 1; i <= 6; i++) streamCounts[i] = result.groupCounts[String(i)];

  return {
    hasCS: !!met("cs"),
    hasHSS: !!met("hss"),
    streamCounts,
    breadthStreams: result.breadthGroups.map(Number),
    depthStreams: result.depthGroups.map(Number),
    hasBreadth: !!met("breadth"),
    hasDepth: !!met("depth"),
    hasEconomics: !!met("economics"),
    hasCapstone: !!met("capstone"),
    hasSciMath: !!met("sciMath"),
    ceOrEE: result.designation,
  };
};

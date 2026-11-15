import { UniqueIdentifier } from "@dnd-kit/core";
import { useLayoutContext } from "../components/layout/Layout";
import { GridPosition, YearTerm } from "../types/types";
import { addDependencies } from "./addDependencies";
import { getValidYearTerms } from "./getValidYearTerms";

// Returns a function that puts a course on the earliest valid empty slot and
// gives back that slot, or '' when there is none.
export const useAddToGrid = () => {
  const {
    courses,
    coursesUsed,
    setCoursesUsed,
    coursesOnGrid,
    setCoursesOnGrid,
    dependencies,
    setDependencies,
  } = useLayoutContext();

  return (code: UniqueIdentifier): GridPosition => {
    const validYearTerms = getValidYearTerms({
      coursesOnGrid,
      coursesUsed,
      course: courses[code],
    });

    let targetPos: GridPosition = "";
    for (const [pos, onGrid] of Object.entries(coursesOnGrid)) {
      // The sixth column is only for courses the student drags there
      if (!onGrid && !pos.endsWith(".6") && validYearTerms[pos.slice(0, 2) as YearTerm]) {
        targetPos = pos as GridPosition;
        break;
      }
    }
    if (!targetPos) return "";

    addDependencies({ code, courses, dependencies, setDependencies });
    setCoursesUsed((prev) => ({ ...prev, [code]: targetPos }));
    setCoursesOnGrid((prev) => ({ ...prev, [targetPos]: code }));
    return targetPos;
  };
};

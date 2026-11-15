import { UniqueIdentifier } from "@dnd-kit/core";
import { useLayoutContext } from "../components/layout/Layout";
import { GridPosition, YearTerm } from "../types/types";
import { addDependencies } from "./addDependencies";
import { getValidYearTerms } from "./getValidYearTerms";

// Returns a function that puts a course on an empty slot (the earliest valid
// one, or the first empty slot of `term`) and gives back that slot, or ''
// when there is none. With `allowSixth`, a term whose five columns are full
// takes the course in the sixth (overload) column and turns that column on.
export const useAddToGrid = ({ allowSixth = false } = {}) => {
  const {
    courses,
    coursesUsed,
    setCoursesUsed,
    coursesOnGrid,
    setCoursesOnGrid,
    dependencies,
    setDependencies,
    setShowSixth,
  } = useLayoutContext();

  return (code: UniqueIdentifier, term?: YearTerm): GridPosition => {
    const validYearTerms = getValidYearTerms({
      coursesOnGrid,
      coursesUsed,
      course: courses[code],
    });

    const entries = Object.entries(coursesOnGrid);
    const fits = (pos: string, onGrid: string) =>
      !onGrid &&
      validYearTerms[pos.slice(0, 2) as YearTerm] &&
      (!term || pos.startsWith(term));

    // the first five columns come first; the sixth is only for overloading
    let targetPos = (entries.find(
      ([pos, onGrid]) => !pos.endsWith(".6") && fits(pos, onGrid)
    )?.[0] ?? "") as GridPosition;
    if (!targetPos && allowSixth) {
      targetPos = (entries.find(
        ([pos, onGrid]) => pos.endsWith(".6") && fits(pos, onGrid)
      )?.[0] ?? "") as GridPosition;
      if (targetPos) setShowSixth(true);
    }
    if (!targetPos) return "";

    addDependencies({ code, courses, dependencies, setDependencies });
    setCoursesUsed((prev) => ({ ...prev, [code]: targetPos }));
    setCoursesOnGrid((prev) => ({ ...prev, [targetPos]: code }));
    return targetPos;
  };
};

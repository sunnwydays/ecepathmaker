import { Dispatch, FC, SetStateAction, useEffect, useMemo, useRef } from "react";
import { CourseList as CourseListType, CoursesUsed, FilterState } from "../../types/types";
import Filter from "../forms/Filter";
import { getMembership } from "../../requirements/evaluate";
import { getYearTerm } from "../../utils/getYearTerm";
import { useCurriculum } from "../layout/Layout";
import CourseRow from "./CourseRow";

export type SortKey = "group" | "code" | "term";

interface CourseListProps {
  courses: CourseListType;
  // codes that pass the filters and the hide toggle
  matching: string[];
  coursesUsed: CoursesUsed;
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  sort: SortKey;
  setSort: (sort: SortKey) => void;
  hideOnGrid: boolean;
  setHideOnGrid: (hide: boolean) => void;
  selected: string | null;
  onSelect: (code: string) => void;
}

const termRank = (course: CourseListType[string]) =>
  course.onlyF ? 0 : course.onlyS ? 1 : 2;

const CourseList: FC<CourseListProps> = ({
  courses,
  matching,
  coursesUsed,
  filters,
  setFilters,
  sort,
  setSort,
  hideOnGrid,
  setHideOnGrid,
  selected,
  onSelect,
}) => {
  const curriculum = useCurriculum();

  const shown = useMemo(() => {
    const groupOrder = (code: string) => {
      const [first] = getMembership(curriculum, code, courses[code]).groups;
      const index = curriculum.groups.findIndex((g) => g.id === first);
      return index === -1 ? curriculum.groups.length : index;
    };
    const kernelRank = (code: string) =>
      getMembership(curriculum, code, courses[code]).kernel ? 0 : 1;

    return [...matching].sort((a, b) => {
      if (sort === "group") {
        return (
          groupOrder(a) - groupOrder(b) ||
          kernelRank(a) - kernelRank(b) ||
          a.localeCompare(b)
        );
      }
      if (sort === "term") {
        return termRank(courses[a]) - termRank(courses[b]) || a.localeCompare(b);
      }
      return a.localeCompare(b);
    });
  }, [courses, matching, sort, curriculum]);

  // Keep the selected row in view, e.g. when it was picked from the details
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (!selected) return;
    const row = listRef.current?.querySelector(`[data-code="${selected}"]`);
    row?.scrollIntoView?.({ block: "nearest" });
  }, [selected]);

  const total = Object.keys(courses).length;

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <Filter filters={filters} setFilters={setFilters} />
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm dark:text-gray-50">
        <span data-testid="result-count" aria-live="polite">
          {shown.length} of {total} courses
        </span>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={hideOnGrid}
            onChange={(e) => setHideOnGrid(e.target.checked)}
            data-testid="hide-on-grid"
          />
          <span>Hide courses on my grid</span>
        </label>
        <label className="flex items-center gap-2">
          <span>Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            data-testid="sort-select"
            className="rounded border border-neutral3 px-1 py-0.5 text-black"
          >
            <option value="group">Group</option>
            <option value="code">Code</option>
            <option value="term">Term</option>
          </select>
        </label>
      </div>
      {shown.length ? (
        <ul
          ref={listRef}
          className="flex flex-col gap-1.5 lg:max-h-[70vh] lg:overflow-y-auto pr-1"
        >
          {shown.map((code) => {
            const slot = coursesUsed[code];
            return (
              <CourseRow
                key={code}
                code={code}
                course={courses[code]}
                selected={code === selected}
                gridLabel={slot ? `In ${getYearTerm(slot)}` : null}
                onSelect={onSelect}
              />
            );
          })}
        </ul>
      ) : (
        <div className="w-full text-center text-neutral3 italic select-none">
          No courses match the current filter
        </div>
      )}
    </div>
  );
};

export default CourseList;

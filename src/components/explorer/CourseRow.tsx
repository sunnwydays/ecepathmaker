import { FC } from "react";
import { CourseCardPropsWithoutCode } from "../../types/types";
import CoursePills from "./CoursePills";

const CourseRow: FC<{
  code: string;
  course: CourseCardPropsWithoutCode;
  selected: boolean;
  // e.g. "In 3F"
  gridLabel: string | null;
  onSelect: (code: string) => void;
}> = ({ code, course, selected, gridLabel, onSelect }) => (
  <li>
    <button
      type="button"
      data-testid="course-row"
      data-code={code}
      aria-current={selected ? "true" : undefined}
      onClick={() => onSelect(code)}
      className={`
        w-full text-left px-3 py-2 rounded-lg border flex flex-col gap-1
        transition-colors dark:text-gray-50
        ${
          selected
            ? "bg-green1/40 border-green2 dark:bg-green4/50"
            : "bg-white border-neutral2 hover:border-green2 dark:bg-gray-600/50 dark:border-gray-500"
        }
      `}
    >
      <span className="flex items-baseline justify-between gap-2">
        <span>
          <span className="font-semibold">{code}</span>
          <span className="ml-2 text-sm">{course.name}</span>
        </span>
        {gridLabel && (
          <span className="shrink-0 text-xs font-medium rounded border border-green4 dark:border-green1 px-1.5">
            ✓ {gridLabel}
          </span>
        )}
      </span>
      <CoursePills code={code} course={course} />
    </button>
  </li>
);

export default CourseRow;

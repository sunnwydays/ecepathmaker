import { FC } from "react";
import { CourseCardPropsWithoutCode } from "../../types/types";
import { getMembership, hasFlag } from "../../requirements/evaluate";
import { useCurriculum } from "../layout/Layout";
import { getTextColor } from "../../utils/getTextColor";

const pillClass =
  "inline-block rounded-full px-2 py-0.5 text-xs font-medium leading-tight";

// Group (in the group colour, "(k)" for kernel), term and course type pills
const CoursePills: FC<{ code: string; course: CourseCardPropsWithoutCode }> = ({
  code,
  course,
}) => {
  const curriculum = useCurriculum();
  const { groups, kernel } = getMembership(curriculum, code, course);

  const types: string[] = [];
  if (course.isCS) types.push("CS");
  if (course.isHSS) types.push("HSS");
  if (hasFlag(curriculum, "isSciMath", code, course)) types.push("Sci/Math");
  if (course.isArtSci) types.push("ArtSci");

  const neutral = `${pillClass} bg-neutral2 text-gray-800 dark:bg-gray-500 dark:text-gray-50`;

  return (
    <span className="flex flex-wrap items-center gap-1">
      {groups.map((id) => {
        const group = curriculum.groups.find((g) => g.id === id);
        const color = group?.color ?? "#e0e0e0";
        return (
          <span
            key={id}
            title={`Group ${group?.label ?? id}${kernel ? " (kernel)" : ""}`}
            data-testid="group-pill"
            className={`${pillClass} ${getTextColor(color.replace("#", ""))}`}
            style={{ backgroundColor: color }}
          >
            {group?.label ?? id}
            {kernel ? " (k)" : ""}
          </span>
        );
      })}
      {(course.onlyF || course.onlyS) && (
        <span className={neutral} title="Offered in one term only">
          {course.onlyF ? "F" : "S"}
        </span>
      )}
      {types.map((type) => (
        <span key={type} className={neutral}>
          {type}
        </span>
      ))}
    </span>
  );
};

export default CoursePills;

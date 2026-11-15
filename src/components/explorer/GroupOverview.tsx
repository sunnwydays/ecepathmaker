import { FC, useMemo } from "react";
import { CourseList } from "../../types/types";
import { getMembership } from "../../requirements/evaluate";
import { getTextColor } from "../../utils/getTextColor";
import { useCurriculum } from "../layout/Layout";

interface Section {
  id: string;
  title: string;
  color?: string;
  codes: string[];
}

// Shown when no course is selected: every course as a chip, by group
const GroupOverview: FC<{
  courses: CourseList;
  // only these courses are shown (the ones passing the list's filters)
  codes: string[];
  onSelect: (code: string) => void;
}> = ({ courses, codes, onSelect }) => {
  const curriculum = useCurriculum();

  const sections = useMemo(() => {
    const byGroup = new Map<string, string[]>();
    const other: string[] = [];
    for (const code of codes) {
      const { groups } = getMembership(curriculum, code, courses[code]);
      const known = groups.filter((id) => curriculum.groups.some((g) => g.id === id));
      if (!known.length) other.push(code);
      for (const id of known) byGroup.set(id, [...(byGroup.get(id) ?? []), code]);
    }
    const kernel = (code: string) =>
      getMembership(curriculum, code, courses[code]).kernel ? 0 : 1;
    const sorted = (codes: string[]) =>
      [...codes].sort((a, b) => kernel(a) - kernel(b) || a.localeCompare(b));

    const result: Section[] = curriculum.groups.map((group) => ({
      id: group.id,
      title: `Group ${group.label}`,
      color: group.color,
      codes: sorted(byGroup.get(group.id) ?? []),
    }));
    result.push({ id: "other", title: "Other", codes: sorted(other) });
    return result.filter((section) => section.codes.length);
  }, [courses, codes, curriculum]);

  return (
    <div
      data-testid="group-overview"
      className="flex flex-col gap-4 rounded-md bg-neutral1 dark:bg-gray-600 dark:text-gray-50 p-4"
    >
      <p className="italic">Select a course to see its prerequisites</p>
      {sections.map((section) => (
        <section key={section.id}>
          <h3 className="mb-1.5 flex items-center gap-2 font-semibold">
            {section.color && (
              <span
                aria-hidden="true"
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: section.color }}
              />
            )}
            {section.title}
            <span className="text-sm font-normal">({section.codes.length})</span>
          </h3>
          <ul className="flex flex-wrap gap-1.5">
            {section.codes.map((code) => {
              const { kernel } = getMembership(curriculum, code, courses[code]);
              return (
                <li key={code}>
                  <button
                    type="button"
                    title={courses[code].name}
                    onClick={() => onSelect(code)}
                    className={`rounded px-2 py-0.5 text-sm hover:underline ${
                      section.color
                        ? getTextColor(section.color.replace("#", ""))
                        : "text-black"
                    } ${kernel ? "font-bold" : ""}`}
                    style={{ backgroundColor: section.color ?? "#e0e0e0" }}
                  >
                    {code}
                    {kernel ? " (k)" : ""}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default GroupOverview;

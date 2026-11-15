import { FC, ReactNode, useState } from "react";
import { CourseList, CoursesOnGrid, CoursesUsed, YearTerm } from "../../types/types";
import { coreCourses } from "../../data/coreCourses";
import { useAddToGrid } from "../../utils/useAddToGrid";
import { describeStatus, getCourseStatus, getTakeTerms } from "../../utils/courseStatus";
import { getRequirements, Requirement, Unlock } from "../../utils/prereqGraph";
import CoursePills from "./CoursePills";

const CodeLink: FC<{
  code: string;
  courses: CourseList;
  onSelect: (code: string) => void;
}> = ({ code, courses, onSelect }) =>
  courses[code] ? (
    <button
      type="button"
      onClick={() => onSelect(code)}
      className="font-medium underline decoration-dotted underline-offset-2 hover:text-green4 dark:hover:text-green1"
    >
      {code}
    </button>
  ) : coreCourses.has(code) ? (
    <span
      className="text-gray-500 dark:text-gray-300"
      title="First- or second-year course, assumed taken"
    >
      ✓ {code}
    </span>
  ) : (
    <span className="text-gray-500 dark:text-gray-300">{code}</span>
  );

const Section: FC<{ title: string; children: ReactNode }> = ({
  title,
  children,
}) => (
  <div>
    <h4 className="font-semibold">{title}</h4>
    {children}
  </div>
);

const CourseDetail: FC<{
  code: string;
  courses: CourseList;
  coursesUsed: CoursesUsed;
  coursesOnGrid: CoursesOnGrid;
  unlocks: Map<string, Unlock[]>;
  onSelect: (code: string) => void;
}> = ({ code, courses, coursesUsed, coursesOnGrid, unlocks, onSelect }) => {
  const course = courses[code];
  const requirements = getRequirements(course);
  const preqs = requirements.filter((r) => r.kind === "preq");
  const coreqs = requirements.filter((r) => r.kind === "coreq");
  const unlocked = unlocks.get(code) ?? [];
  const status = getCourseStatus(code, courses, coursesUsed, coursesOnGrid);
  const statusText = describeStatus(status);
  const addToGrid = useAddToGrid({ allowSixth: true });
  const [added, setAdded] = useState<string | null>(null);
  const [pickedTerm, setPickedTerm] = useState<string>("");

  // terms the course is valid in that still have an empty slot
  const openTerms =
    status.kind === "canTake"
      ? getTakeTerms(course, coursesUsed, coursesOnGrid).filter((term) =>
          Object.entries(coursesOnGrid).some(
            ([pos, c]) => !c && pos.startsWith(term)
          )
        )
      : [];
  // true when the term's first five columns are full
  const isOverload = (t: string) =>
    !Object.entries(coursesOnGrid).some(
      ([pos, c]) => !c && pos.startsWith(t) && !pos.endsWith(".6")
    );
  const term = (openTerms as string[]).includes(pickedTerm)
    ? (pickedTerm as YearTerm)
    : openTerms[0];

  const renderList = (list: Requirement[]) => (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {list.map(({ options }, i) => (
        <li key={i}>
          {options.length > 1 && <span>one of: </span>}
          {options.map((option, j) => (
            <span key={option}>
              {j > 0 && ", "}
              <CodeLink code={option} courses={courses} onSelect={onSelect} />
            </span>
          ))}
        </li>
      ))}
    </ul>
  );

  return (
    <section
      data-testid="course-detail"
      className="flex flex-col gap-3 rounded-md bg-neutral1 dark:bg-gray-600 dark:text-gray-50 p-4"
    >
      <h3 className="text-xl font-medium">
        <span data-testid="detail-code">{code}</span>
        <span>: {course.name}</span>
      </h3>
      <CoursePills code={code} course={course} />
      <p className="text-sm">
        {status.kind === "onGrid"
          ? `✓ ${statusText}`
          : `Not on your grid · ${statusText}`}
        {course.onlyF && " · Fall term only"}
        {course.onlyS && " · Winter term only"}
      </p>
      {status.kind === "canTake" && (
        <div className="flex items-center gap-3">
          {openTerms.length > 1 && (
            <select
              aria-label="Term to add to"
              value={term}
              onChange={(e) => setPickedTerm(e.target.value)}
              className="rounded border border-neutral3 px-1 py-1 text-sm text-black"
            >
              {openTerms.map((t) => (
                <option key={t} value={t}>
                  {t}
                  {isOverload(t) ? " (overload)" : ""}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            disabled={!term}
            onClick={() => {
              const pos = addToGrid(code, term);
              setAdded(pos ? `Added to ${pos}` : "No valid slots left");
            }}
            className="rounded bg-green3 px-3 py-1 text-sm font-medium text-white hover:bg-green4 disabled:opacity-50"
          >
            {term
              ? `Add to ${term}${isOverload(term) ? " (overload)" : ""}`
              : "No free slots"}
          </button>
          {added && (
            <span role="status" className="text-sm">
              {added}
            </span>
          )}
        </div>
      )}
      {preqs.length > 0 && (
        <Section title="Prerequisites">{renderList(preqs)}</Section>
      )}
      {coreqs.length > 0 && (
        <Section title="Corequisites">{renderList(coreqs)}</Section>
      )}
      {!requirements.length && (
        <p className="text-sm italic">No prerequisites or corequisites</p>
      )}
      <Section title="Unlocks">
        {unlocked.length ? (
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {unlocked.map((u) => (
              <li key={`${u.code}-${u.kind}`}>
                <CodeLink code={u.code} courses={courses} onSelect={onSelect} />
                {u.kind === "coreq" && (
                  <span className="text-xs"> (coreq)</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic">Not a prerequisite of any course</p>
        )}
      </Section>
    </section>
  );
};

export default CourseDetail;

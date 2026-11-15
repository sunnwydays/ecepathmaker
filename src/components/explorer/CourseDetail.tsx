import { FC, ReactNode } from "react";
import { CourseList, CoursesOnGrid, CoursesUsed } from "../../types/types";
import { coreCourses } from "../../data/coreCourses";
import { describeStatus, getCourseStatus } from "../../utils/courseStatus";
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

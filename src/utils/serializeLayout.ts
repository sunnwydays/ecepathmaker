import { CourseList, CoursesOnGrid, GridPositionBase } from "../types/types";

const serializeReqs = (label: string, reqs?: (string | string[])[]) => {
  if (!reqs?.length) return "";
  const parts = reqs.map((r) => (Array.isArray(r) ? r.join("|") : r));
  return label + parts.join(",");
};

const TERMS = ["3F", "3S", "4F", "4S", "XX"];
const SLOTS = 5;

const serializeCourse = (code: string, course: CourseList[string]): string => {
  let str = code + course.name + "%%";
  if (course.streams) str += course.streams.join("");
  if (course.kernel) str += "k";
  if (course.onlyF) str += "f";
  else if (course.onlyS) str += "s";
  if (course.isHSS) str += "h";
  else if (course.isCS) str += "c";
  if (course.isSciMath) str += "m";
  if (course.isArtSci) str += "a";
  if (course.color) str += "#" + course.color;

  const hasPreq = course.preq?.length;
  const hasCoreq = course.coreq?.length;
  if (hasPreq) str += serializeReqs("p", course.preq);
  if (hasCoreq) str += serializeReqs(hasPreq ? "o" : "po", course.coreq);
  return str;
};

export const serializeLayout = (
  coursesOnGrid: CoursesOnGrid,
  courses: CourseList,
): string =>
  TERMS.map((term) => {
    const slots = Array.from({ length: SLOTS }, (_, i) => {
      const code = coursesOnGrid[`${term}.${i + 1}` as GridPositionBase];
      const course = code ? courses[code] : undefined;
      return course ? serializeCourse(code, course) : "";
    });
    // Keep empty slots before the last course so positions survive a reload
    const last = slots.map((s) => s !== "").lastIndexOf(true);
    return slots
      .slice(0, last + 1)
      .map((s, i) => (i === SLOTS - 1 ? s : s + "$$"))
      .join("");
  }).join("@@");

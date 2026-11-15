import { CourseList, CoursesOnGrid, GridPositionBase } from "../types/types";
import { emptyGrid } from "./emptyGrid";

const serializeReqs = (label: string, reqs?: (string | string[])[]) => {
  if (!reqs?.length) return "";
  const parts = reqs.map((r) => (Array.isArray(r) ? r.join("|") : r));
  return label + parts.join(",");
};

export const serializeLayout = (
  coursesOnGrid: CoursesOnGrid,
  courses: CourseList,
): string => {
  let newStr = "";
  Object.keys(emptyGrid).map((slot) => {
    const courseCode: string = coursesOnGrid[slot as GridPositionBase];
    if (slot !== "3F.1" && slot.includes(".1")) newStr += "@@";
    if (!courseCode) return;
    const course = courses[courseCode];
    if (!course) return;
    newStr += courseCode + course.name + "%%";
    if (course.streams) newStr += course.streams.join("");
    if (course.kernel) newStr += "k";
    if (course.onlyF) newStr += "f";
    else if (course.onlyS) newStr += "s";
    if (course.isHSS) newStr += "h";
    else if (course.isCS) newStr += "c";
    if (course.isSciMath) newStr += "m";
    if (course.isArtSci) newStr += "a";
    if (course.color) newStr += "#" + course.color;

    const hasPreq = course.preq?.length;
    const hasCoreq = course.coreq?.length;
    if (hasPreq) newStr += serializeReqs("p", course.preq);
    if (hasCoreq) newStr += serializeReqs(hasPreq ? "o" : "po", course.coreq);

    if (slot[3] != "5") newStr += "$$";
  });
  return newStr;
};

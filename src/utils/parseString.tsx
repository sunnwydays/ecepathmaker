import {
  CourseList,
  CourseCardPropsWithoutCode,
  CoursesOnGrid,
  CoursesUsed,
  ParseString,
  GridPosition,
  GridPositionBase,
} from "../types/types";
import { validateCourseCode, validateCourseName } from "./validateCourse";

export const isValidString = (str: string): boolean => {
  str = str.trim();
  // Check empty string
  if (!str) return true;

  // Split into terms
  const terms = str.split("@@");
  if (terms.length > 5) return false;

  const validOptionChars = new Set([
    "f",
    "s",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "k",
    "c",
    "h",
    "m",
    "a",
  ]);

  return terms.every((term) => {
    // Check each term
    const courses = term.split("$$");
    if (courses.length > 5) return false;

    return courses.every((course) => {
      if (!course) return true; // Empty slots are allowed

      // Check course format
      const parts = course.split("%%");

      // No options or prerequisites
      if (parts.length === 1) {
        const [codeAndName] = parts;
        if (
          codeAndName.length < 6 ||
          !validateCourseCode(codeAndName.substring(0, 6)) ||
          !validateCourseName(codeAndName.substring(6))
        )
          return false;
        return true;
      }
      if (parts.length !== 2) return false;

      const [codeAndName, optionsWithPreq] = parts;
      if (
        codeAndName.length < 6 ||
        !validateCourseCode(codeAndName.substring(0, 6)) ||
        !validateCourseName(codeAndName.substring(6))
      )
        return false;

      if (!optionsWithPreq) return true;

      const [options, preq] = optionsWithPreq.split("p");

      // Validate options
      for (let i = 0; i < options.length; i++) {
        const char = options[i];
        if (!validOptionChars.has(char)) {
          if (char !== "#") return false;
          i += 6;
        }
      }

      // Validate preq
      if (preq) {
        const prereqs = preq
          .split(",")
          .flatMap((p) => p.split("|").map((p) => p.trim()));
        prereqs.forEach((prereq) => {
          return prereq.length === 6;
        });
      }
      return true;
    });
  });
};

export const parseString = (str: string): ParseString => {
  str = str.trim();
  const terms = str.split("@@");
  const courses: CourseList = {};
  const coursesOnGrid: CoursesOnGrid = {
    "3F.1": "",
    "3F.2": "",
    "3F.3": "",
    "3F.4": "",
    "3F.5": "",
    "3S.1": "",
    "3S.2": "",
    "3S.3": "",
    "3S.4": "",
    "3S.5": "",
    "4F.1": "",
    "4F.2": "",
    "4F.3": "",
    "4F.4": "",
    "4F.5": "",
    "4S.1": "",
    "4S.2": "",
    "4S.3": "",
    "4S.4": "",
    "4S.5": "",
    "XX.1": "",
    "XX.2": "",
    "XX.3": "",
    "XX.4": "",
    "XX.5": "",
  };
  const coursesUsed: CoursesUsed = {};

  const termMap: { [key: number]: string } = {
    0: "3F",
    1: "3S",
    2: "4F",
    3: "4S",
    4: "XX",
  };

  terms.forEach((term, termIndex) => {
    const coursesInTerm = term.split("$$");
    coursesInTerm.forEach((courseStr, slotIndex) => {
      if (!courseStr) return;

      const [codeAndName, optionsWithPreq] = courseStr.split("%%");
      const code = codeAndName.substring(0, 6);
      const name = codeAndName.substring(6);

      const course: CourseCardPropsWithoutCode = {
        name,
        preq: [],
        color: "",
        streams: [],
        isCS: false,
        isHSS: false,
        isArtSci: false,
      };

      if (optionsWithPreq) {
        const [options, preq] = optionsWithPreq.split("p");

        // Parse options
        if (options)
          for (let i = 0; i < options.length; i++) {
            switch (options[i]) {
              case "f":
                course.onlyF = true;
                break;
              case "s":
                course.onlyS = true;
                break;
              case "1":
                course.streams?.push(1);
                break;
              case "2":
                course.streams?.push(2);
                break;
              case "3":
                course.streams?.push(3);
                break;
              case "4":
                course.streams?.push(4);
                break;
              case "5":
                course.streams?.push(5);
                break;
              case "6":
                course.streams?.push(6);
                break;
              case "k":
                course.kernel = true;
                break;
              case "c":
                course.isCS = true;
                break;
              case "h":
                course.isHSS = true;
                course.isCS = true;
                break;
              case "m":
                course.isSciMath = true;
                break;
              case "a":
                course.isArtSci = true;
                break;
              case "#": {
                course.color = options.substring(i + 1, i + 7);
                i += 6;
                break;
              }
            }
          }

        // Parse prerequisites
        if (preq) {
          const andPrereqs = preq.split(",").map((andGroup) => {
            // For each AND group, check if it has OR conditions
            if (andGroup.includes("|")) {
              return andGroup.split("|").map((p) => p.trim().toUpperCase());
            }
            return andGroup.trim();
          });
          course.preq = andPrereqs;
        }
      }

      courses[code] = course;
      const position = `${termMap[termIndex]}.${slotIndex + 1}` as GridPosition;
      coursesOnGrid[position as GridPositionBase] = code;
      coursesUsed[code] = position;
    });
  });

  return { courses, coursesOnGrid, coursesUsed };
};

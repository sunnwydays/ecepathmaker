import { ValidYearTermsProps, ValidYearTerms, YearTerm } from "../types/types";
import { withoutCoreCourses } from "../data/coreCourses";
import { getNextYearTerm, getPrevYearTerm, getYearTerm } from "./getYearTerm";

export const getValidYearTerms = ({
  coursesOnGrid,
  coursesUsed,
  course,
}: ValidYearTermsProps): ValidYearTerms => {
  const validYearTerms = {
    "3F": true,
    "3S": true,
    "4F": true,
    "4S": true,
    XX: true,
  };

  if (course.onlyF) {
    validYearTerms["3S"] = false;
    validYearTerms["4S"] = false;
  } else if (course.onlyS) {
    validYearTerms["3F"] = false;
    validYearTerms["4F"] = false;
  }

  // first- and second-year courses are assumed taken
  const preqs = withoutCoreCourses(course.preq);
  const coreqs = withoutCoreCourses(course.coreq);

  if (!preqs.length && !coreqs.length) return validYearTerms;

  const ALL_FALSE: ValidYearTerms = {
    "3F": false,
    "3S": false,
    "4F": false,
    "4S": false,
    XX: true,
  } as const;

  const gridCourses = Object.values(coursesOnGrid).filter(
    (code) => code !== ""
  );
  
  let latestYearTerm = "";

  if (coreqs.length) {
    // check AND coreqs
    for (const coreq of coreqs) {
      if (Array.isArray(coreq)) {
        if (!coreq.some((p) => gridCourses.includes(p))) {
          return ALL_FALSE;
        }
      } else {
        if (!gridCourses.includes(coreq)) {
          return ALL_FALSE;
        }
      }
    }

    // locate the latest coreq course on the grid 
    for (const coreq of coreqs) {
      if (Array.isArray(coreq)) {
        // earliest of the OR coreqs
        let earliestYearTerm = "";
        for (const c of coreq) {
          if (gridCourses.includes(c)) {
            const cYearTerm = getYearTerm(coursesUsed[c]);
            if (cYearTerm == "XX") {
              earliestYearTerm = "";
              break;
            }
            if (earliestYearTerm === "" || cYearTerm < earliestYearTerm) {
              earliestYearTerm = cYearTerm;
            }
          }
        }
        if (latestYearTerm < earliestYearTerm) {
          latestYearTerm = earliestYearTerm;
        }
      } else {
        if (gridCourses.includes(coreq)) {
          const cYearTerm = getYearTerm(coursesUsed[coreq]);
          if (latestYearTerm < cYearTerm && cYearTerm !== "XX") {
            latestYearTerm = cYearTerm;
          }
        }
      }
    }

    // you can take the course in the same term as the latest coreq
    latestYearTerm = getPrevYearTerm(latestYearTerm as YearTerm);
  }

  if (preqs.length) {
    // check AND prereqs
    for (const preq of preqs) {
      if (Array.isArray(preq)) {
        if (!preq.some((p) => gridCourses.includes(p))) {
          return ALL_FALSE;
        }
      } else {
        if (!gridCourses.includes(preq)) {
          return ALL_FALSE;
        }
      }
    }

    // locate the latest preq course on the grid
    for (const preq of preqs) {
      if (Array.isArray(preq)) {
        // earliest of the OR prereqs
        let earliestYearTerm = "";
        for (const p of preq) {
          if (gridCourses.includes(p)) {
            const pYearTerm = getYearTerm(coursesUsed[p]);
            if (pYearTerm == "XX") {
              earliestYearTerm = "";
              break;
            }
            if (earliestYearTerm === "" || pYearTerm < earliestYearTerm) {
              earliestYearTerm = pYearTerm;
            }
          }
        }
        if (latestYearTerm < earliestYearTerm) {
          latestYearTerm = earliestYearTerm;
        }
      } else {
        if (gridCourses.includes(preq)) {
          const pYearTerm = getYearTerm(coursesUsed[preq]);
          if (latestYearTerm < pYearTerm && pYearTerm !== "XX") {
            latestYearTerm = pYearTerm;
          }
        }
      }
    }

  }
  // you must take the course after the latest preq
  // in case of coreq, this has been handled above
  latestYearTerm = getNextYearTerm(latestYearTerm as YearTerm);

  if (latestYearTerm === "") return validYearTerms;

  for (const yearTerm of Object.keys(validYearTerms)) {
    if (yearTerm === latestYearTerm) break;
    validYearTerms[yearTerm as keyof ValidYearTerms] = false;
  }

  return validYearTerms;
};
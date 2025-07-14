import { ValidYearTermsProps, ValidYearTerms, YearTerm } from "../types/types";
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

  const ALL_FALSE: ValidYearTerms = {
    "3F": false,
    "3S": false,
    "4F": false,
    "4S": false,
    XX: true,
  } as const;

  if (course.onlyF) {
    validYearTerms["3S"] = false;
    validYearTerms["4S"] = false;
  } else if (course.onlyS) {
    validYearTerms["3F"] = false;
    validYearTerms["4F"] = false;
  }
  if (!course.preq?.length && !course.coreq?.length) return validYearTerms;
  
  const gridCourses = Object.values(coursesOnGrid).filter(
    (code) => code !== ""
  );
  
  console.log("Valid year terms:", validYearTerms);
  let latestYearTerm = "";

  if (course.coreq?.length) {
    // check AND coreqs
    for (const coreq of course.coreq) {
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
    for (const coreq of course.coreq) {
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

  if (course.preq?.length) {
    // check AND prereqs
    for (const preq of course.preq) {
      if (Array.isArray(preq)) {
        if (!preq.some((p) => gridCourses.includes(p))) {
          return ALL_FALSE;
        }
      } else {
        if (!gridCourses.includes(preq)) {
          console.log(gridCourses, preq);
          console.log("Valid year termseee:", validYearTerms);
          return ALL_FALSE;
        }
      }
    }

    // locate the latest preq course on the grid
    for (const preq of course.preq) {
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
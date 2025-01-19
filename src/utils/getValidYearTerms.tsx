import { ValidYearTermsProps, ValidYearTerms } from "../types/CourseTypes";
import { getYearTerm } from "./getYearTerm";

export const getValidYearTerms = ({
    coursesOnGrid,
    coursesUsed,
    course,
}: ValidYearTermsProps): ValidYearTerms => {

    const validYearTerms = {
        '3F': true,
        '3S': true,
        '4F': true,
        '4S': true,
        'XX': true,
    } as ValidYearTerms;

    const ALL_FALSE = {
        '3F': false,
        '3S': false,
        '4F': false,
        '4S': false,
        'XX': true,
    } as const;
    

    if (course.onlyF) {
        validYearTerms['3S'] = false;
        validYearTerms['4S'] = false;
    } else if (course.onlyS) {
        validYearTerms['3F'] = false;
        validYearTerms['4F'] = false;
    }
    if (!course.preq?.length) return validYearTerms;

    const gridCourses = Object.values(coursesOnGrid).filter(code => code !== '');
    
    // check AND prereqs
    for (const preq of course.preq) {
        if (Array.isArray(preq)) {
            if (!preq.some(p => gridCourses.includes(p))) {
                return ALL_FALSE as ValidYearTerms;
            }
        } else {
            if (!gridCourses.includes(preq)) {
                return ALL_FALSE as ValidYearTerms;
            }
        }
    }

    // locate the latest preq course on the grid
    let latestYearTerm = '';
    for (const preq of course.preq) {
        if (Array.isArray(preq)) {
            // earliest of the OR prereqs
            let earliestYearTerm = '';
            for (const p of preq) {
                if (gridCourses.includes(p)) {
                    const pYearTerm = getYearTerm(coursesUsed[p]);
                    if (earliestYearTerm === '' || pYearTerm < earliestYearTerm) {
                        earliestYearTerm = pYearTerm;
                    }
                }
            }
            if (latestYearTerm < earliestYearTerm && earliestYearTerm !== 'XX') {
                latestYearTerm = earliestYearTerm;
            }
        } else {
            if (gridCourses.includes(preq)) {
                const pYearTerm = getYearTerm(coursesUsed[preq]);
                if (pYearTerm > latestYearTerm && pYearTerm !== 'XX') {
                    latestYearTerm = pYearTerm;
                }
            }
        }
    }

    if (latestYearTerm === '') return ALL_FALSE as ValidYearTerms;

    // get next year term
    const nextYearTerm = latestYearTerm[1] === 'F' ? `${latestYearTerm[0]}S` : latestYearTerm[0] === '3' ? '4F' : null ;
    if (!nextYearTerm) return ALL_FALSE as ValidYearTerms;
    
    for (const yearTerm of Object.keys(validYearTerms)) {
        if (yearTerm === nextYearTerm) break;
        validYearTerms[yearTerm as keyof ValidYearTerms] = false;
    }

    return validYearTerms;
}


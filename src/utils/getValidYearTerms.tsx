import { ValidYearTermsProps, ValidYearTerms, GridPosition } from "../types/CourseTypes";
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


    if (course.onlyF) {
        validYearTerms['3S'] = false;
        validYearTerms['4S'] = false;
    } else if (course.onlyS) {
        validYearTerms['3F'] = false;
        validYearTerms['4F'] = false;
    }
    if (!course.preq?.length) return validYearTerms;

    const gridCourses = Object.values(coursesOnGrid).filter(code => code !== '');
    // locate the latest preq course on the grid
    let latestYearTerm = '';
    for (const preq of course.preq) {
        if (Array.isArray(preq)) {
            // earliest of the OR prereqs
            let earliestYearTerm = '';
            for (const p of preq) {
                if (gridCourses.includes(p)) {
                    const pYearTerm = getYearTerm(coursesUsed[p] as GridPosition);
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
                const pYearTerm = getYearTerm(coursesUsed[preq] as GridPosition);
                if (pYearTerm > latestYearTerm && pYearTerm !== 'XX') {
                    latestYearTerm = pYearTerm;
                }
            }
        }
    }

    const setAllFalse = () => {
        validYearTerms['3F'] = false;
        validYearTerms['3S'] = false;
        validYearTerms['4F'] = false;
        validYearTerms['4S'] = false;
    }

    if (latestYearTerm === '') {
        setAllFalse();
        return validYearTerms;
    }

    // get next year term
    const nextYearTerm = latestYearTerm[1] === 'F' ? `${latestYearTerm[0]}S` : latestYearTerm[0] === '3' ? '4F' : null ;
    if (!nextYearTerm) {
        setAllFalse();
        return validYearTerms;
    }
    
    for (const yearTerm of Object.keys(validYearTerms)) {
        if (yearTerm === nextYearTerm) break;
        validYearTerms[yearTerm as keyof ValidYearTerms] = false;
    }

    return validYearTerms;
}


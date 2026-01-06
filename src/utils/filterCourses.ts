import { CourseCardPropsWithoutCode, FilterState } from "../types/types";

export const filterCourses = (filters: FilterState, courseCode: string, course: CourseCardPropsWithoutCode,): boolean => {
    if (!course) return false;

    if (
        filters.searchTerm &&
        !courseCode.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !course.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
    ) {
        return false;
    }

    if (
        filters.streams.length > 0 &&
        !course.streams?.some((stream) => filters.streams.includes(stream))
    ) {
        return false;
    }

    if (!filters.availableF && course.onlyF) return false;
    if (!filters.availableS && course.onlyS) return false;

    if (filters.isCS && !course.isCS) return false;
    if (filters.isHSS && !course.isHSS) return false;
    if (filters.isSciMath && !course.isSciMath) return false;
    if (filters.isArtSci && !course.isArtSci) return false;
    if (filters.isEng && course.isArtSci) return false;

    return true;
};
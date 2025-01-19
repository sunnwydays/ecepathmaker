import { GridPosition, YearTerm } from "../types/CourseTypes";

export const getYearTerm = (pos: GridPosition): YearTerm => {
    return pos.split('.')[0] as YearTerm;
}
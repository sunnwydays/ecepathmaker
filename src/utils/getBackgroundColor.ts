import { getMembership } from "../requirements/evaluate";
import { Curriculum } from "../requirements/types";
import { CourseCardPropsWithoutCode } from "../types/types";

// Group colours are based on ECE Iris and live in the curriculum
export const getGroupColor = (
    curriculum: Curriculum,
    code: string,
    course: CourseCardPropsWithoutCode,
): string | undefined => {
    const [first] = getMembership(curriculum, code, course).groups;
    return curriculum.groups.find((g) => g.id === first)?.color;
};

const sciMathColor = "#f36aba";
const hssColor = "#d4a5a5";
const csColor = "#a89c64";
const defaultColor = "#e0e0e0";

export const getBackgroundColor = (
    color: string | undefined, 
    groupColor?: string | undefined, 
    isSciMath?: boolean | undefined,
    isCS?: boolean | undefined,
    isHSS?: boolean | undefined,
): string => {
    if (color) return color.startsWith('#') ? color : `#${color}`;
    if (groupColor) return groupColor;
    if (isSciMath) return sciMathColor;
    if (isHSS) return hssColor;
    if (isCS) return csColor;
    return defaultColor;
};
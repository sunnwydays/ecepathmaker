export interface CourseIdentifier {
    code: string;
    name: string;
    preq?: string[];
    color?: string;
    streams?: number[];
};

export interface ValidTermAvailability {
    onlyF?: boolean;
    onlyS?: boolean;
};

export interface ValidCourseTypeFlags {
    isCS?: boolean;
    isHSS?: boolean;
    isArtSci?: boolean;
};

export type CourseCardProps = 
    CourseIdentifier & 
    ValidTermAvailability &
    ValidCourseTypeFlags;

export interface DraggableCardProps extends CourseCardProps {
    id: string;
};

interface CourseIdentifierWithoutCode {
    name: string;
    preq?: string[];
    color?: string;
    streams?: number[];
};

type CourseCardPropsWithoutCode = 
    CourseIdentifierWithoutCode & 
    ValidTermAvailability &
    ValidCourseTypeFlags;

export type CourseList = {
    [code: string]: CourseCardPropsWithoutCode;
}
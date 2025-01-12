interface CourseIdentifier {
    code: string;
    name: string;
    preq?: string[];
    color?: string;
    streams?: number[];
};

interface ValidTermAvailability {
    onlyF?: boolean;
    onlyS?: boolean;
};

interface ValidCourseTypeFlags {
    isCS?: boolean;
    isHSS?: boolean;
    isArtSci?: boolean;
};

type CourseCardProps = 
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

export interface StreamRequirements {
    streamCounts: Record<number, number>;
    breadthStreams: number[];
    depthStreams: number[];
    hasBreadth: boolean;
    hasDepth: boolean;
    hasCS: boolean;
    hasHSS: boolean;
};
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

export type CourseCardPropsWithoutCode = 
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

type GridPosition = 
    | '3F.1' | '3F.2' | '3F.3' | '3F.4' | '3F.5'
    | '3S.1' | '3S.2' | '3S.3' | '3S.4' | '3S.5'
    | '4F.1' | '4F.2' | '4F.3' | '4F.4' | '4F.5'
    | '4S.1' | '4S.2' | '4S.3' | '4S.4' | '4S.5'
    | 'XX.1' | 'XX.2' | 'XX.3' | 'XX.4' | 'XX.5';

export type CoursesOnGrid = Record<GridPosition, string>;
export type CoursesUsed = Record<string, string>;

export interface CourseGridProps {
    courses: CourseList;
    coursesUsed: CoursesUsed;
    setCoursesUsed?: React.Dispatch<React.SetStateAction<CoursesUsed>>;
    coursesOnGrid: CoursesOnGrid;
    setCoursesOnGrid?: React.Dispatch<React.SetStateAction<CoursesOnGrid>>;
}
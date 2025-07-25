import { UniqueIdentifier } from "@dnd-kit/core";

interface CourseIdentifier {
    code: string;
    name: string;
    preq?: (string | string[])[];
    coreq?: (string | string[])[];
    color?: string;
    streams?: number[];
    kernel?: boolean;
};

interface ValidTermAvailability {
    onlyF?: boolean;
    onlyS?: boolean;
};

interface ValidCourseTypeFlags {
    isCS?: boolean;
    isHSS?: boolean;
    isArtSci?: boolean;
    isSciMath?: boolean;
};

export type CourseCardProps = 
    CourseIdentifier & 
    ValidTermAvailability &
    ValidCourseTypeFlags;

export interface DraggableCardProps extends CourseCardProps {
    id: string;
};

export interface MakerCardProps extends DraggableCardProps {
    valid: boolean;
    setCustomInfo: React.Dispatch<React.SetStateAction<CourseCardProps>>;
    setPreqString: React.Dispatch<React.SetStateAction<string>>;
    setCoreqString: React.Dispatch<React.SetStateAction<string>>;
};

interface CourseIdentifierWithoutCode {
    name: string;
    preq?: (string | string[])[];
    coreq?: (string | string[])[];
    color?: string;
    streams?: number[];
    kernel?: boolean;
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
    hasSciMath: boolean;
    hasEconomics: boolean;
    hasCapstone: boolean;
    ceOrEE: string | null;
};

export type YearTerm = 
    | '3F' | '3S' | '4F' | '4S' | 'XX';

export type GridPositionBase = 
| '3F.1' | '3F.2' | '3F.3' | '3F.4' | '3F.5'
| '3S.1' | '3S.2' | '3S.3' | '3S.4' | '3S.5'
| '4F.1' | '4F.2' | '4F.3' | '4F.4' | '4F.5'
| '4S.1' | '4S.2' | '4S.3' | '4S.4' | '4S.5'
| 'XX.1' | 'XX.2' | 'XX.3' | 'XX.4' | 'XX.5';

export type GridPosition = GridPositionBase | '';

export type CoursesOnGrid = Record<GridPositionBase, string>;
export type CoursesUsed = Record<string, GridPosition>;
export type ValidYearTerms = Record<YearTerm, boolean>
export type addDependenciesProps = {
    code: UniqueIdentifier;
    courses: CourseList;
    dependencies: Map<UniqueIdentifier, Set<UniqueIdentifier>>;
    setDependencies?: React.Dispatch<React.SetStateAction<Map<UniqueIdentifier, Set<UniqueIdentifier>>>>;
}
export type savedLayout = {
  name: string;
  str: string;
};

export interface ValidYearTermsProps {
    coursesOnGrid: CoursesOnGrid;
    coursesUsed: CoursesUsed;
    course: CourseCardPropsWithoutCode;
}

export interface fulfillsCoreqProps {
    coursesOnGrid: CoursesOnGrid;
    coursesUsed: CoursesUsed;
    code: string;
}

export interface CourseGridProps {
    courses: CourseList;
    coursesUsed: CoursesUsed;
    coursesOnGrid: CoursesOnGrid;
    dependencies: Map<UniqueIdentifier, Set<UniqueIdentifier>>;
    setCoursesUsed: React.Dispatch<React.SetStateAction<CoursesUsed>>;
    setCoursesOnGrid: React.Dispatch<React.SetStateAction<CoursesOnGrid>>;
    setCustomInfo: React.Dispatch<React.SetStateAction<CourseCardProps>>;
    setPreqString: React.Dispatch<React.SetStateAction<string>>;
    setCoreqString: React.Dispatch<React.SetStateAction<string>>;
    setDependencies: React.Dispatch<React.SetStateAction<Map<UniqueIdentifier, Set<UniqueIdentifier>>>>;
}

export interface ParseString {
    courses: CourseList;
    coursesOnGrid: CoursesOnGrid;
    coursesUsed: CoursesUsed;
    dependencies: Map<UniqueIdentifier, Set<UniqueIdentifier>>;
}

export interface LoadLayoutProps {
    courses: CourseList;
    coursesUsed: CoursesUsed;
    setCourses: React.Dispatch<React.SetStateAction<CourseList>>;
    setCoursesUsed: React.Dispatch<React.SetStateAction<CoursesUsed>>;
    setCoursesOnGrid: React.Dispatch<React.SetStateAction<CoursesOnGrid>>;
    setDependencies: React.Dispatch<React.SetStateAction<Map<UniqueIdentifier, Set<UniqueIdentifier>>>>;
    savedLayouts: savedLayout[];
}

export interface SaveLayoutProps {
    courses: CourseList;
    coursesOnGrid: CoursesOnGrid;
    savedLayouts: savedLayout[];
    setSavedLayouts: React.Dispatch<React.SetStateAction<savedLayout[]>>;
}

export interface PresetProps {
    name: string;
    index: number;
    clicked?: boolean;
    loadPreset: (index: number) => void;
}

export interface TextInputProps {
  name: string;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  testId?: string;
  minWidth?: string;
}

export interface CourseFormProps {
    setCourses: React.Dispatch<React.SetStateAction<CourseList>>;
    setCoursesUsed: React.Dispatch<React.SetStateAction<CoursesUsed>>;
    customInfo: CourseCardProps;
    setCustomInfo: React.Dispatch<React.SetStateAction<CourseCardProps>>;
    preqString: string;
    setPreqString: React.Dispatch<React.SetStateAction<string>>;
    coreqString: string;
    setCoreqString: React.Dispatch<React.SetStateAction<string>>;
}

export interface FilterState {
    searchTerm: string;
    streams: number[];
    availableF: boolean;
    availableS: boolean;
    isCS: boolean;
    isHSS: boolean;
    isSciMath: boolean;
    isArtSci: boolean;
    isEng: boolean;
};
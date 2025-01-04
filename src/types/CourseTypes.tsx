export interface CourseIdentifier {
    code: string;
    name: string;
    preq: string[];
    color?: string;
};

export interface StreamFlags {
    stream1?: boolean;
    stream2?: boolean;
    stream3?: boolean;
    stream4?: boolean;
    stream5?: boolean;
    stream6?: boolean;
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
    StreamFlags &
    ValidTermAvailability &
    ValidCourseTypeFlags;
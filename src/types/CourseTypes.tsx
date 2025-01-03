export interface CourseIdentifier {
    code: string;
    name: string;
    preq: string[];
    color?: string;
}

export interface StreamFlags {
    stream1?: boolean;
    stream2?: boolean;
    stream3?: boolean;
    stream4?: boolean;
    stream5?: boolean;
    stream6?: boolean;
}

type ValidStreamKernels = 
    {stream1Kernel?: true;} |
    {stream2Kernel?: true;} |
    {stream3Kernel?: true;} |
    {stream4Kernel?: true;} |
    {stream5Kernel?: true;} |
    {stream6Kernel?: true;};

type ValidTermAvailability = {
    onlyF?: boolean;
    onlyS?: boolean;
} & {
    onlyF?: true;
    onlyS?: false;
} | {
    onlyF?: false;
    onlyS?: true;
} | {
    onlyF?: false;
    onlyS?: false;
};

type ValidCourseTypeFlags = {
    isCS?: boolean;
    isHSS?: boolean;
    isArtSci?: boolean;
} & (
    | { isCS: true; isHSS?: boolean }
    | { isCS?: false; isHSS?: false }
);

export type CourseCardProps = 
    CourseIdentifier & 
    Partial<StreamFlags> &
    ValidStreamKernels &
    ValidTermAvailability &
    ValidCourseTypeFlags;
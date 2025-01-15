import { CourseList, CourseCardPropsWithoutCode, CoursesOnGrid, CoursesUsed, ParseString, GridPosition } from "../types/CourseTypes";

export const isValidString = (str: string): boolean => {
    // Check empty string
    if (!str) return true;

    // Split into terms
    const terms = str.split('@@');
    if (terms.length > 5) return false;

    const validOptionChars = new Set(['f', 's', '1', '2', '3', '4', '5', '6', 'c', 'h', 'a']);

    return terms.every(term => {
        // Check each term
        const courses = term.split('$$');
        if (courses.length > 5) return false;

        return courses.every(course => {
            if (!course) return true; // Empty slots are allowed

            // Check course format
            const parts = course.split('**');
            if (parts.length !== 2) return false;

            const [codeAndName, options] = parts;
            if (codeAndName.length < 6) return false;

            // Validate options
            for (let i = 0; i < options.length; i++) {
                const char = options[i];
                if (!validOptionChars.has(char)) {
                    if (char !== 'p' && char !== '#') return false;
                    // Skip next 6 characters for preq codes and colors
                    i += 6;
                }
            }
            return true;

        });
    });
};

export const parseString = (str: string): ParseString => {
    const terms = str.split('@@');
    const courses:CourseList = {};
    const coursesOnGrid:CoursesOnGrid= {
        '3F.1': '', '3F.2': '', '3F.3': '', '3F.4': '', '3F.5': '',
        '3S.1': '', '3S.2': '', '3S.3': '', '3S.4': '', '3S.5': '',
        '4F.1': '', '4F.2': '', '4F.3': '', '4F.4': '', '4F.5': '',
        '4S.1': '', '4S.2': '', '4S.3': '', '4S.4': '', '4S.5': '',
        'XX.1': '', 'XX.2': '', 'XX.3': '', 'XX.4': '', 'XX.5': '',
    };
    const coursesUsed:CoursesUsed = {};

    const termMap: { [key: number]: string } = {
        0: '3F',
        1: '3S',
        2: '4F',
        3: '4S',
        4: 'XX'
    };

    terms.forEach((term, termIndex) => {
        const coursesInTerm = term.split('$$');
        coursesInTerm.forEach((courseStr, slotIndex) => {
            if (!courseStr) return;

            const [codeAndName, options] = courseStr.split('**');
            const code = codeAndName.substring(0, 6);
            const name = codeAndName.substring(6);

            const course: CourseCardPropsWithoutCode = {
                name,
                preq: [],
                color: '',
                streams: [],
                isCS: false,
                isHSS: false,
                isArtSci: false
            };

            // Parse options
            for (let i = 0; i < options.length; i++) {
                switch(options[i]) {
                    case 'f': course.onlyF = true; break;
                    case 's': course.onlyS = true; break;
                    case '1': course.streams?.push(1); break;
                    case '2': course.streams?.push(2); break;
                    case '3': course.streams?.push(3); break;
                    case '4': course.streams?.push(4); break;
                    case '5': course.streams?.push(5); break;
                    case '6': course.streams?.push(6); break;
                    case 'c': course.isCS = true; break;
                    case 'h': course.isHSS = true; course.isCS = true; break;
                    case 'a': course.isArtSci = true; break;
                    case 'p': {
                        course.preq?.push(options.substring(i + 1, i + 7));
                        i += 6;
                        break;
                    }
                    case '#': {
                        course.color = options.substring(i + 1, i + 7);
                        i += 6;
                        break;
                    }
                }
            }

            courses[code] = course;
            const position = `${termMap[termIndex]}.${slotIndex + 1}`;
            coursesOnGrid[position as GridPosition] = code;
            coursesUsed[code] = position;
        });
    });

    return { courses, coursesOnGrid, coursesUsed };
};
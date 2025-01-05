import { CourseCardProps } from "../types/CourseTypes";
import { GridPosition } from "../types/GridTypes";

interface SaveString {
    courses: CourseCardProps[];
    positions: Map<string, GridPosition>;
}

export const parseString = (str: string): SaveString => {
    const terms = str.split('@@');
    const courses:CourseCardProps[] = [];
    const positions = new Map<string, GridPosition>();

    terms.forEach((term, termIndex) => {
        const coursesInTerm = term.split('$$');
        coursesInTerm.forEach((courseStr, slotIndex) => {
            if (!courseStr) return;

            const [codeAndName, options] = courseStr.split('**');
            const code = codeAndName.substring(0, 6);
            const name = codeAndName.substring(6);

            const course: CourseCardProps = {
                code,
                name,
                preq: [],
                color: '',
                stream1: false,
                isCS: false,
                isHSS: false,
                isArtSci: false
            };

            // Parse options
            for (let i = 0; i < options.length; i++) {
                switch(options[i]) {
                    case 'f': course.onlyF = true; break;
                    case 's': course.onlyS = true; break;
                    case '1': course.stream1 = true; break;
                    case '2': course.stream2 = true; break;
                    case '3': course.stream3 = true; break;
                    case '4': course.stream4 = true; break;
                    case '5': course.stream5 = true; break;
                    case '6': course.stream6 = true; break;
                    case 'c': course.isCS = true; break;
                    case 'h': course.isHSS = true; course.isCS = true; break;
                    case 'a': course.isArtSci = true; break;
                    case 'p': {
                        course.preq.push(options.substring(i + 1, i + 7));
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

            courses.push(course);
            positions.set(code, {
                term: ['3F', '3S', '4F', '4S', 'XX'][termIndex],
                slot: slotIndex + 1
            });
        });
    });

    return { courses, positions };
};
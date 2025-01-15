import CourseGrid from '../components/CourseGrid';
import CourseForm from '../components/CourseForm';
import LoadLayout from '../components/LoadLayout';

import mockCourses from '../components/mockCourses';
import { useMemo, useState } from 'react';
import { CoursesOnGrid, CoursesUsed } from '../types/CourseTypes';

const Maker = () => {
    const [courses, setCourses] = useState(mockCourses);

    const initialCoursesUsed = useMemo<CoursesUsed>(() => {
        const posMap: CoursesUsed = {};
        Object.keys(courses).forEach(courseCode => posMap[courseCode] = '');
        return posMap;
    }, [courses]);
    
    const initialCoursesOnGrid = useMemo<CoursesOnGrid>(() => ({
        '3F.1': '', '3F.2': '', '3F.3': '', '3F.4': '', '3F.5': '',
        '3S.1': '', '3S.2': '', '3S.3': '', '3S.4': '', '3S.5': '',
        '4F.1': '', '4F.2': '', '4F.3': '', '4F.4': '', '4F.5': '',
        '4S.1': '', '4S.2': '', '4S.3': '', '4S.4': '', '4S.5': '',
        'XX.1': '', 'XX.2': '', 'XX.3': '', 'XX.4': '', 'XX.5': '',
    }) as CoursesOnGrid, []);
    
    const [coursesUsed, setCoursesUsed] = useState<CoursesUsed>(initialCoursesUsed);
    const [coursesOnGrid, setCoursesOnGrid] = useState<CoursesOnGrid>(initialCoursesOnGrid);
    
    return (
        <div>
            <CourseGrid 
                courses={courses}
                coursesUsed={coursesUsed} 
                coursesOnGrid={coursesOnGrid}
                setCoursesUsed={setCoursesUsed}
                setCoursesOnGrid={setCoursesOnGrid}
            />
            <div className="grid md:grid-cols-2 grid-cols-1 gap-8">
                <CourseForm />
                <LoadLayout 
                    courses={courses}
                    coursesUsed={coursesUsed} 
                    setCourses={setCourses}
                    setCoursesUsed={setCoursesUsed}
                    setCoursesOnGrid={setCoursesOnGrid}
                />
            </div>
        </div>
    )
}

export default Maker;
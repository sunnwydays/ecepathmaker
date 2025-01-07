import {DndContext, DragEndEvent } from '@dnd-kit/core';
import Droppable from '../components/Droppable';

import { FC, useState } from 'react';
import MakerCard from './MakerCard';
import { CourseList } from '../types/CourseTypes';

type courseUsedType = Record<string, boolean>;

const CourseGrid:FC<{courses: CourseList;}> = ({ courses }) => {
    const initializeIsCourseUsed = (courses: CourseList): courseUsedType => {
        const posMap: { [key: string]: boolean } = {};
        Object.keys(courses).map(courseCode => posMap[courseCode] = false);
        return posMap;
    };
    
    const [isCourseUsed, setIsCourseUsed] = useState<courseUsedType>(() => 
        initializeIsCourseUsed(courses)
    );

    const [coursesOnGrid, setCoursesOnGrid] = useState({
        '3F.1': '', '3F.2': '', '3F.3': '', '3F.4': '', '3F.5': '',
        '3S.1': '', '3S.2': '', '3S.3': '', '3S.4': '', '3S.5': '',
        '4F.1': '', '4F.2': '', '4F.3': '', '4F.4': '', '4F.5': '',
        '4S.1': '', '4S.2': '', '4S.3': '', '4S.4': '', '4S.5': '',
        'XX.1': '', 'XX.2': '', 'XX.3': '', 'XX.4': '', 'XX.5': '',
    });

    const handleDragEnd = (e:DragEndEvent) => {
        const {over} = e;

        // jest testing good for setting objectives
        // console logging very useful for debugging here along with dev tools
        if (over) {
            setCoursesOnGrid(prev => ({...prev, [over.id]: over.id}));
            console.log(over.id+". . "+e.active.id+"active");
            setIsCourseUsed({...isCourseUsed, [e.active.id]: true});

        } else {
            setCoursesOnGrid(prev => ({...prev, [e.active.id]: ''}));
            console.log(e.active.id+"inactive");
            setIsCourseUsed({...isCourseUsed, [e.active.id]: false});
        }
    }

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <section className="flex gap-8">
                <div className="grid grid-cols-5 gap-2">
                    {Object.entries(coursesOnGrid).map(([slot, courseCode]) => (
                        <Droppable key={slot} id={slot}>
                            {courseCode ? (
                                <MakerCard 
                                    id={courseCode}
                                    code={courseCode}
                                    {...courses[courseCode]}
                                />
                            ) : (
                                slot
                            )}
                        </Droppable>
                    ))}
                </div>
                <div>
                    {/* Courses to choose from */}
                    <h2 className="mb-8 text-xl font-medium">👈 Drag courses into the grid</h2>
                    <div className="grid xl:grid-cols-2 grid-cols-1">
                        {Object.entries(isCourseUsed)
                            .filter(([, isUsed]) => !isUsed)
                            .map(([courseCode]) => (
                                <MakerCard 
                                    key={courseCode}
                                    id={courseCode}
                                    code={courseCode}
                                    {...courses[courseCode]}
                                />
                            ))}
                    </div>
                </div>
            </section>
        </DndContext>
    );
};

export default CourseGrid;
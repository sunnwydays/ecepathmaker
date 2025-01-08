import {DndContext, DragEndEvent } from '@dnd-kit/core';
import Droppable from '../components/Droppable';

import { FC, useState } from 'react';
import MakerCard from './MakerCard';
import { CourseList } from '../types/CourseTypes';

type courseUsedType = Record<string, string>;

const CourseGrid:FC<{courses: CourseList;}> = ({ courses }) => {
    const initializeIsCourseUsed = (courses: CourseList): courseUsedType => {
        const posMap: { [key: string]: string } = {};
        Object.keys(courses).map(courseCode => posMap[courseCode] = '');
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
        const {over, active} = e;
        
        // jest testing good for setting objectives
        // console logging very useful for debugging here along with dev tools
        // also looking online for documentation, videos, and examples
        const sourceContainer = isCourseUsed[active.id];
        if (over) {
            if (sourceContainer === over.id) return;
            
            setCoursesOnGrid(prev => ({
                ...prev, 
                [over.id]: active.id, 
                ...(sourceContainer && { [sourceContainer]: '' })
            }));

            const courseAtDestination = coursesOnGrid[over.id as keyof typeof coursesOnGrid];

            // destination is empty
            if (courseAtDestination === '') {
                setIsCourseUsed({...isCourseUsed, [active.id]: over.id as string});
                return;
            }
            // destination already has a course
            setIsCourseUsed({
                ...isCourseUsed,
                [active.id]: over.id as string, 
                [courseAtDestination]: ''
            });
        } else {
            setCoursesOnGrid(prev => ({
                ...prev, 
                ...(sourceContainer && { [sourceContainer]: '' })
            }));
            setIsCourseUsed({...isCourseUsed, [active.id]: ''});
        }
        console.log(`${active.id} : ${sourceContainer} -> ${over?.id}`);
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
                            ))
                        }
                    </div>
                </div>
            </section>
        </DndContext>
    );
};

export default CourseGrid;
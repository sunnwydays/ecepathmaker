import Droppable from '../components/Droppable';

import { FC, useMemo, useState } from 'react';
import MakerCard from './MakerCard';
import { CourseList } from '../types/CourseTypes';

import {
    DndContext, 
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    UniqueIdentifier,
} from '@dnd-kit/core';
import { createPortal } from 'react-dom';
  

const CourseGrid:FC<{courses: CourseList;}> = ({ courses }) => {
    const initialCoursesUsed = useMemo(() => {
        const posMap: { [key: string]: string } = {};
        Object.keys(courses).forEach(courseCode => posMap[courseCode] = '');
        return posMap;
    }, [courses]);
    
    const initialCoursesOnGrid = useMemo(() => ({
        '3F.1': '', '3F.2': '', '3F.3': '', '3F.4': '', '3F.5': '',
        '3S.1': '', '3S.2': '', '3S.3': '', '3S.4': '', '3S.5': '',
        '4F.1': '', '4F.2': '', '4F.3': '', '4F.4': '', '4F.5': '',
        '4S.1': '', '4S.2': '', '4S.3': '', '4S.4': '', '4S.5': '',
        'XX.1': '', 'XX.2': '', 'XX.3': '', 'XX.4': '', 'XX.5': '',
    }), []);
    
    const [coursesUsed, setCoursesUsed] = useState(initialCoursesUsed);
    const [coursesOnGrid, setCoursesOnGrid] = useState(initialCoursesOnGrid);

    const [activeCourse, setActiveCourse] = useState<UniqueIdentifier | null>(null);

    const handleDragStart = (e:DragStartEvent) => {
        setActiveCourse(e.active.id);
    }

    const handleDragEnd = (e:DragEndEvent) => {
        const {over, active} = e;
        
        // jest testing good for setting objectives
        // console logging very useful for debugging here along with dev tools
        // also looking online for documentation, videos, and examples
        const sourceContainer = coursesUsed[active.id];
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
                setCoursesUsed({...coursesUsed, [active.id]: over.id as string});
                return;
            }
            // destination already has a course
            setCoursesUsed({
                ...coursesUsed,
                [active.id]: over.id as string, 
                [courseAtDestination]: ''
            });
        } else {
            // return course to the bucket
            setCoursesOnGrid(prev => ({
                ...prev, 
                ...(sourceContainer && { [sourceContainer]: '' })
            }));
            setCoursesUsed({...coursesUsed, [active.id]: ''});
        }
        console.log(`${active.id} : ${sourceContainer} -> ${over?.id}`);
    }

    return (
        <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} >
            <section className="flex lg:flex-row flex-col gap-8">
                <div className="grid grid-cols-5 gap-2 size-max">
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
                    <div className="lg:grid xl:grid-cols-2 lg:grid-cols-1 flex gap-2 max-h-[90vh] overflow-y-auto">
                        {Object.entries(coursesUsed)
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
            {createPortal(
                <DragOverlay>
                    {activeCourse && 
                        <MakerCard
                            id={activeCourse as string}
                            code={activeCourse as string}
                            {...courses[activeCourse]}
                        />
                    }
                </DragOverlay>,
            document.body)}
        </DndContext>
    );
};

export default CourseGrid;
import Droppable from '../components/Droppable';

import { FC, useMemo, useState } from 'react';
import MakerCard from './MakerCard';
import { CourseList, StreamRequirements } from '../types/CourseTypes';

import {
    DndContext, 
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    UniqueIdentifier,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { createPortal } from 'react-dom';
  

const CourseGrid:FC<{courses: CourseList;}> = ({ courses }) => {
    // breadth
    // depth
    // cs, hss
    // preq
    // if you graduate (conditions above + below + au + technical experience)
    // not checked (put it into magellan and see after you're done here, you'll have to do it anyways): ce/ee, free elective, technical elective, kernels, minor/cert, sci/math, exclusion

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

    const conditions = useMemo(() => {
        const gridCourses = Object.values(coursesOnGrid).filter(code => code !== '');
        
        // Count courses per stream
        const streamCounts = gridCourses.reduce((acc, code) => {
            const courseStreams = courses[code]?.streams || [];
            courseStreams.forEach(stream => {
                acc[stream] = (acc[stream] || 0) + 1;
            });
            return acc;
        }, {} as Record<number, number>);
    
        // Get streams meeting requirements
        const depthStreams = Object.entries(streamCounts)
            .filter(([, count]) => count >= 3)
            .map(([stream]) => Number(stream));

        const breadthStreams = Object.entries(streamCounts)
            .filter(([, count]) => count >= 1)
            .map(([stream]) => Number(stream))
            .filter(stream => !depthStreams.includes(stream));
    
        return {
            hasCS: gridCourses.filter(code => courses[code]?.isCS).length >= 4,
            hasHSS: gridCourses.filter(code => courses[code]?.isHSS).length >= 2,
            streamCounts,
            breadthStreams,
            depthStreams,
            hasBreadth: breadthStreams.length >= 2,
            hasDepth: depthStreams.length >= 2
        } as StreamRequirements;
    }, [coursesOnGrid, courses]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            }
        })
    );

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
            // term offering restrictions
            if (!(over.id as string).includes('X')) {
                const targetTerm = (over.id as string).includes('F') ? 'F' : 'S';
                const course = courses[active.id as string];
                
                if ((course.onlyF && targetTerm === 'S') || 
                    (course.onlyS && targetTerm === 'F')) {
                    return;
                }
            }

            // same slot
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
        <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
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
                    <h2 className="mb-2 text-xl font-medium">👈 Drag courses into the grid</h2>
                    <h2 className="mb-8 ">🔍 Click a course to view more details</h2>
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
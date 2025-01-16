import Droppable from '../components/Droppable';

import { FC, useState } from 'react';
import MakerCard from './MakerCard';
import { CourseGridProps, FilterState,  } from '../types/CourseTypes';

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
import Filter from './Filter';

const CourseGrid:FC<CourseGridProps> = ({ courses, coursesOnGrid, coursesUsed, setCoursesOnGrid, setCoursesUsed }) => {
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: '',
        streams: [],
        availableF: true,
        availableS: true,
        isCS: false,
        isHSS: false,
        isArtSci: false,
        isEng: false
    });

    const filterCourses = (courseCode: string): boolean => {
        const course = courses[courseCode];
        if (!course) return false;

        if (filters.searchTerm && 
            !courseCode.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
            !course.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
            return false;
        }

        if (filters.streams.length > 0 && 
            !course.streams?.some(stream => filters.streams.includes(stream))) {
            return false;
        }

        if (!filters.availableF && course.onlyF) return false;
        if (!filters.availableS && course.onlyS) return false

        if (filters.isCS && !course.isCS) return false;
        if (filters.isHSS && !course.isHSS) return false;
        if (filters.isArtSci && !course.isArtSci) return false;
        if (filters.isEng && course.isArtSci) return false;

        return true;
    };

    // breadth
    // depth
    // cs, hss
    // preq
    // economics
    // capstone
    // if you graduate (conditions above + below + au + technical experience)
    // not checked (put it into magellan and see after you're done here, you'll have to do it anyways): ce/ee, free elective, technical elective, kernels, minor/cert, sci/math, exclusion, 1.5 300/400 artsci credit limit

    const [activeCourse, setActiveCourse] = useState<UniqueIdentifier | null>(null);

    // const conditions = useMemo(() => {
    //     const gridCourses = Object.values(coursesOnGrid).filter(code => code !== '');
        
    //     // Count courses per stream
    //     const streamCounts = gridCourses.reduce((acc, code) => {
    //         const courseStreams = courses[code]?.streams || [];
    //         courseStreams.forEach(stream => {
    //             acc[stream] = (acc[stream] || 0) + 1;
    //         });
    //         return acc;
    //     }, {} as Record<number, number>);
    
    //     // Get streams meeting requirements
    //     const depthStreams = Object.entries(streamCounts)
    //         .filter(([, count]) => count >= 3)
    //         .map(([stream]) => Number(stream));

    //     const breadthStreams = Object.entries(streamCounts)
    //         .filter(([, count]) => count >= 1)
    //         .map(([stream]) => Number(stream))
    //         .filter(stream => !depthStreams.includes(stream));
    
    //     return {
    //         hasCS: gridCourses.filter(code => courses[code]?.isCS).length >= 4,
    //         hasHSS: gridCourses.filter(code => courses[code]?.isHSS).length >= 2,
    //         streamCounts,
    //         breadthStreams,
    //         depthStreams,
    //         hasBreadth: breadthStreams.length >= 2,
    //         hasDepth: depthStreams.length >= 2
    //     } as StreamRequirements;
    // }, [coursesOnGrid, courses]);

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
                <div className="grid grid-cols-5 gap-2 size-max flex-shrink-0">
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
                    <h2 className="lg:block hidden mb-2 text-xl font-medium">👈 Drag courses into the grid</h2>
                    <h2 className="lg:block hidden mb-8 ">🔍 Click a course to view more details</h2>
                    <h2 className="lg:hidden block mb-2 text-xl">☝️ Drag courses into the grid, 🔍 Click a course to view more details</h2>
                    <Filter filters={filters} setFilters={setFilters} />
                    <div className="flex flex-wrap gap-2 lg:max-h-[36rem] max-h-[24rem] overflow-y-auto">
                        {Object.entries(coursesUsed)
                            .filter(([, isUsed]) => !isUsed)
                            .filter(([courseCode]) => filterCourses(courseCode))
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
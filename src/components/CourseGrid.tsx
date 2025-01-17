import Droppable from '../components/Droppable';

import { FC, useEffect, useMemo, useState } from 'react';
import MakerCard from './MakerCard';
import { CourseGridProps, FilterState, StreamRequirements,  } from '../types/CourseTypes';

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
import WillYouGraduate from './WillYouGraduate';

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

    const [activeCourse, setActiveCourse] = useState<UniqueIdentifier | null>(null);

    const conditions = useMemo(() => {
        const gridCourses = Object.values(coursesOnGrid).filter(code => code !== '');
        
        // Count courses per stream
        const countStreams = gridCourses.reduce((acc, code) => {
            const courseStreams = courses[code]?.streams || [];
            courseStreams.forEach(stream => {
                acc[stream] = (acc[stream] || 0) + 1;
            });
            return acc;
        }, {} as Record<number, number>);

        const streamCounts = Array.from({ length: 6 }, (_, i) => i + 1).reduce((acc, stream) => {
            acc[stream] = countStreams[stream] || 0;
            return acc;
        }, {} as Record<number, number>);
    
        // Get streams meeting requirements
        const depthStreams = Object.entries(countStreams)
            .filter(([, count]) => count >= 3)
            .map(([stream]) => Number(stream));

        const breadthStreams = Object.entries(countStreams)
            .filter(([, count]) => count >= 1)
            .map(([stream]) => Number(stream))
            .filter(stream => !depthStreams.includes(stream));

        const hasEconomics = gridCourses.includes('ECE472');

        const hasCapstone = gridCourses.includes('ECE496') && gridCourses.includes('ECE497') ||
                            gridCourses.includes('APS490') && gridCourses.includes('APS491') ||
                            gridCourses.includes('BME498') && gridCourses.includes('BME499');

        return {
            hasCS: gridCourses.filter(code => courses[code]?.isCS).length >= 4,
            hasHSS: gridCourses.filter(code => courses[code]?.isHSS).length >= 2,
            streamCounts,
            breadthStreams,
            depthStreams,
            hasBreadth: breadthStreams.length >= 2,
            hasDepth: depthStreams.length >= 2,
            hasEconomics,
            hasCapstone
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
                        setInvalidDrop(true);
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
    }

    const [invalidDrop, setInvalidDrop] = useState(false);

    useEffect(() => {
        if (invalidDrop) {
            setTimeout(() => setInvalidDrop(false), 2000);
        }
    }, [invalidDrop]);

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
            {invalidDrop && (
                <div className="
                    fixed top-6 left-1/2 transform -translate-x-1/2
                    flex items-center justify-center
                    z-50
                ">
                    <div className="
                        w-64
                        px-4 py-2 
                        bg-comp2 text-white 
                        rounded-md shadow-md
                        text-center
                        animate-bounce
                    ">
                        Invalid term for this course!
                    </div>
                </div>
            )}
            <Filter filters={filters} setFilters={setFilters} />
            <WillYouGraduate conditions={conditions} />
        </DndContext>
    );
};

export default CourseGrid;
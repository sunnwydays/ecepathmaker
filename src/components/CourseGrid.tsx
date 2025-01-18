import Droppable from '../components/Droppable';

import { FC, useEffect, useMemo, useRef, useState } from 'react';
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

enum DropError {
    NONE = 'NONE',
    PREREQ = 'PREREQ',
    TERM = 'TERM'
}

const CourseGrid:FC<CourseGridProps> = ({ courses, coursesOnGrid, coursesUsed, setCoursesOnGrid, setCoursesUsed }) => {
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: '',
        streams: [],
        availableF: true,
        availableS: true,
        isCS: false,
        isHSS: false,
        isSciMath: false,
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
        if (filters.isSciMath && !course.isSciMath) return false;
        if (filters.isArtSci && !course.isArtSci) return false;
        if (filters.isEng && course.isArtSci) return false;

        return true;
    };

    const [activeCourse, setActiveCourse] = useState<UniqueIdentifier | null>(null);

    const conditions = useMemo(() => {
        const gridCourses = Object.values(coursesOnGrid).filter(code => code !== '');
        
        // Count courses per stream
        const streamInfo = gridCourses.reduce((acc, code) => {
            const courseStreams = courses[code]?.streams || [];
            const isKernel = courses[code]?.kernel || false;
            
            courseStreams.forEach(stream => {
                if (!acc[stream]) {
                    acc[stream] = { count: 0, hasKernel: false };
                }
                acc[stream].count++;
                if (isKernel) acc[stream].hasKernel = true;
            });
            return acc;
        }, {} as Record<number, { count: number, hasKernel: boolean }>);

        const streamCounts = Array.from({ length: 6 }, (_, i) => i + 1).reduce((acc, stream) => {
            acc[stream] = streamInfo[stream]?.count || 0;
            return acc;
        }, {} as Record<number, number>);
    
        // Get streams meeting requirements
        const allDepthStreams = Object.entries(streamInfo)
            .filter(([, info]) => info.count >= 3 && info.hasKernel)
            .map(([stream]) => Number(stream));

        const depthStreams = allDepthStreams.slice(0, 2);
        const extraDepthStreams = allDepthStreams.slice(2);

        const breadthStreams = [
            ...Object.entries(streamInfo)
                .filter(([, info]) => info.count >= 1 && info.hasKernel)
                .map(([stream]) => Number(stream))
                .filter(stream => !allDepthStreams.includes(stream)),
            ...extraDepthStreams
        ];

        const hasCapstone = gridCourses.includes('ECE496') && gridCourses.includes('ECE497') ||
                            gridCourses.includes('APS490') && gridCourses.includes('APS491') ||
                            gridCourses.includes('BME498') && gridCourses.includes('BME499');

        const hasBreadth = breadthStreams.length >= 2;
        const hasDepth = depthStreams.length >= 2;

        let ceOrEE = null;
        if (hasBreadth && hasDepth) {
            const hasStream6Depth = depthStreams.includes(6);
            const hasStream5Depth = depthStreams.includes(5);
            const hasStream5Breadth = breadthStreams.includes(5);
            const hasStream6Breadth = breadthStreams.includes(6);

            if (hasStream6Depth) {
                if (hasStream5Depth || hasStream5Breadth) ceOrEE = 'CE';
                else ceOrEE = 'EE';
            } else if (hasStream5Depth && hasStream6Breadth) {
                ceOrEE = 'CE';
            } else {
                ceOrEE = 'EE';
            }
        }

        return {
            hasCS: gridCourses.filter(code => courses[code]?.isCS).length >= 4,
            hasHSS: gridCourses.filter(code => courses[code]?.isHSS).length >= 2,
            streamCounts,
            breadthStreams,
            depthStreams,
            hasBreadth,
            hasDepth,
            hasEconomics: gridCourses.includes('ECE472'),
            hasCapstone,
            hasSciMath: gridCourses.some(code => courses[code]?.isSciMath),
            ceOrEE,
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
                        setDropError(DropError.TERM);
                        return;
                }

                // check prereqs, allow placing on XX no matter prereqs
                if (course.preq) {
                    // extract year and term from slot
                    const year = (over.id as string)[0];
                    const term = (over.id as string)[1];
                    const gridCourses = Object.values(coursesOnGrid).filter(code => code !== '');
                    const prereqs = course.preq;
                    for (const prereq of prereqs) {
                        if (Array.isArray(prereq)) {
                            if (!prereq.some(p => gridCourses.includes(p))) {
                                setDropError(DropError.PREREQ);
                                return;
                            }
                            for (const course of gridCourses) {
                                const prereqYear = coursesUsed[course][0];
                                for (const p of prereq) {
                                    if (p !== course) continue;
                                    if (prereqYear > year && prereqYear !== 'X') {
                                        setDropError(DropError.PREREQ);
                                        return;
                                    }
                                    if (prereqYear === year && coursesUsed[course][1] >= term) {
                                        setDropError(DropError.PREREQ);
                                        return;
                                    }
                                }
                            }
                        } else {
                            if (!gridCourses.includes(prereq)) {
                                setDropError(DropError.PREREQ);
                                return;
                            }
                            for (const course of gridCourses) {
                                const prereqYear = coursesUsed[course][0];
                                if (prereq !== course) continue;
                                if (prereqYear > year && prereqYear !== 'X') {
                                    setDropError(DropError.PREREQ);
                                    return;
                                }
                                if (prereqYear === year && coursesUsed[course][1] >= term) {
                                    setDropError(DropError.PREREQ);
                                    return;
                                }
                            }
                        }
                    }
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

    const [dropError, setDropError] = useState<DropError>(DropError.NONE);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (dropError !== DropError.NONE) {
            timeoutRef.current = setTimeout(() => {
                setDropError(DropError.NONE);
            }, 2000);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [dropError]);

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
                        {(() => {
                            const filteredCourses = Object.entries(coursesUsed)
                                .filter(([, isUsed]) => !isUsed)
                                .filter(([courseCode]) => filterCourses(courseCode));

                            return filteredCourses.length ? (
                                filteredCourses.map(([courseCode]) => (
                                    <MakerCard
                                        key={courseCode}
                                        id={courseCode}
                                        code={courseCode}
                                        {...courses[courseCode]}
                                    />
                                ))
                            ) : (
                                <div className="w-full text-center text-neutral3 italic select-none">
                                    No courses match the current filter
                                </div>
                            );
                        })()}
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
            {dropError !== DropError.NONE && (
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
                        {dropError === DropError.PREREQ ? 
                            'Missing prerequisites!' :
                            'Invalid term for this course!'
                        }
                    </div>
                </div>
            )}
            <Filter filters={filters} setFilters={setFilters} />
            <WillYouGraduate conditions={conditions} />
        </DndContext>
    );
};

export default CourseGrid;
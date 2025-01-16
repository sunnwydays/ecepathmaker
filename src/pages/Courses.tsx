import { useState } from 'react';
import mockCourses from '../components/mockCourses';

import {
    DndContext, 
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import CourseCard from '../components/CourseCard';
import { createPortal } from 'react-dom';
import Filter from '../components/Filter';
import { FilterState } from '../types/CourseTypes';

const Courses = () => {
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
        const course = mockCourses[courseCode];
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
    
    const [coursesId, setCoursesId] = useState<string[]>(Object.keys(mockCourses));
    const [activeCourse, setActiveCourse] = useState<UniqueIdentifier | null>(null);

    const handleDragStart = (e:DragStartEvent) => {setActiveCourse(e.active.id)};
    const handleDragEnd = (e:DragEndEvent) => {
        setActiveCourse(null);

        const {over, active} = e;
        if (!over) return;
        setCoursesId((coursesId) => {
            const overIndex = coursesId.findIndex((id) => id === over.id);
            const activeIndex = coursesId.findIndex((id) => id === active.id);
            return arrayMove(coursesId, activeIndex, overIndex);
        });
    };

    return (
        <div>
            <h2 className="mb-8 text-2xl font-medium">🗂️ Explore and rearrange courses in my database!</h2>
            <Filter filters={filters} setFilters={setFilters} />
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <SortableContext items={coursesId}>
                    <div className="mt-6 grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
                        {coursesId
                            .filter((courseId) => filterCourses(courseId))
                            .map((course) => (
                                <CourseCard
                                    id={course}
                                    code={course}
                                    {...mockCourses[course]}
                                />
                            )
                        )}
                    </div>
                </SortableContext>
                {activeCourse && (
                    createPortal(
                        <DragOverlay>
                            <CourseCard
                                id={activeCourse as string}
                                code={activeCourse as string}
                                {...mockCourses[activeCourse]}
                            />
                        </DragOverlay>,
                        document.body
                    )
                )}
            </DndContext>
        </div>
    )
}

export default Courses;
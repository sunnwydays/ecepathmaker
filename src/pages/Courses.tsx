import { CourseList } from '../types/CourseTypes';
import { useState } from 'react';

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

const Courses = () => {
    const mockCourses: CourseList = {
        'ECE456': {
            name: 'Test Course',
            preq: ['ECE345'],
            stream1: true,
            onlyF: true,
            isCS: true,
            color: 'abcabc'
        },
        'APS310': {
            name: 'Test Course',
            stream3: true,
        },
        'APS311': {
            name: 'Test Course',
            stream3: true,
        },
        'APS312': {
            name: 'Test Course',
            stream3: true,
        },
        'APS313': {
            name: 'Test Course',
            stream3: true,
        },
        'AuS310': {
            name: 'Test Course',
            stream3: true,
        },
        'AhS310': {
            name: 'Test Course',
            stream3: true,
        },
        'Ahe310': {
            name: 'Test Course',
            stream3: true,
        },
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
            <div>
                filter here
            </div>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <SortableContext items={coursesId}>
                    <div className="flex flex-col gap-4">
                            {coursesId.map((course) => (
                                <CourseCard
                                    id={course}
                                    code={course}
                                    {...mockCourses[course]}
                                />
                            ))}
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
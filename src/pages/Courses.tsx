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

const Courses = () => {
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
                <form>
                </form>
            </div>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <SortableContext items={coursesId}>
                    <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
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
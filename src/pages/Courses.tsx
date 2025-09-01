import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

import { FilterState } from "../types/types";
import { mockCourses } from "../utils/dataImports";
import { CourseCard } from "../utils/componentImports";

const Courses = () => {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 2,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    streams: [],
    availableF: true,
    availableS: true,
    isCS: false,
    isHSS: false,
    isSciMath: false,
    isArtSci: false,
    isEng: false,
  });

  const filterCourses = (courseCode: string): boolean => {
    const course = mockCourses[courseCode];
    if (!course) return false;

    if (
      filters.searchTerm &&
      !courseCode.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
      !course.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
    ) {
      return false;
    }

    if (
      filters.streams.length > 0 &&
      !course.streams?.some((stream) => filters.streams.includes(stream))
    ) {
      return false;
    }

    if (!filters.availableF && course.onlyF) return false;
    if (!filters.availableS && course.onlyS) return false;

    if (filters.isCS && !course.isCS) return false;
    if (filters.isHSS && !course.isHSS) return false;
    if (filters.isSciMath && !course.isSciMath) return false;
    if (filters.isArtSci && !course.isArtSci) return false;
    if (filters.isEng && course.isArtSci) return false;

    return true;
  };

  const [coursesId, setCoursesId] = useState<string[]>(
    Object.keys(mockCourses)
  );
  const [activeCourse, setActiveCourse] = useState<UniqueIdentifier | null>(
    null
  );

  const handleDragStart = (e: DragStartEvent) => {
    setActiveCourse(e.active.id);
  };
  const handleDragEnd = (e: DragEndEvent) => {
    setActiveCourse(null);

    const { over, active } = e;
    if (!over) return;
    setCoursesId((coursesId) => {
      const overIndex = coursesId.findIndex((id) => id === over.id);
      const activeIndex = coursesId.findIndex((id) => id === active.id);
      return arrayMove(coursesId, activeIndex, overIndex);
    });
  };

  return (
    <div>
      <h2 className="mb-8 text-2xl font-medium dark:text-gray-50">
        🗂️ Explore and rearrange courses (all the courses on Magellan and more)!
      </h2>
      <Filter filters={filters} setFilters={setFilters} />
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext items={coursesId}>
          {(() => {
            const filteredCourses = coursesId.filter(filterCourses);

            return filteredCourses.length ? (
              <div className="mt-6 grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course}
                    id={course}
                    code={course}
                    {...mockCourses[course]}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 w-full text-center text-neutral3 italic select-none">
                No courses match the current filter
              </div>
            );
          })()}
        </SortableContext>
        {activeCourse &&
          createPortal(
            <DragOverlay>
              <CourseCard
                id={activeCourse as string}
                code={activeCourse as string}
                {...mockCourses[activeCourse]}
              />
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </div>
  );
};

export default Courses;

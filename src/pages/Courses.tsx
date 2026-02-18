import { useState } from "react";
import {PointerActivationConstraints} from "@dnd-kit/dom"
import {
  DragDropProvider,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/react";

import { move } from "@dnd-kit/helpers";
import { createPortal } from "react-dom";

import { FilterState } from "../types/types";
import { mockCourses } from "../utils/dataImports";
import { CourseCard, Filter } from "../utils/componentImports";

const Courses = () => {
  const sensors = [
    PointerSensor.configure({
      activationConstraints: [
        new PointerActivationConstraints.Distance({ value: 2 }),
        new PointerActivationConstraints.Delay({ value: 100, tolerance: 5 }),
      ],
    }),
    KeyboardSensor,
  ];

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
    Object.keys(mockCourses),
  );

  return (
    <div>
      <h2 className="mb-8 text-2xl font-medium dark:text-gray-50">
        🗂️ Explore and rearrange courses (all the courses on Magellan and more)!
      </h2>
      <Filter filters={filters} setFilters={setFilters} />
      <DragDropProvider 
        onDragEnd={event => (setCoursesId((coursesId) => move(coursesId, event)))} 
        sensors={sensors}
      >
        {(() => {
          const filteredCourses = coursesId.filter(filterCourses);

          return filteredCourses.length ? (
            <div className="mt-6 grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
              {filteredCourses.map((course, index) => (
                <CourseCard
                  index={index}
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
        {createPortal(
          <DragOverlay>
            {(source) => (
              <CourseCard
                index={-1}
                id={source.id as string}
                code={source.id as string}
                {...mockCourses[source.id]}
              />
            )}
          </DragOverlay>,
          document.body,
        )}
      </DragDropProvider>
    </div>
  );
};

export default Courses;

import { useEffect, useState } from "react";
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
import { filterCourses } from "../utils/filterCourses";
import { useCurriculum } from "../components/layout/Layout";
import { CourseCard, Filter } from "../utils/componentImports";
import Seo from "../components/seo/Seo";
import { SITE_URL } from "../lib/site";

const coursesJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Courses",
      item: `${SITE_URL}/courses`,
    },
  ],
};

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

  const curriculum = useCurriculum();

  // Group ids differ between curricula, so a stream filter cannot carry over
  useEffect(() => {
    setFilters((prev) =>
      prev.streams.length ? { ...prev, streams: [] } : prev
    );
  }, [curriculum.id]);

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
      <Seo
        title="Courses"
        path="/courses"
        description="Browse and filter UofT ECE courses by stream, term, and category"
        jsonLd={coursesJsonLd}
      />
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
            const filteredCourses = coursesId.filter((code) =>
              filterCourses(filters, code, mockCourses[code], curriculum)
            );

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

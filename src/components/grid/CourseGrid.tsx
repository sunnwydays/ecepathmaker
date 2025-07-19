import { FC, useState, useEffect, useMemo, useRef, createRef } from "react";
import {
  CourseGridProps,
  FilterState,
  ValidYearTerms,
  StreamRequirements,
  GridPosition,
  CoursesUsed,
} from "../../types/types";
import {
    Droppable,
    MakerCard,
} from "../../utils/componentImports";
import { toPng } from 'html-to-image';

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
import { createPortal } from "react-dom";
import Filter from "../forms/Filter";
import WillYouGraduate from "../info/WillYouGraduate";
import { getValidYearTerms } from "../../utils/getValidYearTerms";
import { getYearTerm } from "../../utils/getYearTerm";
import Announcement from "../info/Announcement";

enum DropError {
  NONE = "NONE",
  PREREQ = "PREREQ",
  COREQ = "COREQ",
  TERM = "TERM",
}

const CourseGrid: FC<CourseGridProps> = ({
  courses,
  coursesOnGrid,
  coursesUsed,
  setCoursesOnGrid,
  setCoursesUsed,
  setCustomInfo,
  setPreqString,
  setCoreqString,
}) => {
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
    const course = courses[courseCode];
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

  const initialValidYearTerms = useMemo<ValidYearTerms>(
    () =>
      ({
        "3F": true,
        "3S": true,
        "4F": true,
        "4S": true,
        XX: true,
      } as ValidYearTerms),
    []
  );

  const [validYearTerms, setValidYearTerms] = useState<ValidYearTerms>(
    initialValidYearTerms
  );
  const [activeCourse, setActiveCourse] = useState<UniqueIdentifier | null>(
    null
  );

  const conditions = useMemo(() => {
    const gridCourses = Object.values(coursesOnGrid).filter(
      (code) => code !== ""
    );

    // Count courses per stream
    const streamInfo = gridCourses.reduce((acc, code) => {
      const courseStreams = courses[code]?.streams || [];
      const isKernel = courses[code]?.kernel || false;

      courseStreams.forEach((stream) => {
        if (!acc[stream]) {
          acc[stream] = { count: 0, hasKernel: false };
        }
        acc[stream].count++;
        if (isKernel) acc[stream].hasKernel = true;
      });
      return acc;
    }, {} as Record<number, { count: number; hasKernel: boolean }>);

    const streamCounts = Array.from({ length: 6 }, (_, i) => i + 1).reduce(
      (acc, stream) => {
        acc[stream] = streamInfo[stream]?.count || 0;
        return acc;
      },
      {} as Record<number, number>
    );

    // Get streams meeting requirements
    const depthStreams = Object.entries(streamInfo)
      .filter(([, info]) => info.count >= 3 && info.hasKernel)
      .map(([stream]) => Number(stream));

    const breadthStreams = [
      ...Object.entries(streamInfo)
        .filter(
          ([stream, info]) =>
            info.count >= 1 &&
            info.hasKernel &&
            !depthStreams.includes(Number(stream))
        )
        .map(([stream]) => Number(stream)),
    ];

    const numDepth = depthStreams.length;
    const hasBreadth =
      breadthStreams.length >= 2 ||
      (breadthStreams.length === 1 && numDepth >= 3) ||
      numDepth >= 4;
    const hasDepth = depthStreams.length >= 2;

    let ceOrEE = null; // null, 'CE', 'EE', or 'ECE'
    if (hasDepth && hasBreadth) {
      const numCEDepth = depthStreams.filter(
        (stream) => stream === 5 || stream === 6
      ).length;
      const numEEDepth = depthStreams.length - numCEDepth;
      const numCEBreadth = breadthStreams.filter(
        (stream) => stream === 5 || stream === 6
      ).length;
      const numEEBreadth = breadthStreams.length - numCEBreadth;

      // Logic can't be based only on count due to possibility of many EE
      // depths and need to differentiate depth and breadth
      const countCE = numCEDepth * 3 + numCEBreadth;

      if (countCE >= 4) {
        switch (numEEDepth) {
          case 0:
            ceOrEE = "CE";
            break;
          case 1:
            // 0 EE breadth not possible
            if (numEEBreadth === 1) ceOrEE = "CE";
            else ceOrEE = "ECE";
            break;
          default:
            ceOrEE = "ECE";
            break;
        }
      } else {
        ceOrEE = "EE";
      }
    }

    const isCapstone = (course1: string, course2: string): boolean => {
      return (
        gridCourses.includes(course1) &&
        gridCourses.includes(course2) &&
        coursesUsed[course1][0] === "4" &&
        coursesUsed[course2][0] === "4" &&
        coursesUsed[course1][1] !== coursesUsed[course2][1]
      );
    };

    const hasCapstone = [
      ["ECE496", "ECE497"],
      ["APS490", "APS491"],
      ["BME498", "BME499"],
    ].some(([course1, course2]) => isCapstone(course1, course2));

    return {
      hasCS: gridCourses.filter((code) => courses[code]?.isCS).length >= 4,
      hasHSS: gridCourses.filter((code) => courses[code]?.isHSS).length >= 2,
      streamCounts,
      breadthStreams,
      depthStreams,
      hasBreadth,
      hasDepth,
      hasEconomics: gridCourses.includes("ECE472"),
      hasCapstone,
      hasSciMath: gridCourses.some((code) => courses[code]?.isSciMath),
      ceOrEE,
    } as StreamRequirements;
  }, [coursesOnGrid, courses, coursesUsed]);

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

  // Does not check prerequisites
  const removeCourseFromSlot = (course: string | UniqueIdentifier, slot: GridPosition) => {
    setCoursesOnGrid((prev) => ({
      ...prev,
      ...(slot && { [slot]: "" }),
    }));
    setCoursesUsed({ ...coursesUsed, [course]: "" as GridPosition });
  }

  const handleDragStart = (e: DragStartEvent) => {
    setActiveCourse(e.active.id);
    const ValidYearTermsProps = {
      coursesOnGrid,
      coursesUsed,
      course: courses[e.active.id],
    };
    const validYearTerms = getValidYearTerms(ValidYearTermsProps);
    setValidYearTerms(validYearTerms);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveCourse(null);
    setValidYearTerms(initialValidYearTerms);
    const { over, active } = e;

    // jest testing good for setting objectives
    // console logging very useful for debugging here along with dev tools
    // also looking online for documentation, videos, and examples
    const sourceContainer = coursesUsed[active.id];
    if (over) {
      // term offering restrictions
      const targetTerm = (over.id as string)[1];
      const course = courses[active.id as string];

      if (
        (course.onlyF && targetTerm === "S") ||
        (course.onlyS && targetTerm === "F")
      ) {
        removeCourseFromSlot(active.id, sourceContainer);
        setDropError(DropError.TERM);
        return;
      }

      const yearTerm = getYearTerm(over.id as GridPosition);

      if (!validYearTerms[yearTerm]) {
        // somewhat accounting for moving prereq after moving the course
        if (!validYearTerms[getYearTerm(sourceContainer)]) {
          removeCourseFromSlot(active.id, sourceContainer);
        }
        setDropError(DropError.PREREQ);
        return;
      }

      // same slot
      if (sourceContainer === over.id) return;

      setCoursesOnGrid((prev) => ({
        ...prev,
        [over.id]: active.id,
        ...(sourceContainer && { [sourceContainer]: "" }),
      }));

      const courseAtDestination =
        coursesOnGrid[over.id as keyof typeof coursesOnGrid];

      // destination is empty
      if (courseAtDestination === "") {
        setCoursesUsed({
          ...coursesUsed,
          [active.id]: over.id as GridPosition,
        });
        return;
      }

      // destination already has a course
      setCoursesUsed({
        ...coursesUsed,
        [active.id]: over.id as GridPosition,
        [courseAtDestination]: "",
      });
    } else {
      removeCourseFromSlot(active.id, sourceContainer);
    }
  };

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

  const buttonStyle = `
        w-full px-4 py-1 
        ring-1 ring-opacity-80
        rounded-lg shadow-sm 
        bg-white dark:bg-gray-700
        hover:text-white hover:bg-opacity-90
        dark:hover:text-gray-50 dark:hover:bg-opacity-90
        font-medium
        transition-all duration-300
        hover:duration-100 active:scale-95
    `; // specify default text- color, hover:bg- color, and ring- color

  const clearGrid = () => {
    if (!window.confirm("Are you sure you want to clear your layout? This will remove all courses from the grid."))
      return;

    setCoursesUsed(() => {
      const posMap: CoursesUsed = {};
      Object.keys(courses).forEach((courseCode) => (posMap[courseCode] = ""));
      return posMap;
    });
    setCoursesOnGrid({
      "3F.1": "",
      "3F.2": "",
      "3F.3": "",
      "3F.4": "",
      "3F.5": "",
      "3S.1": "",
      "3S.2": "",
      "3S.3": "",
      "3S.4": "",
      "3S.5": "",
      "4F.1": "",
      "4F.2": "",
      "4F.3": "",
      "4F.4": "",
      "4F.5": "",
      "4S.1": "",
      "4S.2": "",
      "4S.3": "",
      "4S.4": "",
      "4S.5": "",
      "XX.1": "",
      "XX.2": "",
      "XX.3": "",
      "XX.4": "",
      "XX.5": "",
    });
  };

  const screenshotRef = createRef<HTMLDivElement>();

  const handleCapture = async () => {
    if (!screenshotRef.current) return;

    try {
      const dataUrl = await toPng(screenshotRef.current, { cacheBust: true });

      const link = document.createElement('a');
      link.download = 'pathmaker.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Could not generate layout screenshot', error);
    }
  };

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <section className="flex lg:flex-row flex-col gap-x-6 gap-y-4">
        <div
          className="grid grid-cols-5 gap-2 size-max flex-shrink-0"
          ref={screenshotRef}
        >
          {Object.entries(coursesOnGrid).map(([slot, courseCode]) => (
            <Droppable
              key={slot}
              id={slot}
              valid={validYearTerms[getYearTerm(slot as GridPosition)]}
            >
              {courseCode ? (
                <MakerCard
                  valid={validYearTerms[getYearTerm(slot as GridPosition)]}
                  id={courseCode}
                  code={courseCode}
                  setCustomInfo={setCustomInfo}
                  setPreqString={setPreqString}
                  setCoreqString={setCoreqString}
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
          <h2 className="lg:block hidden mb-1 text-xl font-medium text-center dark:text-gray-50">
            👈 Drag courses into the grid
          </h2>
          <h2 className="lg:block hidden text-center mb-1 dark:text-gray-50">
            🔍 Click a course to view more details
          </h2>
          <div className="lg:mt-4 flex xl:gap-8 lg:gap-4 gap-8">
            <button
              onClick={handleCapture}
              // onClick={downloadScreenshot}
              className={`
                                ${buttonStyle}
                                ring-green3 dark:ring-green2
                                text-green3 dark:text-green2
                                hover:bg-green2 dark:hover:bg-green4
                            `}
            >
              Screenshot
            </button>
            <button
              onClick={clearGrid}
              data-testid="clear-grid"
              className={`
                                ${buttonStyle}
                                ring-comp3 dark:ring-comp2
                                text-comp3 dark:text-comp2
                                hover:bg-comp2 dark:hover:bg-comp4
                            `}
            >
              Clear
            </button>
          </div>
          <h2 className="lg:hidden block my-2 text-lg text-center dark:text-gray-50">
            ☝️ Hold and drag courses into the grid,
            <br />
            🔍 Click a course to view more details
          </h2>
          <div
            className="
                        flex flex-wrap gap-2 
                        lg:max-h-[37.5rem] max-h-[22rem]
                        lg:w-full w-wps 
                        overflow-y-auto
                        justify-center
                        mt-4
                    "
          >
            {(() => {
              const filteredCourses = Object.entries(coursesUsed)
                .filter(([courseCode]) => filterCourses(courseCode));
              const unusedFilteredCourses = filteredCourses
                .filter(([, isUsed]) => !isUsed);

              return unusedFilteredCourses.length ? (
                unusedFilteredCourses.map(([courseCode]) => (
                  <MakerCard
                    valid={true}
                    key={courseCode}
                    id={courseCode}
                    code={courseCode}
                    setCustomInfo={setCustomInfo}
                    setPreqString={setPreqString}
                    setCoreqString={setCoreqString}
                    {...courses[courseCode]}
                  />
                ))
              ) : (
                filteredCourses.length ? (
                  // print the courses that match
                  <ul className="
                                    text-neutral3 italic select-none
                                    list-disc list-inside"
                  >
                    Courses on grid that match the filter: {
                      filteredCourses.map(([courseCode, pos]) => (
                        <li className="not-italic">
                          {pos}: {courseCode} - {courses[courseCode].name}
                        </li>
                      ))
                    }
                  </ul>
                ) : (
                <div className="
                                  w-full text-center 
                                  text-neutral3 italic select-none"
                >
                  No courses match the current filter
                </div>
                )
              );
            })()}
          </div>
        </div>
      </section>
      {createPortal(
        <DragOverlay>
          {activeCourse && (
            <MakerCard
              valid={true}
              id={activeCourse as string}
              code={activeCourse as string}
              setCustomInfo={setCustomInfo}
              setPreqString={setPreqString}
              setCoreqString={setCoreqString}
              {...courses[activeCourse]}
            />
          )}
        </DragOverlay>,
        document.body
      )}
      {dropError !== DropError.NONE && (
        <Announcement>
          {dropError === DropError.TERM
            ? "Invalid term for this course!"
            : "Missing co/prerequisites!"}
        </Announcement>
      )}
      <Filter filters={filters} setFilters={setFilters} />
      <WillYouGraduate conditions={conditions} />
    </DndContext>
  );
};

export default CourseGrid;

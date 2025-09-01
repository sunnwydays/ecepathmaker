import { FC, useState, useEffect, useMemo, useRef } from "react";
import {
  CourseGridProps,
  FilterState,
  ValidYearTerms,
  StreamRequirements,
  GridPosition,
  CoursesUsed,
} from "../../types/types";
import { Droppable, MakerCard } from "../../utils/componentImports";

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
import { getValidYearTerms } from "../../utils/getValidYearTerms";
import { getYearTerm } from "../../utils/getYearTerm";
import Announcement from "../info/Announcement";
import { addDependencies } from "../../utils/utilImports";
import { emptyGrid } from "../../utils/utilImports";

enum DropError {
  NONE = "NONE",
  PREREQ = "PREREQ",
  COREQ = "COREQ",
  DEPEND = "DEPEND",
  TERM = "TERM",
}

const CourseGrid: FC<CourseGridProps> = ({
  courses,
  coursesOnGrid,
  coursesUsed,
  dependencies,
  setCoursesOnGrid,
  setCoursesUsed,
  setCustomInfo,
  setPreqString,
  setCoreqString,
  setDependencies,
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
  const removeCourseFromSlot = (code: UniqueIdentifier, slot: GridPosition) => {
    setCoursesOnGrid((prev) => {
      if (!slot) return prev;
      return { ...prev, [slot]: "" };
    });
    setCoursesUsed((prev) => ({
      ...prev,
      [code]: "" as GridPosition,
    }));
    setCurrDeps(new Set());
    setDropError(DropError.NONE);
  };

  const [courseToRemove, setCourseToRemove] = useState<UniqueIdentifier>();
  const [currDeps, setCurrDeps] = useState<Set<UniqueIdentifier>>(new Set());

  // Remove a course from the grid safely by checking dependencies
  // Returns true if no dependency on grid, false otherwise
  const checkPreqRemove = (
    course: UniqueIdentifier,
    slot: GridPosition
  ): boolean => {
    const deps = dependencies.get(course);
    if (deps) {
      // check if any dependencies are on the grid
      for (const dep of deps) {
        const depPreqs = courses[dep].preq ?? [];
        if (coursesUsed[dep]) {
          // check if course is a OR prereq
          for (const andPreq of depPreqs) {
            if (Array.isArray(andPreq)) {
              // not a problem if there is another OR preq on grid - minimum 2 to ignore
              let numOrPreqs = 0;
              for (const orPreq of andPreq) {
                if (numOrPreqs >= 2) break;
                if (coursesUsed[orPreq]) numOrPreqs++;
              }
              if (numOrPreqs >= 2) {
                for (const orPreq of andPreq) {
                  if (course == orPreq) {
                    // skip any more checking, it's good
                    removeCourseFromSlot(course, slot);
                    return true;
                  }
                }
              } else {
                currDeps.add(dep);
              }
            } else {
              // removing an AND preq is not okay
              currDeps.add(dep);
            }
          }
        }

        const depCoreqs = courses[dep].coreq ?? [];
        if (coursesUsed[dep]) {
          // check if course is a OR prereq
          for (const andPreq of depCoreqs) {
            if (Array.isArray(andPreq)) {
              // not a problem if there is another OR preq on grid - minimum 2 to ignore
              let numOrPreqs = 0;
              for (const orPreq of andPreq) {
                if (numOrPreqs >= 2) break;
                if (coursesUsed[orPreq]) numOrPreqs++;
              }
              if (numOrPreqs >= 2) {
                for (const orPreq of andPreq) {
                  if (course == orPreq) {
                    // skip any more checking, it's good
                    removeCourseFromSlot(course, slot);
                    return true;
                  }
                }
              } else {
                currDeps.add(dep);
              }
            } else {
              // removing an AND preq is not okay
              currDeps.add(dep);
            }
          }
        }
      }

      if (currDeps.size) {
        setCourseToRemove(course);
        setDropError(DropError.DEPEND);
        return false;
      }
    }

    removeCourseFromSlot(course, slot);
    return true;
  };

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
    const code = active.id;

    // jest testing good for setting objectives
    // console logging very useful for debugging here along with dev tools
    // also looking online for documentation, videos, and examples
    const sourceContainer = coursesUsed[code];

    if (!over) {
      checkPreqRemove(code, sourceContainer);
      return;
    }

    // term offering restrictions
    const targetTerm = (over.id as string)[1];
    const course = courses[active.id as string];

    if (
      (course.onlyF && targetTerm === "S") ||
      (course.onlyS && targetTerm === "F")
    ) {
      setCourseToRemove(code);
      setDropError(DropError.TERM);
      return;
    }

    const yearTerm = getYearTerm(over.id as GridPosition);

    if (!validYearTerms[yearTerm]) {
      // somewhat accounting for moving prereq after moving the course
      if (!validYearTerms[getYearTerm(sourceContainer)]) {
        removeCourseFromSlot(code, sourceContainer);
      }
      setDropError(DropError.PREREQ);
      return;
    }

    // same slot
    if (sourceContainer === over.id) return;

    addDependencies({ code, courses, dependencies, setDependencies });

    const courseAtDestination =
      coursesOnGrid[over.id as keyof typeof coursesOnGrid];

    // Remove the course at destination if it doesn't have dependencies on grid
    if (
      courseAtDestination &&
      !checkPreqRemove(courseAtDestination, over.id as GridPosition)
    ) {
      return;
    }

    setCoursesOnGrid((prev) => ({
      ...prev,
      [over.id]: code,
      ...(sourceContainer && { [sourceContainer]: "" }),
    }));

    setCoursesOnGrid((prev) => {
      if (!over.id) return prev;

      return {
        ...prev,
        [over.id]: code,
        ...(sourceContainer && { [sourceContainer]: "" }),
      };
    });

    // put active course at the destination
    // Functional updater form (with prev) to use most up-to-date state, no batch
    setCoursesUsed((prev) => ({
      ...prev,
      [code]: over.id as GridPosition,
    }));
    setCoursesOnGrid((prev) => {
      if (!over.id) return prev;
      return { ...prev, [over.id]: code };
    });
  };

  const [dropError, setDropError] = useState<DropError>(DropError.NONE);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (dropError !== DropError.NONE) {
      timeoutRef.current = setTimeout(() => {
        setDropError(DropError.NONE);
        setCourseToRemove("");
        setCurrDeps(new Set());
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
    if (
      !window.confirm(
        "Are you sure you want to clear your layout? This will remove all courses from the grid."
      )
    )
      return;

    setCoursesUsed(() => {
      const posMap: CoursesUsed = {};
      Object.keys(courses).forEach((courseCode) => (posMap[courseCode] = ""));
      return posMap;
    });
    setCoursesOnGrid(emptyGrid);
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
          data-testid="grid"
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
            data-testid="bucket"
          >
            {(() => {
              const filteredCourses = Object.entries(coursesUsed).filter(
                ([courseCode]) => courseCode
              );
              const unusedFilteredCourses = Object.entries(coursesUsed).filter(
                ([, isUsed]) => !isUsed
              );

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
              ) : filteredCourses.length ? (
                // print the courses that match
                <ul
                  className="
                                    text-neutral3 italic select-none
                                    list-disc list-inside"
                >
                  Courses on grid that match the filter:{" "}
                  {filteredCourses.map(([courseCode, pos]) => (
                    <li className="not-italic" key={courseCode}>
                      {pos}: {courseCode} - {courses[courseCode].name}
                    </li>
                  ))}
                </ul>
              ) : (
                <div
                  className="
                                  w-full text-center 
                                  text-neutral3 italic select-none"
                >
                  No courses match the current filter
                </div>
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
      {dropError !== DropError.NONE &&
        (() => {
          let message = "Error";

          switch (dropError) {
            case DropError.TERM:
              message = courseToRemove
                ? `${courseToRemove} is ${
                    courses[courseToRemove].onlyF ? "fall" : "winter"
                  } only!`
                : `Invalid term for this course!`;
              break;
            case DropError.PREREQ:
              message = "Missing co/prerequisites!";
              break;
            case DropError.DEPEND:
              message = `${[...currDeps].join(", ")} depend${
                currDeps.size == 1 ? "s" : ""
              } on ${courseToRemove}!`;
              break;
          }

          return <Announcement>{message}</Announcement>;
        })()}
    </DndContext>
  );
};

export default CourseGrid;

import {
  CoursesOnGrid,
  CourseList,
  CoursesUsed,
  StreamRequirements,
} from "../types/types";

export const computeConditions = ({
  coursesOnGrid,
  courses,
  coursesUsed,
}: {
  coursesOnGrid: CoursesOnGrid;
  courses: CourseList;
  coursesUsed: CoursesUsed;
}): StreamRequirements => {
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
};

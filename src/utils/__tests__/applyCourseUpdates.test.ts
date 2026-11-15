import { applyCourseUpdates, refreshDependencies } from "../applyCourseUpdates";
import { CourseList, CoursesUsed } from "../../types/types";

jest.mock("../../data/mockCourses", () => ({
  __esModule: true,
  default: {
    AAA100: { name: "A new", streams: [1] },
    BBB100: { name: "B fixed", streams: [2], onlyS: true },
    CCC100: { name: "C", streams: [3], preq: ["AAA100"] },
    DDD100: { name: "D", streams: [4] },
  },
}));

jest.mock("../../data/courseUpdates", () => {
  const courseUpdates = [
    { version: 1, addMissing: true, upsert: ["BBB100"] },
    { version: 2, upsert: ["CCC100"] },
    { version: 3, remove: ["DDD100"] },
  ];
  return {
    courseUpdates,
    COURSE_DATA_VERSION: 3,
  };
});

const old = (name: string) => ({ name, streams: [9] });

describe("applyCourseUpdates", () => {
  it("adds missing default courses for a version 0 user", () => {
    const result = applyCourseUpdates({
      courses: { BBB100: old("edited") },
      coursesUsed: { BBB100: "" },
      version: 0,
    });
    expect(result.courses.AAA100.name).toBe("A new");
    expect(result.coursesUsed.AAA100).toBe("");
    expect(result.version).toBe(3);
  });

  it("does not bring back deleted courses for a current user", () => {
    const result = applyCourseUpdates({
      courses: { BBB100: old("kept") },
      coursesUsed: { BBB100: "" },
      version: 3,
    });
    expect(Object.keys(result.courses)).toEqual(["BBB100"]);
    expect(result.courses.BBB100.name).toBe("kept");
  });

  it("upsert replaces course data and keeps the grid position", () => {
    const result = applyCourseUpdates({
      courses: { BBB100: old("edited") },
      coursesUsed: { BBB100: "1F-2" } as unknown as CoursesUsed,
      version: 0,
    });
    expect(result.courses.BBB100.name).toBe("B fixed");
    expect(result.coursesUsed.BBB100).toBe("1F-2");
    expect(result.upserted).toContain("BBB100");
  });

  it("upsert adds a code the user lacks", () => {
    const result = applyCourseUpdates({
      courses: {},
      coursesUsed: {},
      version: 1,
    });
    expect(result.courses.CCC100.name).toBe("C");
    expect(result.coursesUsed.CCC100).toBe("");
  });

  it("remove deletes an unused course but not one on the grid", () => {
    const unused = applyCourseUpdates({
      courses: { DDD100: old("d") },
      coursesUsed: { DDD100: "" },
      version: 2,
    });
    expect(unused.courses.DDD100).toBeUndefined();
    expect(unused.coursesUsed.DDD100).toBeUndefined();

    const onGrid = applyCourseUpdates({
      courses: { DDD100: old("d") },
      coursesUsed: { DDD100: "1F-1" } as unknown as CoursesUsed,
      version: 2,
    });
    expect(onGrid.courses.DDD100).toBeDefined();
    expect(onGrid.coursesUsed.DDD100).toBe("1F-1");
  });

  it("never touches custom courses", () => {
    const custom = { name: "Mine", streams: [1] };
    const result = applyCourseUpdates({
      courses: { MINE100: custom },
      coursesUsed: { MINE100: "" },
      version: 0,
    });
    expect(result.courses.MINE100).toBe(custom);
    expect(result.coursesUsed.MINE100).toBe("");
  });

  it("does not mutate its inputs", () => {
    const courses: CourseList = { BBB100: old("edited") };
    const coursesUsed: CoursesUsed = { BBB100: "" };
    applyCourseUpdates({ courses, coursesUsed, version: 0 });
    expect(courses).toEqual({ BBB100: old("edited") });
    expect(coursesUsed).toEqual({ BBB100: "" });
  });

  it("applies several versions in order", () => {
    const result = applyCourseUpdates({
      courses: { DDD100: old("d") },
      coursesUsed: { DDD100: "" },
      version: 0,
    });
    // added by v1, refreshed by v1/v2, removed by v3
    expect(result.courses.AAA100).toBeDefined();
    expect(result.courses.CCC100.name).toBe("C");
    expect(result.courses.DDD100).toBeUndefined();
  });
});

describe("refreshDependencies", () => {
  it("adds dependencies for upserted courses on the grid only", () => {
    const courses = {
      CCC100: { name: "C", streams: [3], preq: ["AAA100"] },
      BBB100: { name: "B", streams: [2], preq: ["AAA100"] },
    };
    const coursesUsed = { CCC100: "1F-1", BBB100: "" } as unknown as CoursesUsed;
    const original = new Map();
    const result = refreshDependencies(
      ["CCC100", "BBB100"],
      courses,
      coursesUsed,
      original
    );
    expect(Array.from(result.get("AAA100") ?? [])).toEqual(["CCC100"]);
    expect(original.size).toBe(0);
  });
});

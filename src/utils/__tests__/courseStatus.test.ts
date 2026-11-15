import { getCourseStatus } from "../courseStatus";
import { getValidYearTerms } from "../getValidYearTerms";
import { emptyGrid } from "../emptyGrid";
import mockCourses from "../../data/mockCourses";
import { CoursesOnGrid, CoursesUsed } from "../../types/types";

const place = (placed: Record<string, string>) => {
  const coursesOnGrid = { ...emptyGrid } as CoursesOnGrid;
  const coursesUsed: CoursesUsed = {};
  for (const [code, slot] of Object.entries(placed)) {
    coursesOnGrid[slot as keyof CoursesOnGrid] = code;
    coursesUsed[code] = slot as CoursesUsed[string];
  }
  return { coursesOnGrid, coursesUsed };
};

const status = (code: string, placed: Record<string, string> = {}) => {
  const { coursesOnGrid, coursesUsed } = place(placed);
  return getCourseStatus(code, mockCourses, coursesUsed, coursesOnGrid);
};

describe("getCourseStatus", () => {
  it("reports a course on the grid with its slot", () => {
    expect(status("ECE302", { ECE302: "3F.1" })).toEqual({
      kind: "onGrid",
      slot: "3F.1",
    });
  });

  it("names the earliest term a course can be taken", () => {
    expect(status("ECE302")).toEqual({ kind: "canTake", from: "3F" });
    // a winter-only course starts in 3S
    expect(status("ECE330")).toEqual({ kind: "canTake", from: "3S" });
    // ECE464 needs ECE302, ECE316 and ECE417, so with only ECE302 in 3F
    // it is still missing prerequisites
    expect(status("ECE464", { ECE302: "3F.1" })).toEqual({ kind: "missing" });
  });

  it("starts after the latest prerequisite on the grid", () => {
    expect(
      status("ECE464", { ECE302: "3F.1", ECE316: "3F.2", ECE417: "3S.1" })
    ).toEqual({ kind: "canTake", from: "4S" });
  });

  it("marks first- and second-year courses as already taken", () => {
    expect(status("ECE216")).toEqual({ kind: "taken" });
  });

  it("marks a code outside the list as external", () => {
    expect(status("MIE286")).toEqual({ kind: "external" });
  });

  it("agrees with getValidYearTerms for a fall-only course", () => {
    const { coursesOnGrid, coursesUsed } = place({});
    const valid = getValidYearTerms({
      coursesOnGrid,
      coursesUsed,
      course: mockCourses.ECE335,
    });
    expect(valid["3S"]).toBe(false);
    expect(status("ECE335")).toEqual({ kind: "canTake", from: "3F" });
  });
});

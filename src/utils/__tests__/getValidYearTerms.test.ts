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

describe("getValidYearTerms with first- and second-year courses", () => {
  it("treats a required core course as already taken", () => {
    const valid = getValidYearTerms({
      ...place({}),
      course: { name: "x", preq: ["ECE231"] },
    });
    expect(valid).toMatchObject({ "3F": true, "3S": true, "4F": true, "4S": true });
  });

  it("treats a 'one of' group with a core course as already met", () => {
    const valid = getValidYearTerms({
      ...place({}),
      course: { name: "x", coreq: [["ECE216", "ECE355"]] },
    });
    expect(valid).toMatchObject({ "3F": true, "3S": true, "4F": true, "4S": true });
  });

  it("still requires the prerequisites that are not core courses", () => {
    const course = { name: "x", preq: ["ECE231", "ECE302"] };
    expect(getValidYearTerms({ ...place({}), course })).toMatchObject({
      "3F": false, "3S": false, "4F": false, "4S": false,
    });
    expect(
      getValidYearTerms({ ...place({ ECE302: "3F.1" }), course })
    ).toMatchObject({ "3F": false, "3S": true, "4F": true, "4S": true });
  });

  it("ECE435 can be placed once its third-year prerequisites are on the grid", () => {
    const course = mockCourses.ECE435;
    expect(getValidYearTerms({ ...place({}), course })["4F"]).toBe(false);
    const valid = getValidYearTerms({
      ...place({ ECE302: "3F.1", ECE335: "3F.2", ECE320: "3S.1" }),
      course,
    });
    expect(valid).toMatchObject({ "3F": false, "3S": false, "4F": true, "4S": false });
  });
});

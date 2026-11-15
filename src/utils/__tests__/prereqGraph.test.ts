import { buildUnlocks, getRequirements } from "../prereqGraph";
import mockCourses from "../../data/mockCourses";

describe("getRequirements", () => {
  it("returns a required course as a single option", () => {
    expect(getRequirements({ preq: ["ECE345"] })).toEqual([
      { kind: "preq", options: ["ECE345"] },
    ]);
  });

  it("returns a nested array as a 'one of' group", () => {
    expect(getRequirements({ preq: [["ECE318", "ECE320"]] })).toEqual([
      { kind: "preq", options: ["ECE318", "ECE320"] },
    ]);
  });

  it("marks corequisites", () => {
    expect(getRequirements({ preq: ["A"], coreq: [["B", "C"]] })).toEqual([
      { kind: "preq", options: ["A"] },
      { kind: "coreq", options: ["B", "C"] },
    ]);
  });

  it("returns nothing without requirements", () => {
    expect(getRequirements({})).toEqual([]);
    expect(getRequirements(undefined)).toEqual([]);
  });
});

describe("buildUnlocks", () => {
  it("lists the courses that need a course, with options and coreqs", () => {
    const unlocks = buildUnlocks({
      A: { name: "a" },
      B: { name: "b", preq: ["A"] },
      C: { name: "c", preq: [["A", "B"]] },
      D: { name: "d", coreq: ["A"] },
    });
    expect(unlocks.get("A")).toEqual([
      { code: "B", kind: "preq" },
      { code: "C", kind: "preq" },
      { code: "D", kind: "coreq" },
    ]);
    expect(unlocks.get("B")).toEqual([{ code: "C", kind: "preq" }]);
    expect(unlocks.get("C")).toBeUndefined();
  });

  it("gives ECE302 its ten courses in the default list", () => {
    const unlocks = buildUnlocks(mockCourses);
    expect(unlocks.get("ECE302")).toHaveLength(10);
    expect(unlocks.get("ECE302")).toContainEqual({ code: "ECE361", kind: "coreq" });
  });
});

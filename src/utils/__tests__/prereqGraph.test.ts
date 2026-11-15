import { buildFocusGraph, buildUnlocks, FocusGraph, getRequirements } from "../prereqGraph";
import { CourseList } from "../../types/types";
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

describe("buildFocusGraph", () => {
  const unlocksOf = (courses: CourseList) => buildUnlocks(courses);
  const codes = (graph: FocusGraph, column: number) =>
    graph.nodes.filter((n) => n.column === column).map((n) => n.code);

  it("goes up two levels (ECE464)", () => {
    const graph = buildFocusGraph("ECE464", mockCourses, unlocksOf(mockCourses));
    expect(codes(graph, 0)).toEqual(["ECE464"]);
    expect(codes(graph, -1)).toEqual(["ECE302", "ECE316", "ECE417"]);
    expect(codes(graph, -2).length).toBeGreaterThan(0);
    expect(codes(graph, -3)).toEqual([]);
  });

  it("draws a 'one of' group around alternatives (ECE427)", () => {
    const graph = buildFocusGraph("ECE427", mockCourses, unlocksOf(mockCourses));
    expect(graph.groups).toHaveLength(1);
    const group = graph.groups[0];
    expect(group.column).toBe(-1);
    const members = group.nodeIds.map(
      (id) => graph.nodes.find((n) => n.id === id)?.code
    );
    expect(members).toEqual(["ECE318", "ECE320"]);
    // one edge from the box to the course, none from the options
    expect(graph.edges.filter((e) => e.to === "0:ECE427")).toEqual([
      { from: group.id, to: "0:ECE427", kind: "preq" },
    ]);
  });

  it("makes a code that is not in the list a leaf", () => {
    const courses: CourseList = { A: { name: "a", preq: ["MIE286"] } };
    const graph = buildFocusGraph("A", courses, unlocksOf(courses));
    const external = graph.nodes.find((n) => n.code === "MIE286");
    expect(external).toMatchObject({ inList: false, column: -1 });
    expect(graph.nodes).toHaveLength(2);
  });

  it("respects the depth limits", () => {
    const courses: CourseList = {
      A: { name: "a" },
      B: { name: "b", preq: ["A"] },
      C: { name: "c", preq: ["B"] },
      D: { name: "d", preq: ["C"] },
    };
    const graph = buildFocusGraph("B", courses, unlocksOf(courses), { up: 1, down: 1 });
    expect(graph.nodes.map((n) => n.code).sort()).toEqual(["A", "B", "C"]);
    const deep = buildFocusGraph("A", courses, unlocksOf(courses), { down: 5 });
    expect(deep.nodes.map((n) => n.code)).toEqual(["A", "B", "C", "D"]);
  });

  it("ends on a cycle", () => {
    const courses: CourseList = {
      A: { name: "a", preq: ["B"] },
      B: { name: "b", preq: ["A"] },
    };
    const graph = buildFocusGraph("A", courses, unlocksOf(courses), { up: 5, down: 5 });
    // B is both a prerequisite (left) and unlocked by A (right), once each
    expect(graph.nodes.map((n) => [n.code, n.column])).toEqual([
      ["A", 0],
      ["B", -1],
      ["B", 1],
    ]);
    expect(graph.edges).toHaveLength(2);
  });

  it("returns just the course when it has no links", () => {
    const courses: CourseList = { A: { name: "a" } };
    const graph = buildFocusGraph("A", courses, unlocksOf(courses));
    expect(graph.nodes).toHaveLength(1);
    expect(graph.edges).toEqual([]);
    expect(graph.groups).toEqual([]);
  });

  it("gives unique ids when a course repeats", () => {
    const courses: CourseList = {
      A: { name: "a" },
      B: { name: "b", preq: ["A"] },
      C: { name: "c", preq: ["A"] },
      D: { name: "d", preq: ["B", "C"] },
    };
    const graph = buildFocusGraph("D", courses, unlocksOf(courses));
    const as = graph.nodes.filter((n) => n.code === "A");
    expect(as).toHaveLength(2);
    expect(new Set(graph.nodes.map((n) => n.id)).size).toBe(graph.nodes.length);
  });

  it("marks corequisite edges", () => {
    const courses: CourseList = { A: { name: "a" }, B: { name: "b", coreq: ["A"] } };
    const graph = buildFocusGraph("B", courses, unlocksOf(courses));
    expect(graph.edges[0].kind).toBe("coreq");
  });
});

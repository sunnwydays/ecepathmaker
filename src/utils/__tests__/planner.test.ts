import mockCourses from "../../data/mockCourses";
import { curricula } from "../../requirements/curricula";
import { emptyGrid } from "../emptyGrid";
import { CoursesOnGrid } from "../../types/types";
import { parsePlan } from "../planner/parsePlan";
import { applyPlan } from "../planner/applyPlan";
import { buildPrompt, PlannerAnswers } from "../planner/buildPrompt";

const [pre2026, ele2026] = curricula;

describe("parsePlan", () => {
  it("reads a plain block", () => {
    expect(
      parsePlan("3F: ECE302, ECE345\n3S: ECE311\n4F: ECE496\n4S: ECE497")
    ).toEqual({
      "3F": ["ECE302", "ECE345"],
      "3S": ["ECE311"],
      "4F": ["ECE496"],
      "4S": ["ECE497"],
    });
  });

  it("finds the plan in a whole reply with prose, bullets and bold labels", () => {
    const reply = [
      "Here is a plan. ECE302 is a good start.",
      "",
      "```",
      "3F: ECE302, ECE345",
      "```",
      "- **3S** - ECE311, ECE342",
      "> `4F`: ECE496",
      "| 4S: ECE497 |",
      "Remember to check with your advisor.",
    ].join("\n");
    expect(parsePlan(reply)).toEqual({
      "3F": ["ECE302", "ECE345"],
      "3S": ["ECE311", "ECE342"],
      "4F": ["ECE496"],
      "4S": ["ECE497"],
    });
  });

  it("strips the section suffix from a code", () => {
    expect(parsePlan("3F: ECE302H1")).toEqual({ "3F": ["ECE302"] });
  });

  it("accepts lower case labels and codes and drops repeats", () => {
    expect(parsePlan("3f: ece302, ECE302, ece345")).toEqual({
      "3F": ["ECE302", "ECE345"],
    });
  });

  it("keeps the first line for each term", () => {
    expect(parsePlan("3F: ECE302\n3F: ECE345\n3S: ECE311")).toEqual({
      "3F": ["ECE302"],
      "3S": ["ECE311"],
    });
  });

  it("treats a term with no codes as present and empty", () => {
    expect(parsePlan("3F: (empty)")).toEqual({ "3F": [] });
  });

  it("returns an empty object when there is no plan", () => {
    expect(parsePlan("Take ECE302 in the fall.")).toEqual({});
  });
});

describe("applyPlan", () => {
  const courses = mockCourses;

  it("places courses in order from the first slot", () => {
    const result = applyPlan({
      plan: { "3F": ["ECE302", "ECE345"], "3S": ["ECE311"] },
      courses,
      coursesOnGrid: emptyGrid,
    });
    expect(result.coursesOnGrid["3F.1"]).toBe("ECE302");
    expect(result.coursesOnGrid["3F.2"]).toBe("ECE345");
    expect(result.coursesOnGrid["3S.1"]).toBe("ECE311");
    expect(result.placed).toBe(3);
    expect(result.warnings).toEqual([]);
  });

  it("keeps terms that are not in the plan and clears those that are", () => {
    const grid: CoursesOnGrid = {
      ...emptyGrid,
      "XX.1": "ECE334",
      "3F.1": "ECE302",
      "3F.2": "ECE345",
    };
    const result = applyPlan({
      plan: { "3F": ["ECE311"] },
      courses,
      coursesOnGrid: grid,
    });
    expect(result.coursesOnGrid["XX.1"]).toBe("ECE334");
    expect(result.coursesOnGrid["3F.1"]).toBe("ECE311");
    expect(result.coursesOnGrid["3F.2"]).toBe("");
    expect(result.coursesUsed.ECE334).toBe("XX.1");
    expect(result.coursesUsed.ECE302).toBe("");
  });

  it("warns about an unknown code, a duplicate and a seventh course", () => {
    const result = applyPlan({
      plan: {
        "3F": [
          "ECE302", "ECE345", "ECE311", "ECE334", "ECE316", "ECE344", "ECE361",
        ],
        "3S": ["ECE302", "ZZZ999"],
      },
      courses,
      coursesOnGrid: emptyGrid,
    });
    expect(result.coursesOnGrid["3F.6"]).toBe("ECE344");
    expect(result.warnings).toEqual([
      "3F is full, ECE361 was left out",
      "ECE302 is already in 3F",
      "ZZZ999 is not in your course list (add it as a custom course in the Maker, then load again)",
    ]);
    expect(result.placed).toBe(6);
  });

  it("warns about a course in the wrong term or before its prerequisites", () => {
    const result = applyPlan({
      plan: { "3F": ["ECE410"], "3S": ["ECE311"], "4S": ["ECE444"] },
      courses,
      coursesOnGrid: emptyGrid,
    });
    expect(result.placed).toBe(3);
    expect(result.warnings).toEqual([
      "ECE410 is in 3F without its prerequisites or corequisites in time",
      "ECE444 is F only but is in 4S",
    ]);
  });

  it("builds coursesUsed and dependencies", () => {
    const result = applyPlan({
      plan: { "3F": ["ECE302"], "3S": ["ECE421"] },
      courses,
      coursesOnGrid: emptyGrid,
    });
    expect(result.coursesUsed.ECE421).toBe("3S.1");
    expect(result.coursesUsed.ECE302).toBe("3F.1");
    expect(result.coursesUsed.ECE345).toBe("");
    expect(Object.keys(result.coursesUsed).sort()).toEqual(
      Object.keys(courses).sort()
    );
    expect(result.dependencies.get("ECE302")).toEqual(new Set(["ECE421"]));
  });

  it("does not mutate its inputs", () => {
    const grid: CoursesOnGrid = { ...emptyGrid, "3F.1": "ECE302" };
    const gridCopy = JSON.stringify(grid);
    const coursesCopy = JSON.stringify(courses);
    applyPlan({ plan: { "3F": ["ECE421"] }, courses, coursesOnGrid: grid });
    expect(JSON.stringify(grid)).toBe(gridCopy);
    expect(JSON.stringify(courses)).toBe(coursesCopy);
  });
});

describe("buildPrompt", () => {
  const blank: PlannerAnswers = {
    interests: [],
    interestNotes: "",
    designation: "none",
    includeGrid: false,
    lockedTerms: [],
    taken: "",
    mustTake: "",
    avoid: "",
    notes: "",
  };
  const build = (
    curriculum = pre2026,
    answers: Partial<PlannerAnswers> = {},
    coursesOnGrid: CoursesOnGrid = emptyGrid
  ) =>
    buildPrompt({
      answers: { ...blank, ...answers },
      courses: mockCourses,
      coursesOnGrid,
      curriculum,
    });

  it.each(curricula.map((c) => [c.id, c] as const))(
    "contains every requirement of %s",
    (_id, curriculum) => {
      const prompt = build(curriculum);
      expect(prompt).toContain(`## Graduation requirements (${curriculum.label})`);
      curriculum.requirements.forEach((rule) => {
        expect(prompt).toContain(`- ${rule.label}: ${rule.tooltip}`);
      });
      expect(prompt).toContain(curriculum.manualChecks);
    }
  );

  it("writes exact catalogue lines for the pre-2026 curriculum", () => {
    const lines = build(pre2026).split("\n");
    expect(lines).toContain(
      "ECE335 | Introduction to Electronic Devices | Area 1 kernel | F only | -"
    );
    expect(lines).toContain(
      "ECE427 | Photonic Devices | Area 1 | F only | - | prereq: (ECE318 or ECE320)"
    );
    expect(lines).toContain(
      "ECE302 | Probability and Applications | Areas 4, 5 | F or S | Sci/Math"
    );
  });

  it("writes group from membership for a 2026 curriculum", () => {
    const lines = build(ele2026).split("\n");
    expect(lines).toContain(
      "ECE335 | Introduction to Electronic Devices | Group A kernel | F only | -"
    );
    expect(lines).toContain(
      "ECE302 | Probability and Applications | Group B kernel | F or S | Sci/Math"
    );
    expect(build(ele2026)).toContain("## Groups\n- Group A: devices");
  });

  it("drops prerequisites that core courses already meet", () => {
    const line = build()
      .split("\n")
      .find((l) => l.startsWith("ECE435 | "));
    expect(line).toContain(
      "prereq: (ECE302 or MIE286) and (ECE335 or ECE350) and (ECE320 or ECE357)"
    );
    expect(line).not.toContain("ECE216");
    expect(line).not.toContain("ECE231");
  });

  it("writes a coreq field", () => {
    expect(build().split("\n")).toContain(
      "ECE361 | Computer Networks I | Area 5 kernel | F or S | - | coreq: ECE302"
    );
  });

  it("always says what was taken before third year", () => {
    expect(build()).toContain(
      "- Taken before third year (XX): nothing beyond the first- and second-year core, so 0 courses toward the 20 and 0 CS/HSS electives so far"
    );
    expect(build(pre2026, { taken: "JRE300" })).toContain(
      "): JRE300. Nothing else beyond"
    );
    const grid = { ...emptyGrid, "XX.1": "ECE302" };
    expect(build(pre2026, { includeGrid: true }, grid)).not.toContain(
      "Taken before third year"
    );
  });

  it("leaves out empty answers", () => {
    const prompt = build();
    expect(prompt).not.toContain("Must take");
    expect(prompt).not.toContain("Avoid:");
    expect(prompt).not.toContain("Other notes");
    expect(build(pre2026, { mustTake: "ECE345" })).toContain(
      "- Must take: ECE345"
    );
  });

  it("names the interests with hints", () => {
    expect(build(pre2026, { interests: ["5", "6"] })).toContain(
      "- Interested in: Area 5 (Computer Hardware and Computer Networks), Area 6 (Software)"
    );
  });

  it("includes the grid only with includeGrid and a non-empty grid", () => {
    const grid: CoursesOnGrid = { ...emptyGrid, "3F.1": "ECE302", "XX.1": "ECE334" };
    expect(build(pre2026, { includeGrid: true }, grid)).toContain(
      "## My current grid\nXX: ECE334\n3F: ECE302\n3S: (empty)"
    );
    expect(build(pre2026, { includeGrid: false }, grid)).not.toContain(
      "## My current grid"
    );
    expect(build(pre2026, { includeGrid: true })).not.toContain(
      "## My current grid"
    );
  });

  it("names the locked terms", () => {
    const grid: CoursesOnGrid = { ...emptyGrid, "3F.1": "ECE302" };
    expect(
      build(pre2026, { includeGrid: true, lockedTerms: ["3F", "3S"] }, grid)
    ).toContain("Keep these terms exactly as they are: 3F, 3S.");
  });

  it("only states a designation goal for the derived curriculum", () => {
    expect(build(pre2026, { designation: "CE" })).toContain(
      "- Goal: graduate as Computer engineering"
    );
    expect(build(ele2026, { designation: "CE" })).not.toContain("Goal:");
    expect(build(ele2026)).toContain(
      "This curriculum is the Electrical Engineering program."
    );
  });
});

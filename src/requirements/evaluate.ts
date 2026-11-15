import {
  CourseCardPropsWithoutCode,
  CourseList,
  CoursesOnGrid,
  CoursesUsed,
} from "../types/types";
import {
  Curriculum,
  CourseFlag,
  Designation,
  EvaluationResult,
  RequirementResult,
  Rule,
  Selector,
} from "./types";

type Course = CourseCardPropsWithoutCode | undefined;

export function getMembership(
  curriculum: Curriculum,
  code: string,
  course: Course
): { groups: string[]; kernel: boolean } {
  if (curriculum.membership) {
    const entry = curriculum.membership[code];
    return entry
      ? { groups: [entry.group], kernel: entry.kernel === true }
      : { groups: [], kernel: false };
  }
  if (!course) return { groups: [], kernel: false };
  return {
    groups: (course.streams || []).map(String),
    kernel: course.kernel || false,
  };
}

export function hasFlag(
  curriculum: Curriculum,
  flag: CourseFlag,
  code: string,
  course: Course
): boolean {
  const override = curriculum.flagOverrides?.[flag];
  if (override?.include.includes(code)) return true;
  if (override?.exclude.includes(code)) return false;
  return Boolean(course?.[flag]);
}

export function evaluate(
  curriculum: Curriculum,
  input: {
    courses: CourseList;
    coursesOnGrid: CoursesOnGrid;
    coursesUsed: CoursesUsed;
  }
): EvaluationResult {
  const { courses, coursesOnGrid, coursesUsed } = input;
  const gridCourses = Object.values(coursesOnGrid).filter(
    (code) => code !== ""
  );

  const matches = (selector: Selector, code: string): boolean => {
    const course = courses[code];
    if ("flag" in selector) {
      return hasFlag(curriculum, selector.flag, code, course);
    }
    const { groups, kernel } = getMembership(curriculum, code, course);
    const inGroup =
      selector.group === "any"
        ? groups.length > 0
        : groups.includes(selector.group);
    return inGroup && (!selector.kernel || kernel);
  };

  // Group counts (declared groups only)
  const groupCounts: Record<string, number> = {};
  curriculum.groups.forEach((g) => (groupCounts[g.id] = 0));
  // Tally for depth/breadth analysis (any group id, even undeclared ones).
  // A plain object keyed by group id keeps integer-like ids in ascending order.
  const tally: Record<string, { count: number; hasKernel: boolean }> = {};
  gridCourses.forEach((code) => {
    const { groups, kernel } = getMembership(curriculum, code, courses[code]);
    groups.forEach((g) => {
      if (g in groupCounts) groupCounts[g]++;
      if (!tally[g]) tally[g] = { count: 0, hasKernel: false };
      tally[g].count++;
      if (kernel) tally[g].hasKernel = true;
    });
  });

  // Area analysis
  const depthRule = curriculum.requirements.find(
    (r): r is Extract<Rule, { type: "areaDepth" }> => r.type === "areaDepth"
  );
  let depthGroups: string[] = [];
  let breadthGroups: string[] = [];
  if (depthRule) {
    depthGroups = Object.entries(tally)
      .filter(([, i]) => i.count >= depthRule.perArea && i.hasKernel)
      .map(([g]) => g);
    breadthGroups = Object.entries(tally)
      .filter(
        ([g, i]) => i.count >= 1 && i.hasKernel && !depthGroups.includes(g)
      )
      .map(([g]) => g);
  }

  // Slot assignment (Kuhn's algorithm) across all "slots" rules
  const slots: { ruleIndex: number; selector: Selector }[] = [];
  curriculum.requirements.forEach((rule, ruleIndex) => {
    if (rule.type !== "slots") return;
    rule.pools.forEach((pool) => {
      for (let i = 0; i < pool.count; i++) {
        slots.push({ ruleIndex, selector: pool.where });
      }
    });
  });
  const owner = new Map<string, number>(); // course code -> slot index
  const tryFill = (slot: number, visited: Set<string>): boolean => {
    for (const code of gridCourses) {
      if (visited.has(code) || !matches(slots[slot].selector, code)) continue;
      visited.add(code);
      const current = owner.get(code);
      if (current === undefined || tryFill(current, visited)) {
        owner.set(code, slot);
        return true;
      }
    }
    return false;
  };
  slots.forEach((_, slot) => tryFill(slot, new Set()));
  const slotsNeeded: Record<number, number> = {};
  const slotsFilled: Record<number, number> = {};
  slots.forEach((s) => {
    slotsNeeded[s.ruleIndex] = (slotsNeeded[s.ruleIndex] || 0) + 1;
  });
  owner.forEach((slot) => {
    const r = slots[slot].ruleIndex;
    slotsFilled[r] = (slotsFilled[r] || 0) + 1;
  });

  const isCapstone = (a: string, b: string, year: string): boolean =>
    gridCourses.includes(a) &&
    gridCourses.includes(b) &&
    coursesUsed[a][0] === year &&
    coursesUsed[b][0] === year &&
    coursesUsed[a][1] !== coursesUsed[b][1];

  const results: RequirementResult[] = curriculum.requirements.map(
    (rule, index) => {
      let have = 0;
      let need = 0;
      let met = false;
      switch (rule.type) {
        case "count":
          have = gridCourses.filter((c) => matches(rule.where, c)).length;
          need = rule.min;
          met = have >= need;
          break;
        case "courses":
          have = rule.anyOf.some((c) => gridCourses.includes(c)) ? 1 : 0;
          need = 1;
          met = have >= need;
          break;
        case "capstone":
          met = rule.pairs.some(([a, b]) => isCapstone(a, b, rule.year));
          have = met ? 1 : 0;
          need = 1;
          break;
        case "areaDepth":
          have = depthGroups.length;
          need = rule.minAreas;
          met = have >= need;
          break;
        case "areaBreadth": {
          const depthMin = depthRule?.minAreas ?? 0;
          have =
            breadthGroups.length + Math.max(0, depthGroups.length - depthMin);
          need = rule.minAreas;
          met = have >= need;
          break;
        }
        case "slots":
          have = slotsFilled[index] || 0;
          need = slotsNeeded[index] || 0;
          met = have === need;
          break;
      }
      return {
        id: rule.id,
        label: rule.label,
        tooltip: rule.tooltip,
        section: rule.section,
        met,
        have,
        need,
      };
    }
  );

  const metByType = (type: Rule["type"]) =>
    curriculum.requirements.every(
      (rule, i) => rule.type !== type || results[i].met
    ) && curriculum.requirements.some((rule) => rule.type === type);

  let designation: Designation | null = null;
  if (curriculum.designation.type === "fixed") {
    designation = curriculum.designation.value;
  } else if (metByType("areaDepth") && metByType("areaBreadth")) {
    const computer = curriculum.designation.computerGroups;
    const numCEDepth = depthGroups.filter((g) => computer.includes(g)).length;
    const numEEDepth = depthGroups.length - numCEDepth;
    const numCEBreadth = breadthGroups.filter((g) =>
      computer.includes(g)
    ).length;
    const numEEBreadth = breadthGroups.length - numCEBreadth;

    // Logic can't be based only on count due to possibility of many EE
    // depths and need to differentiate depth and breadth
    const countCE = numCEDepth * 3 + numCEBreadth;
    if (countCE >= 4) {
      if (numEEDepth === 0) designation = "CE";
      else if (numEEDepth === 1) {
        // 0 EE breadth not possible
        designation = numEEBreadth === 1 ? "CE" : "ECE";
      } else designation = "ECE";
    } else {
      designation = "EE";
    }
  }

  return {
    curriculumId: curriculum.id,
    results,
    groupCounts,
    depthGroups,
    breadthGroups,
    designation,
    graduates: results.every((r) => r.met),
  };
}

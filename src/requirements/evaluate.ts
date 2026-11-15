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
    if (entry) return { groups: [entry.group], kernel: entry.kernel === true };
    // The official list wins; a custom course may carry its own group
    if (course?.group && curriculum.groups.some((g) => g.id === course.group)) {
      return { groups: [course.group], kernel: false };
    }
    return { groups: [], kernel: false };
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

// All `size`-element subsets of `items`, keeping their order.
function subsets(items: string[], size: number): string[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [first, ...rest] = items;
  return [
    ...subsets(rest, size - 1).map((s) => [first, ...s]),
    ...subsets(rest, size),
  ];
}

type Slot = { ruleIndex: number; selector: Selector; area?: string };

export function evaluate(
  curriculum: Curriculum,
  input: {
    courses: CourseList;
    coursesOnGrid: CoursesOnGrid;
    coursesUsed: CoursesUsed;
  }
): EvaluationResult {
  const { courses, coursesOnGrid, coursesUsed } = input;
  // Extra (EXT) courses are not for degree credit, so no rule sees them.
  const gridCourses = Object.values(coursesOnGrid).filter(
    (code) => code !== "" && !courses[code]?.isExtra
  );

  // Membership per course, looked up once.
  const membershipOf = new Map<string, { groups: string[]; kernel: boolean }>();
  gridCourses.forEach((code) => {
    if (!membershipOf.has(code)) {
      membershipOf.set(code, getMembership(curriculum, code, courses[code]));
    }
  });

  const matches = (selector: Selector, code: string): boolean => {
    if ("flag" in selector) {
      return hasFlag(curriculum, selector.flag, code, courses[code]);
    }
    const { groups, kernel } = membershipOf.get(code)!;
    const inGroup =
      selector.group === "any"
        ? groups.length > 0
        : groups.includes(selector.group);
    return inGroup && (!selector.kernel || kernel);
  };

  // Group counts (declared groups only)
  const groupCounts: Record<string, number> = {};
  curriculum.groups.forEach((g) => (groupCounts[g.id] = 0));
  // Every group id on the grid, even undeclared ones (a custom course or an
  // old layout may carry stream 7), and whether it has a kernel course. A
  // plain object keyed by group id keeps integer-like ids in ascending order.
  const tally: Record<string, { hasKernel: boolean }> = {};
  gridCourses.forEach((code) => {
    const { groups, kernel } = membershipOf.get(code)!;
    groups.forEach((g) => {
      if (g in groupCounts) groupCounts[g]++;
      if (!tally[g]) tally[g] = { hasKernel: false };
      if (kernel) tally[g].hasKernel = true;
    });
  });
  const areas = Object.keys(tally);

  // Exclusive rules: areaBreadth, areaDepth and every "slots" rule share one
  // pool, so each course fills at most one slot among them.
  const breadthIndex = curriculum.requirements.findIndex(
    (r) => r.type === "areaBreadth"
  );
  const depthIndex = curriculum.requirements.findIndex(
    (r) => r.type === "areaDepth"
  );
  const breadthRule = curriculum.requirements[breadthIndex] as
    | Extract<Rule, { type: "areaBreadth" }>
    | undefined;
  const depthRule = curriculum.requirements[depthIndex] as
    | Extract<Rule, { type: "areaDepth" }>
    | undefined;
  const hasAreaRules = breadthRule !== undefined || depthRule !== undefined;

  // Slots that do not depend on the choice of areas, in rule then pool order.
  const fixedSlots: Slot[] = [];
  curriculum.requirements.forEach((rule, ruleIndex) => {
    if (rule.type !== "slots") return;
    rule.pools.forEach((pool) => {
      for (let i = 0; i < pool.count; i++) {
        fixedSlots.push({ ruleIndex, selector: pool.where });
      }
    });
  });
  // Rules in the order their slots are filled, for comparing choices.
  const exclusiveOrder = [
    ...(breadthRule ? [breadthIndex] : []),
    ...(depthRule ? [depthIndex] : []),
    ...curriculum.requirements.flatMap((r, i) =>
      r.type === "slots" ? [i] : []
    ),
  ];

  const slotsNeeded: Record<number, number> = {};
  fixedSlots.forEach((s) => {
    slotsNeeded[s.ruleIndex] = (slotsNeeded[s.ruleIndex] || 0) + 1;
  });
  if (breadthRule) slotsNeeded[breadthIndex] = breadthRule.kernelAreas;
  if (depthRule) {
    slotsNeeded[depthIndex] = depthRule.depthAreas * depthRule.perArea;
  }

  // Fills the slots in order with Kuhn's algorithm. Augmenting paths never
  // empty a filled slot, so earlier slots win: the result fills as many
  // slots as possible, preferring earlier ones.
  const fillSlots = (slots: Slot[]): (string | undefined)[] => {
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
    const filledBy: (string | undefined)[] = slots.map(() => undefined);
    owner.forEach((slot, code) => (filledBy[slot] = code));
    return filledBy;
  };

  // A choice of areas: K = the breadth areas (one kernel each), D = the depth
  // areas within K (`perArea` more courses each). Every choice is tried and
  // the best fill kept; six areas give at most 15 x 6 = 90 choices. With
  // fewer kernel areas than needed, K is all of them (the rest stay unmet).
  const kernelAreas = areas.filter((g) => tally[g].hasKernel);
  const choices: { K: string[]; D: string[] }[] = [];
  if (hasAreaRules) {
    const kSize = Math.min(breadthRule?.kernelAreas ?? 0, kernelAreas.length);
    subsets(kernelAreas, kSize).forEach((K) => {
      const dSize = Math.min(depthRule?.depthAreas ?? 0, K.length);
      subsets(K, dSize).forEach((D) => choices.push({ K, D }));
    });
  } else {
    choices.push({ K: [], D: [] });
  }

  type Outcome = {
    K: string[];
    D: string[];
    slots: Slot[];
    filledBy: (string | undefined)[];
    filled: Record<number, number>;
  };
  const outcomes: Outcome[] = choices.map(({ K, D }) => {
    const slots: Slot[] = [
      ...K.map((area) => ({
        ruleIndex: breadthIndex,
        selector: { group: area, kernel: true as const },
        area,
      })),
      ...D.flatMap((area) =>
        Array.from({ length: depthRule?.perArea ?? 0 }, () => ({
          ruleIndex: depthIndex,
          selector: { group: area },
          area,
        }))
      ),
      ...fixedSlots,
    ];
    const filledBy = fillSlots(slots);
    const filled: Record<number, number> = {};
    filledBy.forEach((code, slot) => {
      if (code === undefined) return;
      const r = slots[slot].ruleIndex;
      filled[r] = (filled[r] || 0) + 1;
    });
    return { K, D, slots, filledBy, filled };
  });

  // Best choice: most breadth slots filled, then depth, then each "slots"
  // rule in order. The first of equals wins, so the result is deterministic.
  const better = (a: Outcome, b: Outcome): boolean => {
    for (const r of exclusiveOrder) {
      const diff = (a.filled[r] || 0) - (b.filled[r] || 0);
      if (diff !== 0) return diff > 0;
    }
    return false;
  };
  const best = outcomes.reduce((acc, o) => (better(o, acc) ? o : acc));
  const slotsFilled = best.filled;

  // Choices that meet breadth and depth. Science/math and electives are left
  // out on purpose: the calendar defines the designation from these alone.
  const areaRulesMet = (o: Outcome) =>
    hasAreaRules &&
    (!breadthRule ||
      (o.filled[breadthIndex] || 0) === slotsNeeded[breadthIndex]) &&
    (!depthRule || (o.filled[depthIndex] || 0) === slotsNeeded[depthIndex]);
  const valid = outcomes.filter(areaRulesMet);

  const inAreaOrder = (set: Set<string>) => areas.filter((g) => set.has(g));
  let depthGroups: string[] = [];
  let breadthGroups: string[] = [];
  if (valid.length > 0) {
    const depth = new Set(valid.flatMap((o) => o.D));
    const kernel = new Set(valid.flatMap((o) => o.K));
    depthGroups = inAreaOrder(depth);
    breadthGroups = inAreaOrder(kernel).filter((g) => !depth.has(g));
  } else if (hasAreaRules) {
    // Best partial choice: a kernel area counts once its kernel slot is
    // filled, a depth area once its kernel and all its depth slots are.
    const full = (area: string, ruleIndex: number) =>
      best.slots.every(
        (s, i) =>
          s.area !== area ||
          s.ruleIndex !== ruleIndex ||
          best.filledBy[i] !== undefined
      );
    const kernel = new Set(best.K.filter((g) => full(g, breadthIndex)));
    const depth = new Set(
      best.D.filter((g) => kernel.has(g) && full(g, depthIndex))
    );
    depthGroups = inAreaOrder(depth);
    breadthGroups = inAreaOrder(kernel).filter((g) => !depth.has(g));
  }

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
        case "maxCourses":
          have = gridCourses.length;
          need = rule.max;
          met = have <= need;
          break;
        case "areaBreadth":
        case "areaDepth":
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
        ...(rule.showProgress && { showProgress: true as const }),
        met,
        have,
        need,
      };
    }
  );

  let designation: Designation | null = null;
  if (curriculum.designation.type === "fixed") {
    designation = curriculum.designation.value;
  } else if (valid.length > 0) {
    // Each course counts in the group of the slot it fills, so the number of
    // computer courses depends only on K and D.
    const { computerGroups, ceMin, eeMin } = curriculum.designation;
    const perArea = depthRule?.perArea ?? 0;
    const total =
      (slotsNeeded[breadthIndex] ?? 0) + (slotsNeeded[depthIndex] ?? 0);
    let ce = false;
    let ee = false;
    valid.forEach(({ K, D }) => {
      const computer =
        K.filter((g) => computerGroups.includes(g)).length +
        perArea * D.filter((g) => computerGroups.includes(g)).length;
      if (computer >= ceMin) ce = true;
      if (total - computer >= eeMin) ee = true;
    });
    designation = ce && ee ? "ECE" : ce ? "CE" : ee ? "EE" : null;
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

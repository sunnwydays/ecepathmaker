// A curriculum is a set of graduation rules stored as data. `evaluate` (in
// evaluate.ts) is the only code that interprets it. Minors, certificates and
// other disciplines can later be added as more Curriculum objects.

export type CourseFlag = "isCS" | "isHSS" | "isSciMath";

// Picks courses on the grid.
// - flag: the course has that flag (after the curriculum's flag overrides)
// - group: the course belongs to that group, or to any group with "any";
//   with `kernel`, it must also be a kernel course
export type Selector =
  | { flag: CourseFlag }
  | { group: string; kernel?: true };

export type RuleSection = "basics" | "groups";

interface RuleBase {
  id: string;
  label: string;
  tooltip: string;
  section: RuleSection;
  // Show "(have/need)" after the tick or cross.
  showProgress?: true;
}

export type Rule = RuleBase &
  (
    | // At least `min` matching courses. A course may also count elsewhere.
      { type: "count"; where: Selector; min: number }
    | // At least one of these course codes is on the grid.
      { type: "courses"; anyOf: string[] }
    | // Both halves of one pair, both in the given year, in different terms.
      { type: "capstone"; pairs: [string, string][]; year: string }
    | // Pre-2026 depth: `minAreas` groups that each have `perArea` courses
      // including a kernel.
      { type: "areaDepth"; minAreas: number; perArea: number }
    | // Pre-2026 breadth: `minAreas` other groups with a kernel course. Depth
      // groups beyond the areaDepth minimum also count.
      { type: "areaBreadth"; minAreas: number }
    | // Exclusive slots: each course fills at most one slot across ALL "slots"
      // rules of the curriculum. Slots are filled in rule order, then pool
      // order, so a shortage shows up in the later rules.
      { type: "slots"; pools: { where: Selector; count: number }[] }
  );

export interface GroupDef {
  id: string; // "1".."6" or "A", "B", "C"
  label: string;
  color: string; // card colour, with leading #
  chartColor: string; // bar chart colour, with leading #
}

export type Designation = "CE" | "EE" | "ECE";

export interface Curriculum {
  id: string;
  label: string; // shown in the curriculum picker
  groups: GroupDef[];
  // Which group each course is in. When omitted, membership is read from the
  // course itself (`streams` and `kernel`), which is how saved layouts and
  // custom courses carry it for the pre-2026 curriculum.
  membership?: Record<string, { group: string; kernel?: true }>;
  // Per-curriculum corrections to a course flag, applied on top of the flag
  // stored on the course.
  flagOverrides?: Partial<
    Record<CourseFlag, { include: string[]; exclude: string[] }>
  >;
  requirements: Rule[];
  // "derived": worked out from the depth and breadth groups (pre-2026).
  // "fixed": the program the student is registered in.
  designation:
    | { type: "derived"; computerGroups: string[] }
    | { type: "fixed"; value: Designation };
  // Things the app does not check, shown under the result.
  manualChecks: string;
}

export interface RequirementResult {
  id: string;
  label: string;
  tooltip: string;
  section: RuleSection;
  showProgress?: true;
  met: boolean;
  have: number;
  need: number;
}

export interface EvaluationResult {
  curriculumId: string;
  results: RequirementResult[];
  // Courses on the grid per group, one key for every group in the curriculum.
  groupCounts: Record<string, number>;
  // Only filled when the curriculum has areaDepth / areaBreadth rules.
  depthGroups: string[];
  breadthGroups: string[];
  designation: Designation | null;
  graduates: boolean; // every requirement is met
}

import { CourseCardPropsWithoutCode, CourseList } from "../types/types";

export type EdgeKind = "preq" | "coreq"; // later: "related"

// One requirement of a course: a single course, or "one of" several
export interface Requirement {
  kind: EdgeKind;
  options: string[]; // length 1 = required, more = one of
}

export interface Unlock {
  code: string;
  kind: EdgeKind;
}

type Reqs = Pick<CourseCardPropsWithoutCode, "preq" | "coreq">;

export const getRequirements = (course: Reqs | undefined): Requirement[] => {
  if (!course) return [];
  const result: Requirement[] = [];
  const add = (kind: EdgeKind, reqs?: (string | string[])[]) => {
    for (const req of reqs ?? []) {
      result.push({ kind, options: Array.isArray(req) ? req : [req] });
    }
  };
  add("preq", course.preq);
  add("coreq", course.coreq);
  return result;
};

// Reverse map over the whole course list: code -> courses that list it as a
// prerequisite or corequisite (including as an option of a "one of" group).
export const buildUnlocks = (courses: CourseList): Map<string, Unlock[]> => {
  const unlocks = new Map<string, Unlock[]>();
  for (const [code, course] of Object.entries(courses)) {
    for (const { kind, options } of getRequirements(course)) {
      for (const option of options) {
        const list = unlocks.get(option) ?? [];
        // a course may name the same code in both preq and coreq; keep each kind once
        if (!list.some((u) => u.code === code && u.kind === kind)) {
          list.push({ code, kind });
        }
        unlocks.set(option, list);
      }
    }
  }
  return unlocks;
};

export interface FocusNode {
  id: string; // unique in this graph
  code: string;
  column: number; // 0 = selected, negative = upstream, positive = downstream
  inList: boolean; // false for codes missing from `courses`
}

// A "one of" box around alternative prerequisites
export interface FocusGroup {
  id: string;
  column: number;
  nodeIds: string[];
}

export interface FocusEdge {
  from: string; // node id or group id, always the left-hand end
  to: string; // node id
  kind: EdgeKind;
}

export interface FocusGraph {
  nodes: FocusNode[];
  groups: FocusGroup[];
  edges: FocusEdge[];
}

// The selected course in the middle, what it needs on the left (`up` levels)
// and what it unlocks on the right (`down` levels). A course that shows up
// twice gets two nodes: merging them is what makes lines cross.
export const buildFocusGraph = (
  code: string,
  courses: CourseList,
  unlocks: Map<string, Unlock[]>,
  { up = 2, down = 2 }: { up?: number; down?: number } = {}
): FocusGraph => {
  const nodes: FocusNode[] = [];
  const groups: FocusGroup[] = [];
  const edges: FocusEdge[] = [];

  const makeNode = (id: string, nodeCode: string, column: number) => {
    nodes.push({ id, code: nodeCode, column, inList: Boolean(courses[nodeCode]) });
  };

  const rootId = `0:${code}`;
  makeNode(rootId, code, 0);

  // `path` holds the codes between the selected course and this one
  const walkUp = (parentId: string, parentCode: string, level: number, path: string[]) => {
    if (level > up || !courses[parentCode]) return;
    getRequirements(courses[parentCode]).forEach(({ kind, options }, reqIndex) => {
      const column = -level;
      const usable = options.filter(
        (o) => o !== code && o !== parentCode && !path.includes(o)
      );
      if (!usable.length) return;
      const ids = usable.map((option) => {
        const id = `up:${parentId}/${reqIndex}:${option}`;
        makeNode(id, option, column);
        return { id, option };
      });
      if (ids.length > 1) {
        const groupId = `group:${parentId}/${reqIndex}`;
        groups.push({ id: groupId, column, nodeIds: ids.map((i) => i.id) });
        edges.push({ from: groupId, to: parentId, kind });
      } else {
        edges.push({ from: ids[0].id, to: parentId, kind });
      }
      for (const { id, option } of ids) {
        walkUp(id, option, level + 1, [...path, parentCode]);
      }
    });
  };

  const walkDown = (parentId: string, parentCode: string, level: number, path: string[]) => {
    if (level > down) return;
    const next = [...(unlocks.get(parentCode) ?? [])].sort((a, b) =>
      a.code.localeCompare(b.code)
    );
    for (const { code: childCode, kind } of next) {
      if (childCode === code || childCode === parentCode || path.includes(childCode))
        continue;
      const id = `down:${parentId}:${childCode}`;
      makeNode(id, childCode, level);
      edges.push({ from: parentId, to: id, kind });
      walkDown(id, childCode, level + 1, [...path, parentCode]);
    }
  };

  walkUp(rootId, code, 1, []);
  walkDown(rootId, code, 1, []);
  return { nodes, groups, edges };
};

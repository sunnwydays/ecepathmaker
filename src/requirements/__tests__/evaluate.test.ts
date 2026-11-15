import * as fs from 'fs';
import * as path from 'path';
import { evaluate, getMembership, hasFlag } from '../evaluate';
import { ecePre2026 } from '../curricula/ecePre2026';
import { ele2026, cpe2026 } from '../curricula/ece2026';
import { curricula, getCurriculum, DEFAULT_CURRICULUM_ID } from '../curricula';
import { Curriculum } from '../types';
import { emptyGrid } from '../../utils/emptyGrid';
import mockCourses from '../../data/mockCourses';
import {
  CourseCardPropsWithoutCode,
  CourseList,
  CoursesOnGrid,
  CoursesUsed,
  GridPosition,
  GridPositionBase,
} from '../../types/types';

// Expectations for the 2026 curricula come from the official calendar rules
// (3 main kernels + 1 Group B kernel, 2 + 2 depth, 3 technical electives,
// 1 science/math, each course counted once), not from the engine's output.

const SLOTS = Object.keys(emptyGrid) as GridPositionBase[];
const CAPSTONE_SLOTS: Record<string, GridPositionBase> = {
  ECE496: '4F.5',
  ECE497: '4S.5',
};
const FREE_SLOTS = SLOTS.filter((s) => s !== '4F.5' && s !== '4S.5');

const SCI_MATH_IN_GROUP = ['ECE302', 'ECE537', 'BME331', 'ECE368', 'ECE448', 'PHY358'];

// Courses only need a name plus flags: 2026 membership comes from the curriculum.
const makeCourse = (code: string): CourseCardPropsWithoutCode => {
  const course: CourseCardPropsWithoutCode = { name: code };
  if (SCI_MATH_IN_GROUP.includes(code)) course.isSciMath = true;
  if (code.startsWith('CS')) course.isCS = true;
  if (code.startsWith('HSS')) {
    course.isCS = true;
    course.isHSS = true;
  }
  return course;
};

// Places codes in order on free slots (capstone halves go to 4F.5 / 4S.5) and
// builds the matching courses / coursesUsed.
const build = (codes: string[], overrides: CourseList = {}) => {
  const courses: CourseList = {};
  const coursesOnGrid: CoursesOnGrid = { ...emptyGrid };
  const coursesUsed: CoursesUsed = {};
  let next = 0;
  codes.forEach((code) => {
    courses[code] = overrides[code] ?? makeCourse(code);
    const slot = CAPSTONE_SLOTS[code] ?? FREE_SLOTS[next++];
    coursesOnGrid[slot] = code;
    coursesUsed[code] = slot as GridPosition;
  });
  return { courses, coursesOnGrid, coursesUsed };
};

const run = (curriculum: Curriculum, codes: string[], overrides: CourseList = {}) =>
  evaluate(curriculum, build(codes, overrides));

const result = (r: ReturnType<typeof evaluate>, id: string) => {
  const found = r.results.find((x) => x.id === id);
  if (!found) throw new Error(`no result ${id}`);
  return found;
};

const BASICS = ['CS1', 'CS2', 'HSS1', 'HSS2', 'ECE472', 'ECE496', 'ECE497'];

// Valid Electrical plan: breadth 4, depth 4, technical electives 3, sci/math 1.
const EE_GROUP_COURSES = [
  'ECE313', 'ECE314', 'ECE318', 'ECE311', // breadth: 3 A kernels + B kernel
  'ECE330', 'ECE412', 'ECE410', 'ECE411', // depth: 2 A + 2 B
  'ECE422', 'ECE424', 'ECE427', // technical electives
];
const EE_PLAN = [...EE_GROUP_COURSES, 'ECE357', ...BASICS];

// Valid Computer plan.
const CE_GROUP_COURSES = [
  'ECE334', 'ECE342', 'ECE344', 'ECE316', // breadth: 3 C kernels + B kernel
  'ECE326', 'ECE419', 'ECE410', 'ECE411', // depth: 2 C + 2 B
  'ECE444', 'ECE454', 'ECE461', // technical electives
];
const CE_PLAN = [...CE_GROUP_COURSES, 'ECE357', ...BASICS];

const without = (codes: string[], ...remove: string[]) => codes.filter((c) => !remove.includes(c));
const swap = (codes: string[], from: string, to: string) => codes.map((c) => (c === from ? to : c));

describe('2026 curricula: complete valid plans', () => {
  it('a valid Electrical plan graduates with every requirement met and have === need', () => {
    const r = run(ele2026, EE_PLAN);
    expect(r.graduates).toBe(true);
    r.results.forEach((x) => {
      expect(x.met).toBe(true);
      expect(x.have).toBe(x.need);
    });
    expect(r.results.map((x) => x.id)).toEqual([
      'cs', 'hss', 'economics', 'capstone', 'breadth', 'depth', 'sciMath', 'techElectives',
    ]);
    expect(r.designation).toBe('EE');
    expect(r.curriculumId).toBe('ele-2026');
  });

  it('a valid Computer plan graduates with every requirement met and have === need', () => {
    const r = run(cpe2026, CE_PLAN);
    expect(r.graduates).toBe(true);
    r.results.forEach((x) => {
      expect(x.met).toBe(true);
      expect(x.have).toBe(x.need);
    });
    expect(r.designation).toBe('CE');
  });

  it('the Electrical plan fails breadth and depth under the Computer curriculum', () => {
    const r = run(cpe2026, EE_PLAN);
    expect(r.graduates).toBe(false);
    // slots: 3 C kernels + 1 B kernel (ECE311 only); 2 C + 2 B (ECE410, ECE411 only)
    expect(result(r, 'breadth')).toMatchObject({ met: false, have: 1, need: 4 });
    expect(result(r, 'depth')).toMatchObject({ met: false, have: 2, need: 4 });
    expect(r.designation).toBe('CE');
  });

  it('the Computer plan fails breadth and depth under the Electrical curriculum', () => {
    const r = run(ele2026, CE_PLAN);
    expect(result(r, 'breadth')).toMatchObject({ met: false, have: 1, need: 4 });
    expect(result(r, 'depth')).toMatchObject({ met: false, have: 2, need: 4 });
    expect(r.designation).toBe('EE');
  });
});

describe('2026 curricula: breadth and depth', () => {
  it('only 2 main-group kernels leaves breadth at 3 of 4', () => {
    const r = run(ele2026, swap(EE_PLAN, 'ECE314', 'ECE435'));
    expect(result(r, 'breadth')).toMatchObject({ met: false, have: 3, need: 4 });
    expect(result(r, 'depth').met).toBe(true);
    expect(result(r, 'techElectives').met).toBe(true);
    expect(r.graduates).toBe(false);
  });

  it('no Group B kernel leaves breadth at 3 of 4', () => {
    const r = run(ele2026, swap(EE_PLAN, 'ECE311', 'ECE417'));
    expect(result(r, 'breadth')).toMatchObject({ met: false, have: 3, need: 4 });
    expect(result(r, 'depth')).toMatchObject({ met: true, have: 4, need: 4 });
  });

  it('5 main-group courses but too few Group B courses leaves depth at 3 of 4', () => {
    // A: 3 kernels + 2 depth (+3 more A for technical electives); B: kernel + 1 other
    const plan = [
      'ECE313', 'ECE314', 'ECE318', 'ECE311', 'ECE330', 'ECE412', 'ECE410',
      'ECE422', 'ECE424', 'ECE427', 'ECE357', ...BASICS,
    ];
    const r = run(ele2026, plan);
    expect(result(r, 'breadth').met).toBe(true);
    expect(result(r, 'depth')).toMatchObject({ met: false, have: 3, need: 4 });
    expect(result(r, 'techElectives').met).toBe(true);
    expect(r.graduates).toBe(false);
  });

  it('extra kernels count as depth courses', () => {
    // A kernels 313/314/318 (breadth) + 320/331 (depth); B kernels 311 (breadth) + 316 (depth) + 410
    const plan = [
      'ECE313', 'ECE314', 'ECE318', 'ECE311', 'ECE320', 'ECE331', 'ECE316', 'ECE410',
      'ECE422', 'ECE424', 'ECE427', 'ECE357', ...BASICS,
    ];
    const r = run(ele2026, plan);
    expect(result(r, 'breadth')).toMatchObject({ met: true, have: 4, need: 4 });
    expect(result(r, 'depth')).toMatchObject({ met: true, have: 4, need: 4 });
    expect(r.graduates).toBe(true);
  });

  it('breadth is a kernel requirement: non-kernel main-group courses do not fill it', () => {
    const r = run(ele2026, ['ECE330', 'ECE412', 'ECE422', 'ECE424']);
    expect(result(r, 'breadth')).toMatchObject({ met: false, have: 0, need: 4 });
    expect(result(r, 'depth')).toMatchObject({ met: false, have: 2, need: 4 });
  });
});

describe('2026 curricula: technical electives', () => {
  it('exactly 11 group courses (4 + 4 + 3) passes technical electives', () => {
    const r = run(ele2026, EE_PLAN);
    expect(EE_GROUP_COURSES).toHaveLength(11);
    expect(result(r, 'techElectives')).toMatchObject({ met: true, have: 3, need: 3 });
  });

  it('10 group courses gives 2 of 3 technical electives', () => {
    const r = run(ele2026, without(EE_PLAN, 'ECE427'));
    expect(result(r, 'techElectives')).toMatchObject({ met: false, have: 2, need: 3 });
    expect(result(r, 'breadth').met).toBe(true);
    expect(result(r, 'depth').met).toBe(true);
    expect(r.graduates).toBe(false);
  });

  it('technical electives may come from any of the three groups', () => {
    // technical electives from A, B and C
    const plan = [
      'ECE313', 'ECE314', 'ECE318', 'ECE311', 'ECE330', 'ECE412', 'ECE410', 'ECE411',
      'ECE422', 'ECE417', 'ECE454', 'ECE357',
    ];
    expect(result(run(ele2026, plan), 'techElectives')).toMatchObject({ met: true, have: 3, need: 3 });
  });
});

describe('2026 curricula: custom courses with a group', () => {
  const custom = (group: string): CourseList => ({ XYZ123: { name: 'Custom', group } });

  it.each([ele2026, cpe2026])('a custom Group B course counts as a technical elective and for depth', (curriculum) => {
    const base = without(EE_PLAN, 'ECE427');
    const r = run(curriculum, [...base, 'XYZ123'], custom('B'));
    expect(result(r, 'techElectives')).toMatchObject({ met: true, have: 3, need: 3 });
    expect(r.groupCounts.B).toBe(run(curriculum, base).groupCounts.B + 1);
  });

  it('a custom course never fills a kernel slot of breadth', () => {
    const r = run(ele2026, without([...EE_PLAN, 'XYZ123'], 'ECE311'), custom('B'));
    expect(result(r, 'breadth').met).toBe(false);
  });
});

describe('2026 curricula: science/math is counted once (strict)', () => {
  // Only sci/math course is ECE302, which is also the only Group B kernel.
  const base = without(swap(EE_PLAN, 'ECE311', 'ECE302'), 'ECE357');

  it('ECE302 needed as the only B kernel does not also count as sci/math', () => {
    const r = run(ele2026, base);
    expect(result(r, 'breadth').met).toBe(true);
    expect(result(r, 'sciMath')).toMatchObject({ met: false, have: 0, need: 1 });
    expect(result(r, 'techElectives').met).toBe(true);
    expect(r.graduates).toBe(false);
  });

  it('becomes met when a second B kernel lets ECE302 move to sci/math', () => {
    // ECE302 is placed first so breadth seats it first and sci/math must re-seat it
    const plan = ['ECE302', ...without(base, 'ECE302'), 'ECE316'];
    const r = run(ele2026, plan);
    expect(result(r, 'breadth').met).toBe(true);
    expect(result(r, 'sciMath')).toMatchObject({ met: true, have: 1, need: 1 });
    expect(result(r, 'depth').met).toBe(true);
    expect(result(r, 'techElectives').met).toBe(true);
    expect(r.graduates).toBe(true);
  });

  it('becomes met when a group-less sci/math course is added', () => {
    const r = run(ele2026, [...base, 'ECE357']);
    expect(result(r, 'breadth').met).toBe(true);
    expect(result(r, 'sciMath')).toMatchObject({ met: true, have: 1, need: 1 });
    expect(r.graduates).toBe(true);
  });

  it('a surplus sci/math course that is in a group fills the sci/math slot while technical electives stay satisfied', () => {
    // ECE537 is a Group B course flagged sci/math; replaces ECE357
    const r = run(ele2026, swap(EE_PLAN, 'ECE357', 'ECE537'));
    expect(result(r, 'sciMath')).toMatchObject({ met: true, have: 1, need: 1 });
    expect(result(r, 'depth')).toMatchObject({ met: true, have: 4, need: 4 });
    expect(result(r, 'techElectives')).toMatchObject({ met: true, have: 3, need: 3 });
    expect(r.graduates).toBe(true);
  });

  it('a sci/math group course used for depth and not surplus does not count as sci/math', () => {
    // B courses: 311 (kernel), 410, 537. Depth needs 2 B courses, so 537 is needed.
    const plan = without(swap(EE_PLAN, 'ECE357', 'ECE537'), 'ECE411');
    const r = run(ele2026, plan);
    expect(result(r, 'depth').met).toBe(true);
    expect(result(r, 'sciMath').met).toBe(false);
  });
});

describe('flag overrides', () => {
  it('2026: ECE357 counts as sci/math and PHY358 (flagged) does not', () => {
    expect(hasFlag(ele2026, 'isSciMath', 'ECE357', { name: 'x' })).toBe(true);
    expect(hasFlag(cpe2026, 'isSciMath', 'ECE357', { name: 'x' })).toBe(true);
    expect(hasFlag(ele2026, 'isSciMath', 'PHY358', { name: 'x', isSciMath: true })).toBe(false);
    expect(result(run(ele2026, ['ECE357']), 'sciMath')).toMatchObject({ met: true, have: 1 });
    expect(result(run(ele2026, ['PHY358']), 'sciMath')).toMatchObject({ met: false, have: 0 });
  });

  it('pre-2026: the reverse (ECE357 unflagged does not count, PHY358 flagged does)', () => {
    expect(hasFlag(ecePre2026, 'isSciMath', 'ECE357', { name: 'x' })).toBe(false);
    expect(hasFlag(ecePre2026, 'isSciMath', 'PHY358', { name: 'x', isSciMath: true })).toBe(true);
    expect(result(run(ecePre2026, ['ECE357']), 'sciMath')).toMatchObject({ met: false, have: 0 });
    expect(result(run(ecePre2026, ['PHY358']), 'sciMath')).toMatchObject({ met: true, have: 1 });
  });

  it('an override include/exclude does not touch other flags', () => {
    expect(hasFlag(ele2026, 'isCS', 'ECE357', { name: 'x' })).toBe(false);
    expect(hasFlag(ele2026, 'isCS', 'CS1', { name: 'x', isCS: true })).toBe(true);
  });

  it('a missing course has no flags unless included', () => {
    expect(hasFlag(ecePre2026, 'isCS', 'NOPE', undefined)).toBe(false);
    expect(hasFlag(ele2026, 'isSciMath', 'ECE357', undefined)).toBe(true);
  });
});

describe('group counts and membership source', () => {
  it('2026 groupCounts has exactly the keys A, B, C', () => {
    const r = run(ele2026, EE_PLAN);
    expect(Object.keys(r.groupCounts).sort()).toEqual(['A', 'B', 'C']);
    // A: 313 314 318 330 412 422 424 427; B: 311 410 411; C: none
    expect(r.groupCounts).toEqual({ A: 8, B: 3, C: 0 });
    expect(Object.keys(run(cpe2026, []).groupCounts).sort()).toEqual(['A', 'B', 'C']);
    expect(run(cpe2026, []).groupCounts).toEqual({ A: 0, B: 0, C: 0 });
  });

  it('pre-2026 groupCounts has exactly keys 1..6, and stream 7 gets no key', () => {
    const courses: CourseList = {
      X: { name: 'X', streams: [7], kernel: true },
      Y: { name: 'Y', streams: [2, 3] },
    };
    const r = evaluate(ecePre2026, build(['X', 'Y'], courses));
    expect(Object.keys(r.groupCounts)).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(r.groupCounts).toEqual({ 1: 0, 2: 1, 3: 1, 4: 0, 5: 0, 6: 0 });
    // stream 7 still takes part in the breadth analysis
    expect(r.breadthGroups).toEqual(['7']);
  });

  it("2026 ignores a course's own streams and kernel", () => {
    const courses: CourseList = {
      ECE313: { name: 'ECE313', streams: [5], kernel: false },
      ZZZ100: { name: 'ZZZ100', streams: [1, 2], kernel: true },
    };
    const r = evaluate(ele2026, build(['ECE313', 'ZZZ100'], courses));
    expect(r.groupCounts).toEqual({ A: 1, B: 0, C: 0 }); // ECE313 is A; ZZZ100 is in no group
    expect(result(r, 'breadth').have).toBe(1); // ECE313 is a kernel despite kernel: false
    expect(r.depthGroups).toEqual([]);
    expect(r.breadthGroups).toEqual([]);
  });

  it('pre-2026 ignores the 2026 membership and uses the course streams', () => {
    const courses: CourseList = { ECE313: { name: 'ECE313', streams: [5], kernel: true } };
    const r = evaluate(ecePre2026, build(['ECE313'], courses));
    expect(r.groupCounts).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 1, 6: 0 });
    expect(r.breadthGroups).toEqual(['5']);
  });
});

describe('designation', () => {
  it('is fixed on an empty grid: EE for ele-2026, CE for cpe-2026', () => {
    expect(run(ele2026, []).designation).toBe('EE');
    expect(run(cpe2026, []).designation).toBe('CE');
  });

  it('is fixed regardless of courses', () => {
    expect(run(ele2026, CE_PLAN).designation).toBe('EE');
    expect(run(cpe2026, EE_PLAN).designation).toBe('CE');
  });

  it('is derived (null on an empty grid) for pre-2026', () => {
    expect(run(ecePre2026, []).designation).toBeNull();
  });
});

describe('getMembership and hasFlag', () => {
  it('uses the curriculum membership when present', () => {
    expect(getMembership(ele2026, 'ECE313', undefined)).toEqual({ groups: ['A'], kernel: true });
    expect(getMembership(ele2026, 'ECE330', { name: 'x' })).toEqual({ groups: ['A'], kernel: false });
    expect(getMembership(cpe2026, 'ECE316', { name: 'x', streams: [1] })).toEqual({ groups: ['B'], kernel: true });
    expect(getMembership(ele2026, 'ECE448', undefined)).toEqual({ groups: ['C'], kernel: false });
    expect(getMembership(ele2026, 'UNKNOWN', { name: 'x', streams: [1], kernel: true })).toEqual({
      groups: [],
      kernel: false,
    });
  });

  it("uses the course's streams (as strings, in stored order) and kernel without membership", () => {
    expect(getMembership(ecePre2026, 'ANY', { name: 'x', streams: [3, 1, 6], kernel: true })).toEqual({
      groups: ['3', '1', '6'],
      kernel: true,
    });
    expect(getMembership(ecePre2026, 'ANY', { name: 'x' })).toEqual({ groups: [], kernel: false });
  });

  it("uses a custom course's group under 2026, never as a kernel", () => {
    expect(getMembership(ele2026, 'XYZ123', { name: 'x', group: 'B' })).toEqual({ groups: ['B'], kernel: false });
    expect(getMembership(cpe2026, 'XYZ123', { name: 'x', group: 'B', kernel: true })).toEqual({
      groups: ['B'],
      kernel: false,
    });
  });

  it("ignores a group on an official course or an unknown group", () => {
    expect(getMembership(ele2026, 'ECE335', { name: 'x', group: 'C' })).toEqual({ groups: ['A'], kernel: true });
    expect(getMembership(ele2026, 'XYZ123', { name: 'x', group: 'Z' })).toEqual({ groups: [], kernel: false });
  });

  it('ignores group under ece-pre2026 and uses streams', () => {
    expect(getMembership(ecePre2026, 'XYZ123', { name: 'x', group: 'B', streams: [2] })).toEqual({
      groups: ['2'],
      kernel: false,
    });
    expect(getMembership(ecePre2026, 'XYZ123', { name: 'x', group: 'B' })).toEqual({ groups: [], kernel: false });
  });

  it('a missing course means no groups', () => {
    expect(getMembership(ecePre2026, 'ANY', undefined)).toEqual({ groups: [], kernel: false });
  });

  it('hasFlag reads the course flag when there is no override', () => {
    expect(hasFlag(ecePre2026, 'isHSS', 'A', { name: 'x', isHSS: true })).toBe(true);
    expect(hasFlag(ecePre2026, 'isHSS', 'A', { name: 'x' })).toBe(false);
    expect(hasFlag(ecePre2026, 'isCS', 'A', { name: 'x', isHSS: true })).toBe(false);
  });
});

describe('getCurriculum', () => {
  it('returns each curriculum by id', () => {
    expect(getCurriculum('ece-pre2026')).toBe(ecePre2026);
    expect(getCurriculum('ele-2026')).toBe(ele2026);
    expect(getCurriculum('cpe-2026')).toBe(cpe2026);
    expect(curricula.map((c) => c.id)).toEqual(['ece-pre2026', 'ele-2026', 'cpe-2026']);
  });

  it('falls back to the default for unknown, null, undefined or empty ids', () => {
    expect(DEFAULT_CURRICULUM_ID).toBe('ece-pre2026');
    expect(getCurriculum('nope')).toBe(ecePre2026);
    expect(getCurriculum(null)).toBe(ecePre2026);
    expect(getCurriculum(undefined)).toBe(ecePre2026);
    expect(getCurriculum('')).toBe(ecePre2026);
  });
});

describe('evaluate(ecePre2026) results', () => {
  it('lists results in requirement order with have/need on an empty grid', () => {
    const r = evaluate(ecePre2026, { courses: {}, coursesOnGrid: { ...emptyGrid }, coursesUsed: {} });
    expect(r.results.map((x) => x.id)).toEqual([
      'cs', 'hss', 'economics', 'capstone', 'breadth', 'depth', 'sciMath', 'techElectives',
    ]);
    expect(r.results.map((x) => [x.have, x.need])).toEqual([
      [0, 4], [0, 2], [0, 1], [0, 1], [0, 4], [0, 4], [0, 1], [0, 3],
    ]);
    expect(r.results.every((x) => !x.met)).toBe(true);
    expect(r.graduates).toBe(false);
    expect(r.designation).toBeNull();
    expect(r.depthGroups).toEqual([]);
    expect(r.breadthGroups).toEqual([]);
  });

  it('copies label, tooltip and section from the rules', () => {
    const r = evaluate(ecePre2026, { courses: {}, coursesOnGrid: { ...emptyGrid }, coursesUsed: {} });
    r.results.forEach((x, i) => {
      const rule = ecePre2026.requirements[i];
      expect([x.label, x.tooltip, x.section]).toEqual([rule.label, rule.tooltip, rule.section]);
    });
  });

  const preCourses: CourseList = {
    D1a: { name: 'D1a', streams: [1], kernel: true }, D1b: { name: 'D1b', streams: [1] }, D1c: { name: 'D1c', streams: [1] },
    D2a: { name: 'D2a', streams: [2], kernel: true }, D2b: { name: 'D2b', streams: [2] }, D2c: { name: 'D2c', streams: [2] },
    B3: { name: 'B3', streams: [3], kernel: true },
    B4: { name: 'B4', streams: [4], kernel: true },
    // Technical electives, in areas with no kernel so they change nothing else
    T5a: { name: 'T5a', streams: [5] }, T5b: { name: 'T5b', streams: [5] }, T6: { name: 'T6', streams: [6] },
    CS1: { name: 'CS1', isCS: true }, CS2: { name: 'CS2', isCS: true },
    HSS1: { name: 'HSS1', isCS: true, isHSS: true }, HSS2: { name: 'HSS2', isCS: true, isHSS: true },
    SM: { name: 'SM', isSciMath: true },
    ECE472: { name: 'ECE472' },
    ECE496: { name: 'ECE496' }, ECE497: { name: 'ECE497' },
  };
  const preAll = Object.keys(preCourses);

  it('a complete pre-2026 plan graduates with exact have/need and EE designation', () => {
    const r = evaluate(ecePre2026, build(preAll, preCourses));
    expect(r.results.map((x) => [x.id, x.have, x.need, x.met])).toEqual([
      ['cs', 4, 4, true],
      ['hss', 2, 2, true],
      ['economics', 1, 1, true],
      ['capstone', 1, 1, true],
      ['breadth', 4, 4, true],
      ['depth', 4, 4, true],
      ['sciMath', 1, 1, true],
      ['techElectives', 3, 3, true],
    ]);
    expect(r.depthGroups).toEqual(['1', '2']);
    expect(r.breadthGroups).toEqual(['3', '4']);
    expect(r.designation).toBe('EE');
    expect(r.graduates).toBe(true);
  });

  it('one unmet requirement means graduates is false', () => {
    const r = evaluate(ecePre2026, build(without(preAll, 'B4'), preCourses));
    expect(result(r, 'breadth')).toMatchObject({ met: false, have: 3, need: 4 });
    expect(r.graduates).toBe(false);
    expect(r.designation).toBeNull();
  });

  it('throws a TypeError for a capstone course on the grid without a coursesUsed entry', () => {
    const coursesOnGrid = { ...emptyGrid, '4F.1': 'ECE496', '4S.1': 'ECE497' } as CoursesOnGrid;
    expect(() =>
      evaluate(ecePre2026, { courses: {}, coursesOnGrid, coursesUsed: { ECE497: '4S.1' } })
    ).toThrow(TypeError);
  });
});

// Expectations below come from the pre-2026 calendar text, not from the
// engine: breadth = 4 kernels, each in a different area; depth = 2 of those
// areas with 2 more courses each (kernels may count); 1 science/math; 3
// technical electives from any area; each course counts for one of these.
// Designation: of the 8 breadth and depth courses, >= 4 in Areas 5-6 is CE,
// >= 5 in Areas 1-4 is EE, each course counted in the area it is used for.
describe('pre-2026: each course counted once', () => {
  const area = (streams: number[], kernel = false, isSciMath = false): CourseCardPropsWithoutCode => ({
    name: 'x',
    streams,
    ...(kernel && { kernel: true }),
    ...(isSciMath && { isSciMath: true }),
  });
  const pre = (courses: CourseList) => evaluate(ecePre2026, build(Object.keys(courses), courses));
  const kernels = (...areas: number[]): CourseList =>
    Object.fromEntries(areas.map((a) => [`K${a}`, area([a], true)]));
  // Kernel in each of a, b, c, d; 2 more courses in each of a and b.
  const plan = (a: number, b: number, c: number, d: number): CourseList => ({
    ...kernels(a, b, c, d),
    [`X${a}`]: area([a]), [`Y${a}`]: area([a]),
    [`X${b}`]: area([b]), [`Y${b}`]: area([b]),
  });

  it('one multi-area course cannot serve two depth areas', () => {
    // Area 1 extras: S, Y1. Area 2 extras: S, Y2. Only 3 distinct courses.
    const courses = { ...kernels(1, 2, 3, 4), S: area([1, 2]), Y1: area([1]), Y2: area([2]) };
    expect(result(pre(courses), 'depth')).toMatchObject({ met: false, have: 3, need: 4 });
    const fixed = pre({ ...courses, Z2: area([2]) });
    expect(result(fixed, 'depth')).toMatchObject({ met: true, have: 4 });
  });

  it('a kernel fills a kernel slot or a depth slot, not both', () => {
    // Area 1 has only K1 + Y1, so K1 cannot also be one of area 1's 2 extras.
    const courses = { ...kernels(1, 2, 3, 4), Y1: area([1]), Y2a: area([2]), Y2b: area([2]) };
    const r = pre(courses);
    expect(result(r, 'breadth').met).toBe(true);
    expect(result(r, 'depth')).toMatchObject({ met: false, have: 3 });
    // A second area-1 kernel is an extra course there (extra kernels count)
    expect(result(pre({ ...courses, K1b: area([1], true) }), 'depth').met).toBe(true);
  });

  it('tries every choice of depth areas: {1, 2} fails, {1, 3} and {2, 3} work', () => {
    const courses = {
      ...kernels(1, 2, 3, 4),
      S: area([1, 2]), A1: area([1]), A2: area([2]), A3a: area([3]), A3b: area([3]),
    };
    const r = pre(courses);
    expect(result(r, 'depth').met).toBe(true);
    expect(r.depthGroups).toEqual(['1', '2', '3']); // possible depth areas
    expect(r.breadthGroups).toEqual(['4']);
  });

  it('a sci/math course needed for depth does not also count as sci/math', () => {
    const courses = {
      ...kernels(1, 2, 3, 4),
      SM1: area([1], false, true), Y1: area([1]), Y2a: area([2]), Y2b: area([2]),
      T5a: area([5]), T5b: area([5]), T5c: area([5]),
    };
    const r = pre(courses);
    expect(result(r, 'depth').met).toBe(true);
    expect(result(r, 'sciMath')).toMatchObject({ met: false, have: 0 });
    // Another area-1 course takes the depth slot and SM1 moves to sci/math
    const moved = pre({ ...courses, Y1b: area([1]) });
    expect(result(moved, 'depth').met).toBe(true);
    expect(result(moved, 'sciMath').met).toBe(true);
    expect(result(moved, 'techElectives').met).toBe(true);
  });

  it('technical electives: 2 of 3, then 3 of 3; courses with no area do not count', () => {
    const base = { ...plan(1, 2, 3, 4), T5a: area([5]), T6: area([6]), NONE: area([]) };
    expect(result(pre(base), 'techElectives')).toMatchObject({ met: false, have: 2, need: 3 });
    expect(result(pre({ ...base, T3: area([3]) }), 'techElectives')).toMatchObject({ met: true, have: 3 });
  });

  it('a technical elective course is not also a depth course', () => {
    // 8 area courses exactly fill breadth and depth; none is left over.
    const r = pre(plan(1, 2, 3, 4));
    expect(result(r, 'depth').met).toBe(true);
    expect(result(r, 'techElectives').have).toBe(0);
  });

  // Magellan talk slide 12, "Degree Designation Depends on Kernel/Depth
  // Courses": depth areas A and B, kernel-only areas C and D. Areas 5 and 6
  // are computer areas, 1-4 electrical.
  it.each([
    ['A, B computer; C, D electrical', [5, 6, 1, 2], 'CE'],
    ['A, C computer; B, D electrical', [5, 1, 6, 2], 'CE'],
    ['A computer; B, C, D electrical', [5, 1, 2, 3], 'EE'],
    ['C, D computer; A, B electrical', [1, 2, 5, 6], 'EE'],
    ['C computer; A, B, D electrical', [1, 2, 5, 3], 'EE'],
    ['all electrical', [1, 2, 3, 4], 'EE'],
  ] as const)('slide 12: %s -> %s', (_, [a, b, c, d], expected) => {
    const r = pre(plan(a, b, c, d));
    expect(result(r, 'breadth').met && result(r, 'depth').met).toBe(true);
    expect(r.designation).toBe(expected);
  });

  it('is ECE when one valid choice gives CE and another EE', () => {
    // Kernels in 1, 2, 5, 6; extras in 1, 2 and 5. Depth {1, 2} gives 2
    // computer courses (EE); depth {1, 5} gives 4 (CE).
    const courses = { ...plan(1, 2, 5, 6), X5: area([5]), Y5: area([5]) };
    const r = pre(courses);
    expect(r.designation).toBe('ECE');
    expect(r.depthGroups).toEqual(['1', '2', '5']);
    expect(r.breadthGroups).toEqual(['6']);
  });

  it('a depth course in a computer area counts as electrical when used for an electrical area', () => {
    // M is in areas 1 and 5. Area 5 has no other extra course, so the only
    // valid depth areas are 1 and 2, and M is used for area 1: 2 computer
    // courses (K5, K6), so EE.
    const courses = { ...kernels(1, 2, 5, 6), M: area([1, 5]), Y1: area([1]), Y2a: area([2]), Y2b: area([2]) };
    expect(pre(courses).designation).toBe('EE');
  });

  it('designation only needs breadth and depth, not sci/math or electives', () => {
    const r = pre(plan(5, 6, 1, 2));
    expect(result(r, 'techElectives').met).toBe(false);
    expect(r.designation).toBe('CE');
  });

  // Brute force: try every way to give each course one role (none, kernel of
  // one of its areas, depth in one of its areas, sci/math, technical
  // elective) and compare with the engine.
  it('agrees with a brute-force search on random grids', () => {
    let seed = 12345;
    const random = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    type Spec = { areas: number[]; kernel: boolean; sm: boolean };

    // Returns one bit per reachable outcome: bit 2 * c + full, where c is the
    // number of computer courses among the 8 and full means sci/math and
    // electives are also filled.
    const bruteForce = (specs: Spec[]): number => {
      const memo = new Map<string, number>();
      const go = (i: number, kMask: number, d: number[], sm: number, te: number): number => {
        if (i === specs.length) {
          const dAreas = d.flatMap((n, a) => (n > 0 ? [a] : []));
          const kCount = [0, 1, 2, 3, 4, 5].filter((a) => kMask & (1 << a)).length;
          if (kCount !== 4 || dAreas.length !== 2) return 0;
          if (dAreas.some((a) => d[a] !== 2 || !(kMask & (1 << a)))) return 0;
          const computer = (a: number) => a === 4 || a === 5; // areas 5, 6
          const c =
            [0, 1, 2, 3, 4, 5].filter((a) => kMask & (1 << a) && computer(a)).length +
            2 * dAreas.filter(computer).length;
          return 1 << (2 * c + (sm === 1 && te === 3 ? 1 : 0));
        }
        const key = `${i}|${kMask}|${d.join('')}|${sm}|${te}`;
        const cached = memo.get(key);
        if (cached !== undefined) return cached;
        const { areas, kernel, sm: isSm } = specs[i];
        let out = go(i + 1, kMask, d, sm, te);
        const kCount = [0, 1, 2, 3, 4, 5].filter((a) => kMask & (1 << a)).length;
        const dUsed = d.filter((n) => n > 0).length;
        for (const s of areas) {
          const a = s - 1;
          if (kernel && !(kMask & (1 << a)) && kCount < 4) out |= go(i + 1, kMask | (1 << a), d, sm, te);
          if (d[a] < 2 && (d[a] > 0 || dUsed < 2)) {
            const next = [...d];
            next[a]++;
            out |= go(i + 1, kMask, next, sm, te);
          }
        }
        if (isSm && sm === 0) out |= go(i + 1, kMask, d, 1, te);
        if (areas.length > 0 && te < 3) out |= go(i + 1, kMask, d, sm, te + 1);
        memo.set(key, out);
        return out;
      };
      return go(0, 0, [0, 0, 0, 0, 0, 0], 0, 0);
    };

    // How often each outcome came up, so the test cannot pass vacuously
    const seen: Record<string, number> = {};
    for (let trial = 0; trial < 300; trial++) {
      const n = 8 + Math.floor(random() * 6); // 8..13 courses
      const specs: Spec[] = Array.from({ length: n }, () => {
        const areas: number[] = [];
        if (random() > 0.1) {
          areas.push(1 + Math.floor(random() * 6));
          if (random() < 0.35) {
            const second = 1 + Math.floor(random() * 6);
            if (second !== areas[0]) areas.push(second);
          }
        }
        return { areas, kernel: areas.length > 0 && random() < 0.4, sm: random() < 0.2 };
      });
      const courses: CourseList = {};
      specs.forEach((s, i) => (courses[`C${i}`] = area(s.areas, s.kernel, s.sm)));
      const r = pre(courses);

      const outcomes = bruteForce(specs);
      const bits = Array.from({ length: 18 }, (_, b) => (outcomes >> b) & 1);
      const counts = bits.flatMap((on, b) => (on ? [b >> 1] : []));
      const ce = counts.some((c) => c >= 4);
      const ee = counts.some((c) => 8 - c >= 5);
      const expected = {
        areaRules: outcomes !== 0,
        all: bits.some((on, b) => on && b % 2 === 1),
        designation: ce && ee ? 'ECE' : ce ? 'CE' : ee ? 'EE' : null,
      };
      const met = (id: string) => result(r, id).met;
      expect({
        areaRules: met('breadth') && met('depth'),
        all: met('breadth') && met('depth') && met('sciMath') && met('techElectives'),
        designation: r.designation,
      }).toEqual(expected);
      const tag = `${expected.areaRules}/${expected.all}/${expected.designation}`;
      seen[tag] = (seen[tag] || 0) + 1;
      seen[String(expected.designation)] = (seen[String(expected.designation)] || 0) + 1;
    }
    expect(seen['false/false/null']).toBeGreaterThan(10);
    expect(seen['CE']).toBeGreaterThan(10);
    expect(seen['EE']).toBeGreaterThan(10);
    expect(seen['ECE']).toBeGreaterThan(10);
    expect(Object.keys(seen).filter((t) => t.startsWith('true/true')).length).toBeGreaterThan(0);
    expect(Object.keys(seen).filter((t) => t.startsWith('true/false')).length).toBeGreaterThan(0);
  });
});

describe('capstone under 2026', () => {
  it('needs both halves in year 4 in different terms', () => {
    const ok = run(ele2026, ['ECE496', 'ECE497']);
    expect(result(ok, 'capstone').met).toBe(true);
    const sameTerm = evaluate(ele2026, {
      courses: {},
      coursesOnGrid: { ...emptyGrid, '4F.1': 'APS490', '4F.2': 'APS491' } as CoursesOnGrid,
      coursesUsed: { APS490: '4F.1', APS491: '4F.2' },
    });
    expect(result(sameTerm, 'capstone').met).toBe(false);
  });
});

describe('2026 data sanity', () => {
  const A_KERNELS = ['ECE313', 'ECE314', 'ECE318', 'ECE320', 'ECE331', 'ECE335'];
  const B_KERNELS = ['ECE302', 'ECE311', 'ECE316'];
  const C_KERNELS = ['ECE334', 'ECE342', 'ECE344', 'ECE345', 'ECE361', 'ECE390'];
  const membership = ele2026.membership!;

  it('both programs share one membership with groups A, B, C', () => {
    expect(cpe2026.membership).toBe(membership);
    expect(ele2026.groups.map((g) => g.id)).toEqual(['A', 'B', 'C']);
    expect(cpe2026.groups.map((g) => g.id)).toEqual(['A', 'B', 'C']);
  });

  it('every membership code is in exactly one declared group', () => {
    Object.entries(membership).forEach(([, entry]) => {
      expect(['A', 'B', 'C']).toContain(entry.group);
    });
  });

  it('no course code is listed twice in the curriculum source lists', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/requirements/curricula/ece2026.ts'),
      'utf8'
    );
    const lists = source.slice(0, source.indexOf('const membership'));
    const codes = lists.match(/"[A-Z]{3}\d{3}"/g) ?? [];
    expect(codes.length).toBeGreaterThan(40);
    const seen = new Set<string>();
    const duplicates = codes.filter((c) => (seen.has(c) ? true : (seen.add(c), false)));
    expect(duplicates).toEqual([]);
    expect(seen.size).toBe(Object.keys(membership).length);
  });

  it('kernel lists match the calendar', () => {
    const kernelsOf = (group: string) =>
      Object.entries(membership)
        .filter(([, e]) => e.group === group && e.kernel)
        .map(([code]) => code)
        .sort();
    expect(kernelsOf('A')).toEqual([...A_KERNELS].sort());
    expect(kernelsOf('B')).toEqual([...B_KERNELS].sort());
    expect(kernelsOf('C')).toEqual([...C_KERNELS].sort());
  });

  it('science/math courses that are also in a group are in the expected groups', () => {
    expect(membership.ECE302).toEqual({ group: 'B', kernel: true });
    expect(membership.ECE537.group).toBe('B');
    expect(membership.BME331.group).toBe('B');
    expect(membership.ECE368.group).toBe('B');
    expect(membership.ECE448.group).toBe('C');
  });

  it('every membership code exists in mockCourses (none missing)', () => {
    const missing = Object.keys(membership).filter((code) => !(code in mockCourses));
    expect(missing).toEqual([]);
  });

  it('the override courses have the expected state in mockCourses', () => {
    expect(mockCourses.ECE357).toBeUndefined();
    expect(mockCourses.PHY358).toBeUndefined();
  });
});

import { computeConditions } from '../computeConditions';
import { emptyGrid } from '../emptyGrid';
import mockCourses from '../../data/mockCourses';
import {
  CourseCardPropsWithoutCode,
  CourseList,
  CoursesOnGrid,
  CoursesUsed,
  GridPosition,
  GridPositionBase,
} from '../../types/types';

// These tests pin what computeConditions returns, including odd cases. They
// only assert on the returned object and use small synthetic courses, except
// for the one clearly marked data-dependent smoke test at the bottom.
// Pre-2026 rules (calendar): breadth = 4 kernels in different areas; depth =
// 2 of those areas with 2 more courses each; each course counts once among
// breadth, depth, science/math and technical electives. The adapter's
// depthStreams / breadthStreams are the areas possible as depth / as another
// kernel area over every valid choice (or of the best partial choice).

type Flags = Partial<CourseCardPropsWithoutCode>;

const course = (streams?: number[], kernel = false, flags: Flags = {}): CourseCardPropsWithoutCode =>
  ({
    name: 'Synthetic',
    ...(streams ? { streams } : {}),
    ...(kernel ? { kernel: true } : {}),
    ...flags,
  } as CourseCardPropsWithoutCode);

// placement: slot -> course code. Builds the matching coursesOnGrid + coursesUsed.
// Courses in `courses` that are not placed get '' in coursesUsed.
const run = (courses: CourseList, placement: Partial<Record<GridPositionBase, string>>) => {
  const coursesOnGrid: CoursesOnGrid = { ...emptyGrid, ...placement } as CoursesOnGrid;
  const coursesUsed: CoursesUsed = {};
  Object.keys(courses).forEach((code) => (coursesUsed[code] = ''));
  Object.entries(placement).forEach(([slot, code]) => {
    if (code) coursesUsed[code] = slot as GridPosition;
  });
  return computeConditions({ coursesOnGrid, courses, coursesUsed });
};

const SLOTS = Object.keys(emptyGrid) as GridPositionBase[];

// Place codes in the first N slots in order.
const fill = (codes: string[]): Partial<Record<GridPositionBase, string>> => {
  const placement: Partial<Record<GridPositionBase, string>> = {};
  codes.forEach((code, i) => (placement[SLOTS[i]] = code));
  return placement;
};

// Build a plan with exactly the given depth and breadth streams (single-stream courses).
// Each depth stream gets 3 courses (one kernel), each breadth stream gets 1 kernel course.
const planFor = (depth: number[], breadth: number[]) => {
  const courses: CourseList = {};
  const codes: string[] = [];
  depth.forEach((s) => {
    courses[`D${s}a`] = course([s], true);
    courses[`D${s}b`] = course([s]);
    courses[`D${s}c`] = course([s]);
    codes.push(`D${s}a`, `D${s}b`, `D${s}c`);
  });
  breadth.forEach((s) => {
    courses[`B${s}`] = course([s], true);
    codes.push(`B${s}`);
  });
  return run(courses, fill(codes));
};

describe('computeConditions: empty grid', () => {
  it('returns all-default values', () => {
    const result = run({ A: course([1], true) }, {});
    expect(result).toEqual({
      hasCS: false,
      hasHSS: false,
      streamCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      breadthStreams: [],
      depthStreams: [],
      hasBreadth: false,
      hasDepth: false,
      hasEconomics: false,
      hasCapstone: false,
      hasSciMath: false,
      ceOrEE: null,
    });
  });

  it('works with no courses at all', () => {
    const result = run({}, {});
    expect(result.streamCounts).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
    expect(result.ceOrEE).toBeNull();
  });
});

describe('computeConditions: streamCounts', () => {
  it('counts a multi-stream course in every one of its streams', () => {
    const courses = { A: course([1, 3, 6]), B: course([3]) };
    const result = run(courses, fill(['A', 'B']));
    expect(result.streamCounts).toEqual({ 1: 1, 2: 0, 3: 2, 4: 0, 5: 0, 6: 1 });
  });

  it('does not count courses without streams anywhere', () => {
    const courses = { A: course(), B: course([]), C: course([2]) };
    const result = run(courses, fill(['A', 'B', 'C']));
    expect(result.streamCounts).toEqual({ 1: 0, 2: 1, 3: 0, 4: 0, 5: 0, 6: 0 });
  });

  it('ignores a code on the grid that is missing from courses', () => {
    const courses = { A: course([2], true) };
    const coursesOnGrid = { ...emptyGrid, '3F.1': 'A', '3F.2': 'GHOST' } as CoursesOnGrid;
    const result = computeConditions({
      coursesOnGrid,
      courses,
      coursesUsed: { A: '3F.1', GHOST: '3F.2' },
    });
    expect(result.streamCounts).toEqual({ 1: 0, 2: 1, 3: 0, 4: 0, 5: 0, 6: 0 });
    expect(result.breadthStreams).toEqual([2]);
    expect(result.hasCS).toBe(false);
    expect(result.hasSciMath).toBe(false);
  });

  it('keeps counts for streams above 6 out of streamCounts (only keys 1..6)', () => {
    const result = run({ A: course([7], true) }, fill(['A']));
    expect(result.streamCounts).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
    // ...but stream 7 still counts as a breadth stream in the other fields
    expect(result.breadthStreams).toEqual([7]);
  });
});

describe('computeConditions: depth', () => {
  it('3 courses with a kernel is a depth stream', () => {
    const courses = { A: course([1], true), B: course([1]), C: course([1]) };
    const result = run(courses, fill(['A', 'B', 'C']));
    expect(result.depthStreams).toEqual([1]);
    expect(result.breadthStreams).toEqual([]);
  });

  it('the kernel can be any of the 3 courses', () => {
    const courses = { A: course([1]), B: course([1]), C: course([1], true) };
    expect(run(courses, fill(['A', 'B', 'C'])).depthStreams).toEqual([1]);
  });

  it('3 courses without a kernel is not depth (and not breadth)', () => {
    const courses = { A: course([1]), B: course([1]), C: course([1]) };
    const result = run(courses, fill(['A', 'B', 'C']));
    expect(result.depthStreams).toEqual([]);
    expect(result.breadthStreams).toEqual([]);
  });

  it('2 courses with a kernel is not depth (it is breadth)', () => {
    const courses = { A: course([1], true), B: course([1]) };
    const result = run(courses, fill(['A', 'B']));
    expect(result.depthStreams).toEqual([]);
    expect(result.breadthStreams).toEqual([1]);
  });

  it('a multi-stream kernel is the kernel of only one of its streams', () => {
    // A can be the area-1 kernel or the area-2 kernel, not both. Area 1 has
    // A + B + C, so A is used there and area 2 has no kernel left.
    const courses = { A: course([1, 2], true), B: course([1]), C: course([1]), D: course([2]) };
    const result = run(courses, fill(['A', 'B', 'C', 'D']));
    expect(result.depthStreams).toEqual([1]);
    expect(result.breadthStreams).toEqual([]);
  });

  it('hasDepth needs 2 depth streams: 0 and 1 false, 2 and 3 true', () => {
    expect(planFor([], []).hasDepth).toBe(false);
    expect(planFor([1], []).hasDepth).toBe(false);
    expect(planFor([1, 2], []).hasDepth).toBe(true);
    expect(planFor([1, 2, 3], []).hasDepth).toBe(true);
    expect(planFor([1, 2, 3, 4], []).hasDepth).toBe(true);
  });
});

describe('computeConditions: breadth', () => {
  it('a stream with a kernel that is not depth is breadth', () => {
    const result = planFor([], [3]);
    expect(result.breadthStreams).toEqual([3]);
    expect(result.depthStreams).toEqual([]);
  });

  it('a stream with courses but no kernel is not breadth', () => {
    const courses = { A: course([3]), B: course([3]) };
    const result = run(courses, fill(['A', 'B']));
    expect(result.breadthStreams).toEqual([]);
    expect(result.streamCounts[3]).toBe(2);
  });

  it('depth streams are excluded from breadthStreams', () => {
    const result = planFor([1], [2]);
    expect(result.depthStreams).toEqual([1]);
    expect(result.breadthStreams).toEqual([2]);
  });

  it('depth and breadth do not overlap even for a kernel stream with many courses', () => {
    const courses = { A: course([4], true), B: course([4], true), C: course([4], true), D: course([4], true) };
    const result = run(courses, fill(['A', 'B', 'C', 'D']));
    expect(result.depthStreams).toEqual([4]);
    expect(result.breadthStreams).toEqual([]);
  });

  it('hasBreadth needs kernels in 4 different areas, depth or not', () => {
    expect(planFor([], [1, 2]).hasBreadth).toBe(false);
    expect(planFor([], [1, 2, 3]).hasBreadth).toBe(false);
    expect(planFor([], [1, 2, 3, 4]).hasBreadth).toBe(true);
    expect(planFor([1, 2], [3, 4]).hasBreadth).toBe(true);
  });

  it('hasBreadth: 1 breadth + 3 depth is true', () => {
    expect(planFor([1, 2, 3], [4]).hasBreadth).toBe(true);
  });

  it('hasBreadth: 4 depth + 0 breadth is true', () => {
    expect(planFor([1, 2, 3, 4], []).hasBreadth).toBe(true);
  });

  it('hasBreadth: 1 breadth + 2 depth is false', () => {
    expect(planFor([1, 2], [3]).hasBreadth).toBe(false);
  });

  it('hasBreadth: 0 breadth + 3 depth is false', () => {
    expect(planFor([1, 2, 3], []).hasBreadth).toBe(false);
  });

  it('hasBreadth: 1 breadth alone (no depth) is false', () => {
    expect(planFor([], [1]).hasBreadth).toBe(false);
  });

  it('hasBreadth can be true while hasDepth is false, and ceOrEE stays null', () => {
    const result = planFor([1], [2, 3, 4]);
    expect(result.hasBreadth).toBe(true);
    expect(result.hasDepth).toBe(false);
    expect(result.ceOrEE).toBeNull();
  });
});

describe('computeConditions: depthStreams / breadthStreams contents and order', () => {
  it('are ordered by ascending stream number regardless of placement order', () => {
    // place stream 6 and 5 depth courses first, stream 3 and 1 breadth first
    const courses: CourseList = {
      S6a: course([6], true), S6b: course([6]), S6c: course([6]),
      S2a: course([2], true), S2b: course([2]), S2c: course([2]),
      S5k: course([5], true),
      S1k: course([1], true),
    };
    const result = run(courses, fill(['S6a', 'S6b', 'S6c', 'S5k', 'S2a', 'S2b', 'S2c', 'S1k']));
    expect(result.depthStreams).toEqual([2, 6]);
    expect(result.breadthStreams).toEqual([1, 5]);
  });

  it('exact contents for a mixed plan', () => {
    const result = planFor([4, 1, 6], [5, 3]);
    expect(result.depthStreams).toEqual([1, 4, 6]);
    expect(result.breadthStreams).toEqual([3, 5]);
    expect(result.streamCounts).toEqual({ 1: 3, 2: 0, 3: 1, 4: 3, 5: 1, 6: 3 });
  });
});

describe('computeConditions: ceOrEE', () => {
  // Streams 5 and 6 are the computer streams; 1-4 are EE streams.
  // The helper planFor(depth, breadth) builds exactly those depth/breadth sets.

  it('is null when depth is unmet (D{5}, B{1,2,3})', () => {
    const r = planFor([5], [1, 2, 3]);
    expect(r.hasDepth).toBe(false);
    expect(r.hasBreadth).toBe(true);
    expect(r.ceOrEE).toBeNull();
  });

  it('is null when breadth is unmet (D{5,6}, B{1})', () => {
    const r = planFor([5, 6], [1]);
    expect(r.hasDepth).toBe(true);
    expect(r.hasBreadth).toBe(false);
    expect(r.ceOrEE).toBeNull();
  });

  it('is null when both are unmet (D{}, B{})', () => {
    expect(planFor([], []).ceOrEE).toBeNull();
  });

  it('is null for D{5,6,1}, B{} (3 depth, no breadth)', () => {
    expect(planFor([5, 6, 1], []).ceOrEE).toBeNull();
  });

  // numEEDepth === 0, countCE >= 4
  it('CE: D{5,6}, B{1,2}', () => {
    expect(planFor([5, 6], [1, 2]).ceOrEE).toBe('CE');
  });

  it('CE: D{5,6}, B{1,2,3}', () => {
    expect(planFor([5, 6], [1, 2, 3]).ceOrEE).toBe('CE');
  });

  // numEEDepth === 1, countCE >= 4, numEEBreadth === 1
  it('CE: D{5,6,1}, B{2} (3 depth, 1 breadth; 2 CE depth + 1 EE depth + 1 EE breadth)', () => {
    expect(planFor([5, 6, 1], [2]).ceOrEE).toBe('CE');
  });

  it('CE: D{5,1}, B{6,2} (1 CE + 1 EE depth, 1 CE + 1 EE breadth; countCE = 3 + 1)', () => {
    expect(planFor([5, 1], [6, 2]).ceOrEE).toBe('CE');
  });

  it('CE: D{6,1}, B{5,2} (same as above with 5 and 6 swapped)', () => {
    expect(planFor([6, 1], [5, 2]).ceOrEE).toBe('CE');
  });

  // numEEDepth === 1, countCE >= 4, numEEBreadth !== 1
  it('ECE: D{5,6,1}, B{2,3} (1 EE depth, 2 EE breadth)', () => {
    expect(planFor([5, 6, 1], [2, 3]).ceOrEE).toBe('ECE');
  });

  it('ECE: D{5,1}, B{6,2,3} (1 EE depth, 1 CE breadth, 2 EE breadth; countCE = 4)', () => {
    expect(planFor([5, 1], [6, 2, 3]).ceOrEE).toBe('ECE');
  });

  // numEEDepth >= 2, countCE >= 4
  it('ECE: D{5,1,2}, B{6,3} (2 EE depth, countCE = 3 + 1)', () => {
    expect(planFor([5, 1, 2], [6, 3]).ceOrEE).toBe('ECE');
  });

  it('ECE: D{6,1,2}, B{5,3} (same with 5 and 6 swapped)', () => {
    expect(planFor([6, 1, 2], [5, 3]).ceOrEE).toBe('ECE');
  });

  it('ECE: D{5,6,1,2} with no breadth (4 depth; 2 CE + 2 EE depth)', () => {
    expect(planFor([5, 6, 1, 2], []).ceOrEE).toBe('ECE');
  });

  it('ECE: D{5,6,1,2,3} with B{4} (5 depth streams)', () => {
    expect(planFor([5, 6, 1, 2, 3], [4]).ceOrEE).toBe('ECE');
  });

  it('ECE: D{5,6,1,2,3,4} (6 depth streams, 18 courses, no breadth)', () => {
    expect(planFor([5, 6, 1, 2, 3, 4], []).ceOrEE).toBe('ECE');
  });

  // countCE < 4 -> EE
  it('EE: D{5,1}, B{2,3} (countCE = 3)', () => {
    expect(planFor([5, 1], [2, 3]).ceOrEE).toBe('EE');
  });

  it('EE: D{6,1}, B{2,3,4} (countCE = 3)', () => {
    expect(planFor([6, 1], [2, 3, 4]).ceOrEE).toBe('EE');
  });

  it('EE: D{1,2}, B{3,4} (no CE streams)', () => {
    expect(planFor([1, 2], [3, 4]).ceOrEE).toBe('EE');
  });

  it('EE: D{1,2}, B{5,6} (2 EE depth + 2 CE breadth; countCE = 2)', () => {
    expect(planFor([1, 2], [5, 6]).ceOrEE).toBe('EE');
  });

  it('EE: D{1,2}, B{3,5} (2 EE depth + mixed breadth; countCE = 1)', () => {
    expect(planFor([1, 2], [3, 5]).ceOrEE).toBe('EE');
  });

  it('EE: D{1,2,3}, B{5} (3 EE depth + 1 CE breadth)', () => {
    expect(planFor([1, 2, 3], [5]).ceOrEE).toBe('EE');
  });

  it('EE: D{1,2,3}, B{5,6} (3 EE depth + 2 CE breadth; countCE = 2)', () => {
    expect(planFor([1, 2, 3], [5, 6]).ceOrEE).toBe('EE');
  });

  it('EE: D{1,2,3,4}, B{} (4 EE depth)', () => {
    expect(planFor([1, 2, 3, 4], []).ceOrEE).toBe('EE');
  });

  it('EE: D{5,1,2,3}, B{} (4 depth, only one CE depth; countCE = 3)', () => {
    expect(planFor([5, 1, 2, 3], []).ceOrEE).toBe('EE');
  });

  it('ECE: D{5,1,2,3}, B{6} (countCE = 3 + 1 = 4, 3 EE depth -> default branch)', () => {
    expect(planFor([5, 1, 2, 3], [6]).ceOrEE).toBe('ECE');
  });

  it('multi-stream courses count once: 2 multi-stream kernels give 2 kernel areas, not 4', () => {
    // Kernels A (5 or 6) and D (1 or 2) fill only 2 of the 4 kernel slots.
    // Depth is met with one area from each pair, e.g. 1 (D + E, F) and
    // 5 (A + B, C); the first such choice in area order is {1, 5}.
    const courses: CourseList = {
      A: course([5, 6], true), B: course([5, 6]), C: course([5, 6]),
      D: course([1, 2], true), E: course([1, 2]), F: course([1, 2]),
    };
    const r = run(courses, fill(['A', 'B', 'C', 'D', 'E', 'F']));
    expect(r.hasBreadth).toBe(false);
    expect(r.hasDepth).toBe(true);
    expect(r.depthStreams).toEqual([1, 5]);
    expect(r.breadthStreams).toEqual([]);
    expect(r.ceOrEE).toBeNull();
  });
});

describe('computeConditions: capstone', () => {
  const caps = (codes: Record<string, GridPositionBase>) => {
    const courses: CourseList = {};
    const placement: Partial<Record<GridPositionBase, string>> = {};
    Object.entries(codes).forEach(([code, slot]) => {
      courses[code] = course();
      placement[slot] = code;
    });
    return run(courses, placement).hasCapstone;
  };

  it.each([
    ['ECE496', 'ECE497'],
    ['APS490', 'APS491'],
    ['BME498', 'BME499'],
  ])('%s + %s in year 4, different terms -> true', (a, b) => {
    expect(caps({ [a]: '4F.1', [b]: '4S.1' })).toBe(true);
  });

  it('also true in the reverse term order (second half in the fall)', () => {
    expect(caps({ ECE496: '4S.1', ECE497: '4F.1' })).toBe(true);
  });

  it('same term -> false', () => {
    expect(caps({ ECE496: '4F.1', ECE497: '4F.2' })).toBe(false);
    expect(caps({ ECE496: '4S.1', ECE497: '4S.5' })).toBe(false);
  });

  it('one half in year 3 -> false', () => {
    expect(caps({ ECE496: '3F.1', ECE497: '4S.1' })).toBe(false);
    expect(caps({ ECE496: '4F.1', ECE497: '3S.1' })).toBe(false);
  });

  it('both halves in year 3 -> false', () => {
    expect(caps({ ECE496: '3F.1', ECE497: '3S.1' })).toBe(false);
  });

  it('only one half present -> false', () => {
    expect(caps({ ECE496: '4F.1' })).toBe(false);
    expect(caps({ ECE497: '4S.1' })).toBe(false);
  });

  it('halves from different pairs -> false', () => {
    expect(caps({ ECE496: '4F.1', APS491: '4S.1' })).toBe(false);
    expect(caps({ APS490: '4F.1', BME499: '4S.1' })).toBe(false);
  });

  it('one half in an XX slot -> false (XX is not year 4)', () => {
    expect(caps({ ECE496: 'XX.1', ECE497: '4S.1' })).toBe(false);
    expect(caps({ ECE496: '4F.1', ECE497: 'XX.1' })).toBe(false);
  });

  it('both halves in XX slots -> false', () => {
    expect(caps({ ECE496: 'XX.1', ECE497: 'XX.2' })).toBe(false);
  });

  it('any one complete pair is enough', () => {
    expect(caps({ ECE496: '4F.1', APS490: '4F.2', APS491: '4S.1' })).toBe(true);
  });

  it('throws if a capstone course is on the grid but missing from coursesUsed (inconsistent input)', () => {
    const coursesOnGrid = { ...emptyGrid, '4F.1': 'ECE496', '4S.1': 'ECE497' } as CoursesOnGrid;
    expect(() =>
      computeConditions({ coursesOnGrid, courses: {}, coursesUsed: { ECE497: '4S.1' } })
    ).toThrow(TypeError);
  });
});

describe('computeConditions: hasCS / hasHSS / hasSciMath / hasEconomics', () => {
  it('hasCS needs 4 isCS courses; 3 is false', () => {
    const courses: CourseList = {};
    ['A', 'B', 'C', 'D', 'E'].forEach((c) => (courses[c] = course(undefined, false, { isCS: true })));
    expect(run(courses, fill(['A', 'B', 'C'])).hasCS).toBe(false);
    expect(run(courses, fill(['A', 'B', 'C', 'D'])).hasCS).toBe(true);
    expect(run(courses, fill(['A', 'B', 'C', 'D', 'E'])).hasCS).toBe(true);
  });

  it('hasCS ignores non-isCS courses', () => {
    const courses: CourseList = {
      A: course(undefined, false, { isCS: true }),
      B: course(undefined, false, { isCS: true }),
      C: course(undefined, false, { isCS: true }),
      D: course(),
    };
    expect(run(courses, fill(['A', 'B', 'C', 'D'])).hasCS).toBe(false);
  });

  it('hasHSS needs 2 isHSS courses; 1 is false', () => {
    const courses: CourseList = {
      A: course(undefined, false, { isHSS: true }),
      B: course(undefined, false, { isHSS: true }),
    };
    expect(run(courses, fill(['A'])).hasHSS).toBe(false);
    expect(run(courses, fill(['A', 'B'])).hasHSS).toBe(true);
  });

  it('isHSS without isCS counts toward hasHSS but not hasCS', () => {
    const courses: CourseList = {
      A: course(undefined, false, { isHSS: true }),
      B: course(undefined, false, { isHSS: true }),
    };
    const r = run(courses, fill(['A', 'B']));
    expect(r.hasHSS).toBe(true);
    expect(r.hasCS).toBe(false);
  });

  it('a course that is both isCS and isHSS counts toward both', () => {
    const courses: CourseList = {};
    ['A', 'B', 'C', 'D'].forEach((c) => (courses[c] = course(undefined, false, { isCS: true, isHSS: true })));
    const r = run(courses, fill(['A', 'B', 'C', 'D']));
    expect(r.hasCS).toBe(true);
    expect(r.hasHSS).toBe(true);
  });

  it('hasSciMath needs at least 1 isSciMath course', () => {
    const courses: CourseList = { A: course(undefined, false, { isSciMath: true }), B: course() };
    expect(run(courses, fill(['B'])).hasSciMath).toBe(false);
    expect(run(courses, fill(['A'])).hasSciMath).toBe(true);
  });

  it('a course in the pool but not on the grid does not count', () => {
    const courses: CourseList = { A: course(undefined, false, { isSciMath: true }) };
    expect(run(courses, {}).hasSciMath).toBe(false);
  });

  it('hasEconomics is true when ECE472 is on the grid, even if not in courses', () => {
    expect(run({ ECE472: course() }, fill(['ECE472'])).hasEconomics).toBe(true);
    expect(run({ ECE472: course() }, {}).hasEconomics).toBe(false);
    const coursesOnGrid = { ...emptyGrid, '4F.1': 'ECE472' } as CoursesOnGrid;
    expect(
      computeConditions({ coursesOnGrid, courses: {}, coursesUsed: { ECE472: '4F.1' } }).hasEconomics
    ).toBe(true);
  });
});

// DATA-DEPENDENT SMOKE TEST: uses the real mockCourses data, so it may need to be
// updated if the course data (streams, kernels, flags) changes.
describe('computeConditions: smoke test with real mockCourses data (data-dependent)', () => {
  it('computes the expected result for a plausible full plan', () => {
    const placement: Partial<Record<GridPositionBase, string>> = {
      '3F.1': 'ECE311', '3F.2': 'ECE316', '3F.3': 'ECE302', '3F.4': 'ECE361', '3F.5': 'ECE342',
      '3S.1': 'ECE390', '3S.2': 'ECE344', '3S.3': 'ECE345', '3S.4': 'ECE444', '3S.5': 'JRE300',
      '4F.1': 'ECE472', '4F.2': 'ECE496', '4F.3': 'TEP326', '4F.4': 'HPS120', '4F.5': 'ECO101',
      '4S.1': 'ECE497', '4S.2': 'ECE410', '4S.3': 'ECE417', '4S.4': 'ECE313', '4S.5': 'ECE314',
    };
    const coursesUsed: CoursesUsed = {};
    Object.keys(mockCourses).forEach((code) => (coursesUsed[code] = ''));
    Object.entries(placement).forEach(([slot, code]) => (coursesUsed[code as string] = slot as GridPosition));

    const result = computeConditions({
      coursesOnGrid: { ...emptyGrid, ...placement } as CoursesOnGrid,
      courses: mockCourses,
      coursesUsed,
    });

    expect(result).toEqual({
      hasCS: true, // JRE300, TEP326, HPS120, ECO101
      hasHSS: true, // TEP326, HPS120
      streamCounts: { 1: 0, 2: 2, 3: 0, 4: 5, 5: 4, 6: 3 },
      depthStreams: [4, 5, 6],
      breadthStreams: [2],
      hasBreadth: true,
      hasDepth: true,
      hasEconomics: true,
      hasCapstone: true,
      hasSciMath: true, // ECE302
      ceOrEE: 'CE',
    });
  });
});

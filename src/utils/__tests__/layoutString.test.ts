import { readFileSync } from "fs";
import { join } from "path";
import { isValidString, parseString } from "../parseString";
import { serializeLayout } from "../serializeLayout";
import { emptyGrid } from "../emptyGrid";
import { CourseList, CoursesOnGrid } from "../../types/types";

const root = join(__dirname, "..", "..", "..");

const makerSrc = readFileSync(
  join(root, "src/pages/__tests__/Maker.test.tsx"),
  "utf-8",
);
const fixture = (key: string): string => {
  const m = makerSrc.match(new RegExp(`\\b${key}: '([^']*)'`));
  if (!m) throw new Error(`fixture ${key} not found`);
  return m[1];
};
const readmeSrc = readFileSync(join(root, "README.md"), "utf-8");
const readmeExample = readmeSrc.match(/```plaintext\r?\n([^\r\n]*%%[^\r\n]*)\r?\n```/)![1];

const fixtures: Record<string, string> = {
  CE: fixture("CE"),
  EE: fixture("EE"),
  ECE: fixture("ECE"),
  sampleGrad: fixture("sampleGrad"),
  readme: readmeExample,
};

const snapshotable = (str: string) => {
  const r = parseString(str);
  return {
    courses: r.courses,
    coursesOnGrid: r.coursesOnGrid,
    coursesUsed: r.coursesUsed,
    dependencies: [...r.dependencies.entries()]
      .map(([k, v]) => [String(k), [...v].map(String).sort()] as const)
      .sort((a, b) => a[0].localeCompare(b[0])),
  };
};

describe("existing strings keep loading to the same result", () => {
  Object.entries(fixtures).forEach(([name, str]) => {
    test(`${name} is valid and parses to the pinned result`, () => {
      expect(isValidString(str)).toBe(true);
      expect(snapshotable(str)).toMatchSnapshot();
    });
  });
});

const course = (name: string, extra: object = {}) => ({
  name,
  preq: [],
  color: "",
  streams: [],
  isCS: false,
  isHSS: false,
  isArtSci: false,
  ...extra,
});

const grid = (entries: Record<string, string>): CoursesOnGrid =>
  ({ ...emptyGrid, ...entries }) as CoursesOnGrid;

const packed = grid({
  "3F.1": "AAA111",
  "3F.2": "BBB222",
  "3S.1": "CCC333",
  "4F.1": "DDD444",
  "4F.2": "EEE555",
  "4F.3": "FFF666",
});
const packedCourses: CourseList = {
  AAA111: course("a", { color: "ffd699", streams: [6], kernel: true }),
  BBB222: course("b", { onlyF: true }),
  CCC333: course("c"),
  DDD444: course("d"),
  EEE555: course("e"),
  FFF666: course("f"),
};

describe("serializeLayout", () => {
  test("packed grid", () => {
    expect(serializeLayout(packed, packedCourses)).toBe(
      "AAA111a%%6k#ffd699$$BBB222b%%f$$@@CCC333c%%$$@@DDD444d%%$$EEE555e%%$$FFF666f%%$$@@@@",
    );
  });

  test("empty grid", () => {
    expect(serializeLayout(emptyGrid, {})).toBe("@@@@@@@@");
  });

  test("course in slot 5", () => {
    const g = grid({ "3F.5": "AAA111" });
    expect(serializeLayout(g, { AAA111: course("a") })).toBe(
      "$$$$$$$$AAA111a%%@@@@@@@@",
    );
  });

  test("prerequisites only", () => {
    const g = grid({ "3F.1": "AAA111" });
    const c = { AAA111: course("a", { preq: ["BBB222", ["CCC333", "DDD444"]] }) };
    expect(serializeLayout(g, c)).toBe(
      "AAA111a%%pBBB222,CCC333|DDD444$$@@@@@@@@",
    );
  });

  test("co-requisites only", () => {
    const g = grid({ "3F.1": "AAA111" });
    const c = { AAA111: course("a", { coreq: ["BBB222"] }) };
    expect(serializeLayout(g, c)).toBe("AAA111a%%poBBB222$$@@@@@@@@");
  });

  test("prerequisites and co-requisites", () => {
    const g = grid({ "3F.1": "AAA111" });
    const c = { AAA111: course("a", { preq: ["BBB222"], coreq: ["CCC333"] }) };
    expect(serializeLayout(g, c)).toBe(
      "AAA111a%%pBBB222oCCC333$$@@@@@@@@",
    );
  });

  test("packed grid round-trips", () => {
    const parsed = parseString(serializeLayout(packed, packedCourses));
    expect(parsed.coursesOnGrid).toEqual(packed);
  });

  const roundTrip = (g: CoursesOnGrid) => {
    const c: CourseList = {};
    Object.values(g).forEach((code) => {
      if (code) c[code] = course(code.toLowerCase());
    });
    return parseString(serializeLayout(g, c)).coursesOnGrid;
  };

  test("gap at the start round-trips", () => {
    const g = grid({ "3F.2": "AAA111", "3F.3": "BBB222" });
    expect(roundTrip(g)).toEqual(g);
  });

  test("gap in the middle is written with an empty piece", () => {
    const g = grid({ "3F.1": "AAA111", "3F.3": "BBB222" });
    expect(serializeLayout(g, { AAA111: course("a"), BBB222: course("b") })).toBe(
      "AAA111a%%$$$$BBB222b%%$$@@@@@@@@",
    );
    expect(roundTrip(g)).toEqual(g);
  });

  test("gap before slot 5 round-trips", () => {
    const g = grid({ "3F.1": "AAA111", "3F.5": "BBB222", "4S.2": "CCC333" });
    expect(roundTrip(g)).toEqual(g);
  });

  test("only slot 5 filled round-trips", () => {
    const g = grid({ "3F.5": "AAA111", "XX.5": "BBB222" });
    expect(roundTrip(g)).toEqual(g);
  });

  test("a course missing from the course list leaves an empty slot", () => {
    const g = grid({ "3F.1": "AAA111", "3F.2": "GHOST1", "3F.3": "BBB222" });
    const c = { AAA111: course("a"), BBB222: course("b") };
    expect(serializeLayout(g, c)).toBe(
      "AAA111a%%$$$$BBB222b%%$$@@@@@@@@",
    );
  });
});

describe("colours", () => {
  const parse = (s: string) => parseString(s).courses["AAA111"];

  test("6-digit colour is unchanged", () => {
    expect(isValidString("AAA111a%%k#ffd699pBBB222")).toBe(true);
    const c = parse("AAA111a%%k#ffd699pBBB222");
    expect(c.color).toBe("ffd699");
    expect(c.kernel).toBe(true);
    expect(c.preq).toEqual(["BBB222"]);
  });

  test("3-digit colour followed by prerequisites", () => {
    expect(isValidString("AAA111a%%#abcpBBB222,CCC333|DDD444")).toBe(true);
    const c = parse("AAA111a%%#abcpBBB222,CCC333|DDD444");
    expect(c.color).toBe("aabbcc");
    expect(c.preq).toEqual(["BBB222", ["CCC333", "DDD444"]]);
  });

  test("legacy ##rrggbb", () => {
    expect(parse("AAA111a%%##ffd699pBBB222").color).toBe("ffd699");
    expect(parse("AAA111a%%##ffd699pBBB222").preq).toEqual(["BBB222"]);
  });

  test("colour stored with a leading # is written once", () => {
    const g = grid({ "3F.1": "AAA111" });
    const c = { AAA111: course("a", { color: "#ffd699", preq: ["BBB222"] }) };
    const str = serializeLayout(g, c);
    expect(str).toBe("AAA111a%%#ffd699pBBB222$$@@@@@@@@");
    expect(parseString(str).courses["AAA111"].color).toBe("ffd699");
  });

  test("3-digit colour is written as 6 digits and round-trips", () => {
    const g = grid({ "3F.1": "AAA111" });
    const c = { AAA111: course("a", { color: "abc", preq: ["BBB222"] }) };
    const str = serializeLayout(g, c);
    expect(str).toBe("AAA111a%%#aabbccpBBB222$$@@@@@@@@");
    expect(parseString(str).courses["AAA111"].preq).toEqual(["BBB222"]);
  });

  test("an invalid colour is not written", () => {
    const g = grid({ "3F.1": "AAA111" });
    const c = { AAA111: course("a", { color: "abcd", preq: ["BBB222"] }) };
    expect(serializeLayout(g, c)).toBe("AAA111a%%pBBB222$$@@@@@@@@");
  });
});

describe("oversized strings", () => {
  const validKeys = Object.keys(emptyGrid).sort();

  test("a 6th term is ignored", () => {
    const r = parseString("AAA111a%%@@@@@@@@@@BBB222b%%");
    expect(Object.keys(r.coursesOnGrid).sort()).toEqual(validKeys);
    expect(r.courses).toHaveProperty("AAA111");
    expect(r.courses).not.toHaveProperty("BBB222");
    expect(r.coursesUsed).not.toHaveProperty("BBB222");
  });

  test("a 6th course in a term is ignored", () => {
    const r = parseString(
      "AAA111a%%$$BBB222b%%$$CCC333c%%$$DDD444d%%$$EEE555e%%$$FFF666f%%",
    );
    expect(Object.keys(r.coursesOnGrid).sort()).toEqual(validKeys);
    expect(r.coursesOnGrid["3F.5"]).toBe("EEE555");
    expect(r.courses).not.toHaveProperty("FFF666");
    expect(r.coursesUsed).not.toHaveProperty("FFF666");
  });
});

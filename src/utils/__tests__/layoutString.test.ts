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
      "AAA111a%%@@@@@@@@",
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
});

import { Curriculum, Designation, GroupDef, Rule } from "../types";
import { commonRules } from "./ecePre2026";

// Students admitted Fall 2026 or later: three groups, and separate rules for
// the Electrical and Computer programs.
// Source: 2026-27 Engineering calendar
// https://engineering.calendar.utoronto.ca/section/Electrical-and-Computer-Engineering

const groups: GroupDef[] = [
  { id: "A", label: "A", color: "#ff956b", chartColor: "#ffcc99" },
  { id: "B", label: "B", color: "#79d675", chartColor: "#b3e6b3" },
  { id: "C", label: "C", color: "#5db6ff", chartColor: "#99ccff" },
];

const kernels: Record<string, string[]> = {
  A: ["ECE313", "ECE314", "ECE318", "ECE320", "ECE331", "ECE335"],
  B: ["ECE302", "ECE311", "ECE316"],
  C: ["ECE334", "ECE342", "ECE344", "ECE345", "ECE361", "ECE390"],
};

const electives: Record<string, string[]> = {
  A: [
    "ECE330", "ECE412", "ECE422", "ECE424", "ECE427", "ECE430",
    "ECE435", "ECE437", "ECE442", "ECE463", "ECE520", "ECE526",
  ],
  B: [
    "BME331", "BME445", "BME595", "ECE368", "ECE381", "ECE410",
    "ECE411", "ECE417", "ECE421", "ECE431", "ECE441", "ECE446",
    "ECE464", "ECE469", "ECE470", "ECE516", "ECE537",
  ],
  C: [
    "APS360", "CSC317", "CSC343", "CSC384", "ECE326", "ECE419",
    "ECE444", "ECE448", "ECE454", "ECE461", "ECE462", "ECE466",
    "ECE467", "ECE484", "ECE532", "ECE552", "ECE568",
  ],
};

const membership: NonNullable<Curriculum["membership"]> = {};
for (const { id } of groups) {
  for (const code of kernels[id]) membership[code] = { group: id, kernel: true };
  for (const code of electives[id]) membership[code] = { group: id };
}

const rulesFor = (main: string): Rule[] => [
  ...commonRules,
  {
    id: "breadth",
    showProgress: true,
    label: "Breadth",
    tooltip: `3 Group ${main} kernels + 1 Group B kernel`,
    section: "groups",
    type: "slots",
    pools: [
      { where: { group: main, kernel: true }, count: 3 },
      { where: { group: "B", kernel: true }, count: 1 },
    ],
  },
  {
    id: "depth",
    showProgress: true,
    label: "Depth",
    tooltip: `2 more Group ${main} courses + 2 more Group B courses (extra kernels count)`,
    section: "groups",
    type: "slots",
    pools: [
      { where: { group: main }, count: 2 },
      { where: { group: "B" }, count: 2 },
    ],
  },
  {
    id: "sciMath",
    label: "Sci/Math",
    tooltip:
      "At least 1 science/math course that is not already counted for breadth, depth or a technical elective",
    section: "basics",
    type: "slots",
    pools: [{ where: { flag: "isSciMath" }, count: 1 }],
  },
  {
    id: "techElectives",
    showProgress: true,
    label: "Technical electives",
    tooltip:
      "3 more courses from any group. One may come from another department with ECE approval (not checked here)",
    section: "groups",
    type: "slots",
    pools: [{ where: { group: "any" }, count: 3 }],
  },
];

const program = (
  id: string,
  label: string,
  main: string,
  value: Designation
): Curriculum => ({
  id,
  label,
  groups,
  membership,
  // The calendar's Science/Math list for this curriculum adds ECE357 and no
  // longer has PHY358.
  flagOverrides: { isSciMath: { include: ["ECE357"], exclude: ["PHY358"] } },
  requirements: rulesFor(main),
  designation: { type: "fixed", value },
  manualChecks:
    "Natural sciences, Free elective, PEY / 600h technical XP, CEAB, No exclusion violation, Within 1.5 credit ArtSci -300/-400 limit",
});

export const ele2026 = program(
  "ele-2026",
  "Admitted Fall 2026+ · Electrical",
  "A",
  "EE"
);

export const cpe2026 = program(
  "cpe-2026",
  "Admitted Fall 2026+ · Computer",
  "C",
  "CE"
);

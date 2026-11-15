import { Curriculum, Rule } from "../types";

// Rules shared by every ECE curriculum so far.
export const commonRules: Rule[] = [
  {
    id: "cs",
    label: "CS",
    tooltip: "At least 4 complementary study electives (including HSS)",
    section: "basics",
    type: "count",
    where: { flag: "isCS" },
    min: 4,
  },
  {
    id: "hss",
    label: "HSS",
    tooltip: "At least 2 humanities/social science electives",
    section: "basics",
    type: "count",
    where: { flag: "isHSS" },
    min: 2,
  },
  {
    id: "economics",
    label: "Economics",
    tooltip: "ECE472 required",
    section: "basics",
    type: "courses",
    anyOf: ["ECE472"],
  },
  {
    id: "capstone",
    label: "Capstone",
    tooltip: "Both halves of the fourth-year capstone required",
    section: "basics",
    type: "capstone",
    pairs: [
      ["ECE496", "ECE497"],
      ["APS490", "APS491"],
      ["BME498", "BME499"],
    ],
    year: "4",
  },
];

// Students admitted before Fall 2026: six areas, with CE/EE worked out from
// the depth and breadth areas.
// Source: https://www.ece.utoronto.ca/wp-content/uploads/2026/01/curriculum-cohorts-pre2026.pdf
export const ecePre2026: Curriculum = {
  id: "ece-pre2026",
  label: "Admitted before Fall 2026 (6 areas)",
  groups: [
    { id: "1", label: "1", color: "#fa7274", chartColor: "#ffcc99" },
    { id: "2", label: "2", color: "#ff956b", chartColor: "#99ccff" },
    { id: "3", label: "3", color: "#ffdd46", chartColor: "#b3e6b3" },
    { id: "4", label: "4", color: "#79d675", chartColor: "#e6b3ff" },
    { id: "5", label: "5", color: "#5db6ff", chartColor: "#ffb3b3" },
    { id: "6", label: "6", color: "#ab8eee", chartColor: "#ffd699" },
  ],
  requirements: [
    ...commonRules,
    // Breadth, depth, science/math and technical electives are exclusive: a
    // course in several areas, or one that is also science/math, counts for
    // only one of them.
    {
      id: "breadth",
      showProgress: true,
      label: "Breadth",
      tooltip: "4 kernel courses, each in a different area",
      section: "groups",
      type: "areaBreadth",
      kernelAreas: 4,
    },
    {
      id: "depth",
      showProgress: true,
      label: "Depth",
      tooltip:
        "2 more courses in each of 2 of your kernel areas (extra kernels count)",
      section: "groups",
      type: "areaDepth",
      depthAreas: 2,
      perArea: 2,
    },
    {
      id: "sciMath",
      label: "Sci/Math",
      tooltip:
        "At least 1 science/math course (Area 7) that is not already counted for breadth, depth or a technical elective",
      section: "basics",
      type: "slots",
      pools: [{ where: { flag: "isSciMath" }, count: 1 }],
    },
    {
      id: "techElectives",
      showProgress: true,
      label: "Technical electives",
      tooltip:
        "3 more courses from any of the six areas. One may come from another department with ECE approval (not checked here; add it as a custom course with an area)",
      section: "groups",
      type: "slots",
      pools: [{ where: { group: "any" }, count: 3 }],
    },
  ],
  // Calendar: of the 8 breadth and depth courses, at least 4 from Areas 5-6
  // gives Computer, at least 5 from Areas 1-4 gives Electrical.
  designation: {
    type: "derived",
    computerGroups: ["5", "6"],
    ceMin: 4,
    eeMin: 5,
  },
  manualChecks:
    "Natural sciences, Free elective, PEY / 600h technical XP, CEAB, No exclusion violation, Within 1.5 credit ArtSci -300/-400 limit",
};

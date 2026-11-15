// The normal first- and second-year ECE courses. Everyone planning years 3
// and 4 has taken these, so a prerequisite that names one is already met.
// Approved substitutions (e.g. APS162 for MAT186) are not listed: they stand
// in for a course that is.
export const coreCourses: ReadonlySet<string> = new Set([
  // first year
  "APS100", "APS110", "APS111", "CIV100", "MAT186", "MAT188",
  "APS105", "APS112", "ECE191", "ECE110", "MAT187", "MIE100",
  // second year
  "ECE201", "ECE231", "ECE241", "ECE244", "MAT290", "MAT291",
  "ECE212", "ECE216", "ECE221", "ECE243", "ECE295",
]);

// Drops the requirements a core course already meets: a required core
// course, or a "one of" group that has a core course among its options.
export const withoutCoreCourses = (reqs?: (string | string[])[]) =>
  (reqs ?? []).filter((req) =>
    Array.isArray(req)
      ? !req.some((code) => coreCourses.has(code))
      : !coreCourses.has(req)
  );

export const PLAN_TERMS = ["XX", "3F", "3S", "4F", "4S"] as const;
export type PlanTerm = (typeof PLAN_TERMS)[number];
export type PlanTerms = Partial<Record<PlanTerm, string[]>>;

// Markdown noise that may come before a term label: spaces, - * > ` | and **
const LEADING_NOISE = /^[\s*>`|-]+/;
const TERM_LINE = /^(XX|3F|3S|4F|4S)\s*[*`|]*\s*[:-]/i;

/**
 * Reads a plan from text that may be a whole AI reply. A plan line starts
 * with a term label followed by ":" or "-", e.g. `3F: ECE302, ECE345`.
 * The first line for each term wins. Returns only the terms it found.
 */
export const parsePlan = (text: string): PlanTerms => {
  const plan: PlanTerms = {};

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(LEADING_NOISE, "");
    const match = TERM_LINE.exec(line);
    if (!match) continue;

    const term = match[1].toUpperCase() as PlanTerm;
    if (plan[term]) continue;

    const codes = (line.slice(match[0].length).match(/[A-Z]{3}\d{3}/gi) ?? [])
      .map((code) => code.toUpperCase());
    plan[term] = codes.filter((code, i) => codes.indexOf(code) === i);
  }

  return plan;
};

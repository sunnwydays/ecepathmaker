export const PLAN_TERMS = ["XX", "3F", "3S", "4F", "4S"] as const;
export type PlanTerm = (typeof PLAN_TERMS)[number];
export type PlanTerms = Partial<Record<PlanTerm, string[]>>;

// Markdown noise that may come before a term label: spaces, - * > ` | and **
const LEADING_NOISE = /^[\s*>`|-]+/;
const TERM_LINE = /^(XX|3F|3S|4F|4S)\s*[*`|]*\s*[:-]/i;
// Copying a whole reply can glue a code block's language label ("text",
// "Plaintext") and the line before it onto its first line:
// "...20 credits).Plaintext3F: ECE302". Only the part after the label counts.
const GLUED_LINE = /text(XX|3F|3S|4F|4S)\s*:/gi;

const findTerm = (line: string) => {
  const glued = [...line.matchAll(GLUED_LINE)].pop();
  if (glued) return { term: glued[1], rest: line.slice(glued.index! + glued[0].length) };
  const stripped = line.replace(LEADING_NOISE, "");
  const match = TERM_LINE.exec(stripped);
  if (!match) return null;
  return { term: match[1], rest: stripped.slice(match[0].length) };
};

/**
 * Reads a plan from text that may be a whole AI reply. A plan line starts
 * with a term label followed by ":" or "-", e.g. `3F: ECE302, ECE345`.
 * The last line for each term wins: the prompt asks for the final plan at
 * the end, after any drafts or alternatives. Returns only the terms it found.
 */
export const parsePlan = (text: string): PlanTerms => {
  const plan: PlanTerms = {};

  for (const line of text.split(/\r?\n/)) {
    const found = findTerm(line);
    if (!found) continue;

    const term = found.term.toUpperCase() as PlanTerm;
    const codes = (found.rest.match(/[A-Z]{3}\d{3}/gi) ?? []).map((code) =>
      code.toUpperCase()
    );
    plan[term] = codes.filter((code, i) => codes.indexOf(code) === i);
  }

  return plan;
};

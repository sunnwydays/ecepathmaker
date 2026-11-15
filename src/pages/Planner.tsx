import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useCurriculum, useLayoutContext } from "../components/layout/Layout";
import { CurriculumPicker } from "../utils/componentImports";
import Seo from "../components/seo/Seo";
import { SITE_URL } from "../lib/site";
import { buttonPrimary, buttonSecondary, eyebrow, input, panel, textLink } from "../styles/ui";
import { clearExtra } from "../utils/extraCourses";
import {
  buildPrompt,
  groupHints,
  groupWord,
  PlannerAnswers,
} from "../utils/planner/buildPrompt";
import { parsePlan, PlanTerm } from "../utils/planner/parsePlan";
import { applyPlan } from "../utils/planner/applyPlan";
import { evaluate } from "../requirements/evaluate";

const plannerJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "AI Planner",
      item: `${SITE_URL}/plan`,
    },
  ],
};

const LOCKABLE_TERMS: PlanTerm[] = ["3F", "3S", "4F", "4S"];

type LoadResult =
  | { kind: "error" }
  | { kind: "loaded"; placed: number; warnings: string[]; unmet: string[] };

const Step = ({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) => (
  <section className={`${panel} flex flex-col gap-4 p-5 dark:text-gray-50`}>
    <div>
      <p className={eyebrow}>Step {step}</p>
      <h3 className="text-lg font-medium">{title}</h3>
    </div>
    {children}
  </section>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="flex flex-col gap-1">
    <span className="text-sm font-medium">{label}</span>
    {children}
  </label>
);

const Planner = () => {
  const curriculum = useCurriculum();
  const {
    courses,
    setCourses,
    setCoursesUsed,
    coursesOnGrid,
    setCoursesOnGrid,
    setDependencies,
  } = useLayoutContext();

  const [interests, setInterests] = useState<string[]>([]);
  const [interestNotes, setInterestNotes] = useState("");
  const [designation, setDesignation] =
    useState<PlannerAnswers["designation"]>("none");
  const [useGrid, setUseGrid] = useState(true);
  const [lockedTerms, setLockedTerms] = useState<PlanTerm[]>([]);
  const [taken, setTaken] = useState("");
  const [mustTake, setMustTake] = useState("");
  const [avoid, setAvoid] = useState("");
  const [notes, setNotes] = useState("");

  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const [planText, setPlanText] = useState("");
  const [result, setResult] = useState<LoadResult | null>(null);
  const [fixCopied, setFixCopied] = useState(false);

  // A message to paste back into the same chat so the AI fixes its plan
  const fixMessage =
    result?.kind === "loaded" && (result.warnings.length || result.unmet.length)
      ? [
          "ecepathmaker.com checked your plan and found these problems:",
          ...result.warnings.map((w) => `- ${w}`),
          ...result.unmet.map((u) => `- Not met: ${u}`),
          "",
          "Please fix them and give me the corrected plan in the same format, all four terms in one code block.",
        ].join("\n")
      : "";

  const handleCopyFix = async () => {
    try {
      await navigator.clipboard.writeText(fixMessage);
      setFixCopied(true);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Group ids differ between curricula, so ticked interests cannot carry over
  useEffect(() => {
    setInterests((prev) => (prev.length ? [] : prev));
  }, [curriculum.id]);

  const gridHasCourses = Object.values(coursesOnGrid).some(Boolean);
  const includeGrid = gridHasCourses && useGrid;

  const prompt = useMemo(
    () =>
      buildPrompt({
        answers: {
          interests,
          interestNotes,
          designation,
          includeGrid,
          lockedTerms,
          taken,
          mustTake,
          avoid,
          notes,
        },
        courses,
        coursesOnGrid,
        curriculum,
      }),
    [
      interests,
      interestNotes,
      designation,
      includeGrid,
      lockedTerms,
      taken,
      mustTake,
      avoid,
      notes,
      courses,
      coursesOnGrid,
      curriculum,
    ]
  );

  const toggle = <T,>(list: T[], item: T) =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2000);
    }
  };

  const handleLoad = () => {
    const plan = parsePlan(planText);
    if (!Object.keys(plan).length) {
      setResult({ kind: "error" });
      return;
    }
    const applied = applyPlan({ plan, courses, coursesOnGrid });
    const stillOnGrid = new Set(Object.values(applied.coursesOnGrid));
    const removed = Object.values(coursesOnGrid).filter(
      (code) => code && !stillOnGrid.has(code)
    );

    setCoursesOnGrid(applied.coursesOnGrid);
    setCoursesUsed(applied.coursesUsed);
    setDependencies(applied.dependencies);
    // A course that left the grid must not keep its extra flag
    const nextCourses = clearExtra(courses, removed);
    setCourses(nextCourses);
    const check = evaluate(curriculum, {
      courses: nextCourses,
      coursesOnGrid: applied.coursesOnGrid,
      coursesUsed: applied.coursesUsed,
    });
    setResult({
      kind: "loaded",
      placed: applied.placed,
      warnings: applied.warnings,
      unmet: check.results
        .filter((r) => !r.met)
        .map((r) => `${r.label} (${r.have}/${r.need}): ${r.tooltip}`),
    });
    setFixCopied(false);
  };

  const checkbox = "flex items-center gap-2";
  const word = groupWord(curriculum);

  return (
    <div>
      <Seo
        title="AI Planner"
        path="/plan"
        description="Plan your UofT ECE courses with any AI chat: answer a few questions, copy the prompt, and load the plan back into the Maker to check it"
        jsonLd={plannerJsonLd}
      />
      <h2 className="mb-2 text-2xl font-medium dark:text-gray-50">
        🤖 Plan your courses with any AI chat
      </h2>
      <p className="mb-8 dark:text-gray-50">
        Free, no account needed. Answer a few questions, paste the prompt into
        an AI chat, then bring its plan back here and the Maker checks it.
      </p>

      <div className="flex flex-col gap-6">
        <Step step={1} title="About you">
          <CurriculumPicker />

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">
              What are you interested in?
            </legend>
            {curriculum.groups.map((group) => (
              <label key={group.id} className={checkbox}>
                <input
                  type="checkbox"
                  checked={interests.includes(group.id)}
                  onChange={() => setInterests((prev) => toggle(prev, group.id))}
                  data-testid={`interest-${group.id}`}
                />
                <span>
                  {word} {group.label}
                  {groupHints[curriculum.id]?.[group.id] &&
                    `: ${groupHints[curriculum.id][group.id]}`}
                </span>
              </label>
            ))}
          </fieldset>

          <Field label="Anything else you're into? (e.g. robotics, ML, power)">
            <input
              type="text"
              value={interestNotes}
              onChange={(e) => setInterestNotes(e.target.value)}
              className={input}
              data-testid="interest-notes"
            />
          </Field>

          {curriculum.designation.type === "derived" && (
            <fieldset className="flex flex-wrap gap-4">
              <legend className="mb-1 text-sm font-medium">Graduate as</legend>
              {(
                [
                  ["CE", "Computer"],
                  ["EE", "Electrical"],
                  ["none", "No preference"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className={checkbox}>
                  <input
                    type="radio"
                    name="designation"
                    value={value}
                    checked={designation === value}
                    onChange={() => setDesignation(value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </fieldset>
          )}

          {gridHasCourses && (
            <div className="flex flex-col gap-2">
              <label className={checkbox}>
                <input
                  type="checkbox"
                  checked={useGrid}
                  onChange={(e) => setUseGrid(e.target.checked)}
                  data-testid="use-grid"
                />
                <span>Start from my current grid</span>
              </label>
              {useGrid && (
                <fieldset className="ml-6 flex flex-wrap gap-4">
                  <legend className="mb-1 text-sm">
                    Terms that are done or locked in
                  </legend>
                  {LOCKABLE_TERMS.map((term) => (
                    <label key={term} className={checkbox}>
                      <input
                        type="checkbox"
                        checked={lockedTerms.includes(term)}
                        onChange={() =>
                          setLockedTerms((prev) => toggle(prev, term))
                        }
                        data-testid={`lock-${term}`}
                      />
                      <span>{term}</span>
                    </label>
                  ))}
                </fieldset>
              )}
            </div>
          )}

          <Field label="Courses you took before third year that count toward the degree, like CS or HSS electives (leave empty if none)">
            <input
              type="text"
              value={taken}
              onChange={(e) => setTaken(e.target.value)}
              className={input}
              data-testid="taken"
            />
          </Field>
          <Field label="Courses you must take">
            <input
              type="text"
              value={mustTake}
              onChange={(e) => setMustTake(e.target.value)}
              className={input}
              data-testid="must-take"
            />
          </Field>
          <Field label="Courses to avoid">
            <input
              type="text"
              value={avoid}
              onChange={(e) => setAvoid(e.target.value)}
              className={input}
              data-testid="avoid"
            />
          </Field>
          <Field label="Anything else? (workload, minors, PEY, ...)">
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={input}
              data-testid="notes"
            />
          </Field>
        </Step>

        <Step step={2} title="Copy your prompt">
          <textarea
            readOnly
            rows={12}
            value={prompt}
            aria-label="Generated prompt"
            className={`${input} w-full font-mono text-xs`}
            data-testid="planner-prompt"
          />
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleCopy}
              className={`${buttonPrimary} ${copied ? "opacity-80" : ""}`}
              data-testid="copy-prompt"
            >
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <p className="text-sm">
              Paste it into ChatGPT, Claude, Gemini or any other AI chat.
            </p>
          </div>
          {copyFailed && (
            <p role="status" className="text-sm">
              Could not copy. Select the text and copy it yourself
            </p>
          )}
        </Step>

        <Step step={3} title="Bring the plan back">
          <p className="text-sm">
            Paste the AI&apos;s final plan (or its whole reply). Only the terms
            in the plan are replaced on your grid; save your layout in the
            Maker first if you want to keep it.
          </p>
          <textarea
            rows={6}
            value={planText}
            onChange={(e) => setPlanText(e.target.value)}
            placeholder={"3F: ECE302, ECE345, ...\n3S: ...\n4F: ...\n4S: ..."}
            aria-label="Plan from the AI"
            className={`${input} w-full font-mono text-sm`}
            data-testid="plan-input"
          />
          <div>
            <button
              type="button"
              onClick={handleLoad}
              disabled={!planText.trim()}
              className={`${buttonPrimary} disabled:cursor-not-allowed disabled:opacity-50`}
              data-testid="load-plan"
            >
              Load into Maker
            </button>
          </div>
          {result?.kind === "error" && (
            <p role="status" className="text-sm text-comp3 dark:text-comp1">
              No plan found. It should look like <code>3F: ECE302, ECE345</code>
            </p>
          )}
          {result?.kind === "loaded" && (
            <div role="status" className="flex flex-col gap-2 text-sm">
              <p>
                Loaded {result.placed} {result.placed === 1 ? "course" : "courses"}.{" "}
                <Link to="/" className={textLink}>
                  Check it in the Maker
                </Link>
              </p>
              {result.warnings.length > 0 && (
                <ul className="list-disc pl-5">
                  {result.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              )}
              {result.unmet.length ? (
                <>
                  <p className="font-medium">Requirements not met yet:</p>
                  <ul className="list-disc pl-5" data-testid="plan-unmet">
                    {result.unmet.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="font-medium" data-testid="plan-meets">
                  Meets every requirement the site checks. Still check:{" "}
                  {curriculum.manualChecks}
                </p>
              )}
              {fixMessage && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyFix}
                    className={buttonSecondary}
                    data-testid="copy-fix"
                  >
                    Copy problems for the AI
                  </button>
                  <span>
                    {fixCopied
                      ? "Copied. Paste it into the same chat."
                      : "Paste them into the same chat to get a fixed plan."}
                  </span>
                </div>
              )}
            </div>
          )}
        </Step>
      </div>
    </div>
  );
};

export default Planner;

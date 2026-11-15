import { curricula, DEFAULT_CURRICULUM_ID } from "../../requirements/curricula";
import { PlannerAnswers, Workload } from "./buildPrompt";

export interface SharedAnswers {
  curriculum: string | null;
  interests: string[];
  interestNotes: string;
  designation: PlannerAnswers["designation"];
  workload: Workload;
  taken: string;
  mustTake: string;
  avoid: string;
}

const DESIGNATIONS: PlannerAnswers["designation"][] = ["CE", "EE", "none"];
const WORKLOADS: Workload[] = ["even", "front", "lightThird"];
const MAX_TEXT = 200;

/** Reads the short answers from a link; anything unknown falls back to the default. */
export const readShared = (params: URLSearchParams): SharedAnswers => {
  const text = (key: string) => (params.get(key) ?? "").slice(0, MAX_TEXT);
  const c = params.get("c");
  const curriculum = c && curricula.some((x) => x.id === c) ? c : null;
  const d = params.get("d") as PlannerAnswers["designation"];
  const w = params.get("w") as Workload;
  return {
    curriculum,
    interests: (params.get("i") ?? "").split(",").filter(Boolean),
    interestNotes: text("n"),
    designation: DESIGNATIONS.includes(d) ? d : "none",
    workload: WORKLOADS.includes(w) ? w : "even",
    taken: text("t"),
    mustTake: text("m"),
    avoid: text("a"),
  };
};

/** Writes only the answers that differ from the defaults. */
export const writeShared = (a: Omit<SharedAnswers, "curriculum"> & { curriculum: string }) => {
  const params = new URLSearchParams();
  if (a.curriculum !== DEFAULT_CURRICULUM_ID) params.set("c", a.curriculum);
  if (a.interests.length) params.set("i", a.interests.join(","));
  if (a.interestNotes) params.set("n", a.interestNotes);
  if (a.designation !== "none") params.set("d", a.designation);
  if (a.workload !== "even") params.set("w", a.workload);
  if (a.taken) params.set("t", a.taken);
  if (a.mustTake) params.set("m", a.mustTake);
  if (a.avoid) params.set("a", a.avoid);
  return params;
};

import { Curriculum } from "../types";
import { ecePre2026 } from "./ecePre2026";
import { ele2026, cpe2026 } from "./ece2026";

export const curricula: Curriculum[] = [ecePre2026, ele2026, cpe2026];

// Existing users, and anyone with no saved choice, stay on this one.
export const DEFAULT_CURRICULUM_ID = ecePre2026.id;

export const getCurriculum = (id?: string | null): Curriculum =>
  curricula.find((curriculum) => curriculum.id === id) ?? ecePre2026;

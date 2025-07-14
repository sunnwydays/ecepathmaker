import { GridPosition, YearTerm } from "../types/types";

export const getYearTerm = (pos: GridPosition): YearTerm => {
  return pos.split(".")[0] as YearTerm;
};

export const getNextYearTerm = (yearTerm: YearTerm | string): YearTerm | string => {
  if (yearTerm === "3F") return "3S";
  if (yearTerm === "3S") return "4F";
  if (yearTerm === "4F") return "4S";
  if (yearTerm === "4S") return "XX";
  return ""; // Fallthrough case, no next term
}

export const getPrevYearTerm = (yearTerm: YearTerm | string): YearTerm | string => {
  if (yearTerm === "3S") return "3F";
  if (yearTerm === "4F") return "3S";
  if (yearTerm === "4S") return "4F";
  return ""; // No previous term before 3F or XX
};
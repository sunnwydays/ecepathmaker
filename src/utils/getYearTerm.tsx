import { GridPosition, YearTerm } from "../types/types";

export const getYearTerm = (pos: GridPosition): YearTerm => {
  return pos.split(".")[0] as YearTerm;
};

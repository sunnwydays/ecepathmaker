import { FilterState } from "../types/types";

export const defaultFilters: FilterState = {
  searchTerm: "",
  streams: [],
  availableF: true,
  availableS: true,
  isCS: false,
  isHSS: false,
  isSciMath: false,
  isArtSci: false,
  isEng: false,
};

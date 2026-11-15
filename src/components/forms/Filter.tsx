import { FC, useEffect, useRef, useState } from "react";
import { FilterState } from "../../types/types";
import TextInput from "./TextInput";
import { useCurriculum, useLayoutContext } from "../layout/Layout";
import { filterCourses } from "../../utils/utilImports";
import { useAddToGrid } from "../../utils/useAddToGrid";
import { UniqueIdentifier } from "@dnd-kit/core";
import Announcement from "../info/Announcement";
import { defaultFilters } from "../../utils/defaultFilters";
import { eyebrow, panelEdge } from "../../styles/ui";

const Filter: FC<{
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  // Enter adds the single matching course to the grid; only wanted on the Maker
  quickAdd?: boolean;
}> = ({ filters, setFilters, quickAdd = false }) => {
  const curriculum = useCurriculum();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;

    setFilters((prev) => {
      switch (name) {
        case "searchTerm":
          return { ...prev, searchTerm: value };
        case "streams": {
          const streams = prev.streams.includes(value)
            ? prev.streams.filter((s) => s !== value)
            : [...prev.streams, value];
          return { ...prev, streams };
        }
        default:
          return { ...prev, [name]: checked };
      }
    });
  };
  
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (submitMessage) {
      timeoutRef.current = setTimeout(() => {
        setSubmitMessage('');
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [submitMessage]);

  const { courses, coursesUsed } = useLayoutContext();

  const putCourseOnAvailable = useAddToGrid();

  // If only 1 course in search result, then add that to the earliest empty slot
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAdd) return;

    let code: UniqueIdentifier = '';
    let found = false;

    for (const [potentialCode, potentialPos] of Object.entries(coursesUsed)) {
      if (filterCourses(filters, potentialCode, courses[potentialCode], curriculum)) {
        // Check position before found in case another course matching filter is already on grid
        if (potentialPos) continue;

        if (found) {
          setIsSubmitSuccess(true);
          setSubmitMessage(`Filter for one course and press enter to add it to the earliest available slot!`);
          return;
        }

        code = potentialCode;
        found = true;
      }
    }

    if (!found) {
      setIsSubmitSuccess(false);
      setSubmitMessage(`No unused courses match: ${filters.searchTerm}!`);
      return;
    }

    const pos = putCourseOnAvailable(code);

    if (!pos) {
      setIsSubmitSuccess(false);
      setSubmitMessage(`No valid slots for ${code}!`);
      return;
    }

    setIsSubmitSuccess(true);
    setSubmitMessage(`Added ${code} to ${pos}!`);
    setFilters(prev => ({ ...prev, searchTerm: "" }));
  };

  const resetFilters = () => setFilters({ ...defaultFilters });

  return (
    <div
      className={`
        p-4 mt-4 bg-green1 dark:bg-green3 bg-opacity-50 dark:bg-opacity-70 
        ${panelEdge} text-center items-center flex flex-col dark:text-gray-50
      `}
      data-testid="filter"
    >
      <form 
        className="flex gap-x-8 gap-y-4 justify-center items-center flex-wrap"
        onSubmit={handleSubmit}
      >
        <h2 className="font-semibold text-xl">Filter</h2>
        <button
          type="button"
          onClick={resetFilters}
          className="
            text-sm text-gray-500 hover:text-gray-700 py-2
            dark:text-gray-300 dark:hover:text-gray-200"
          data-testid="reset-filters"
        >
          Reset Filters
        </button>
        <div className="space-y-2">
          <TextInput
            name="searchTerm"
            value={filters.searchTerm}
            placeholder="Search by code or name"
            onChange={handleInputChange}
            testId="filter-search"
            searchIcon
          />
        </div>

        <div className="space-y-2">
          <h3 className={eyebrow}>Streams</h3>
          <div className="flex gap-4 justify-center">
            {curriculum.groups.map((group) => (
              <label key={group.id} className="flex items-center gap-2">
                <input
                  name="streams"
                  type="checkbox"
                  value={group.id}
                  onChange={handleInputChange}
                  checked={filters.streams?.includes(group.id)}
                  data-testid={`filter-stream-${group.id}`}
                />
                <span>{group.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className={eyebrow}>Term Availability</h3>
          <div className="flex gap-4 justify-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="availableF"
                value="F"
                onChange={handleInputChange}
                checked={filters.availableF}
                data-testid="filter-fall"
              />
              <span>F</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="availableS"
                value="S"
                onChange={handleInputChange}
                checked={filters.availableS}
              />
              <span>S</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className={eyebrow}>Course Type</h3>
          <div className="flex gap-4 justify-center">
            <label className="flex items-center gap-2">
              <input
                name="isCS"
                type="checkbox"
                onChange={handleInputChange}
                value="CS"
                checked={filters.isCS}
              />
              <span>CS</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                name="isHSS"
                type="checkbox"
                onChange={handleInputChange}
                value="HSS"
                checked={filters.isHSS}
              />
              <span>HSS</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                name="isSciMath"
                type="checkbox"
                onChange={handleInputChange}
                value="SciMath"
                checked={filters.isSciMath}
              />
              <span>Sci/Math</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                name="isArtSci"
                type="checkbox"
                onChange={handleInputChange}
                value="ArtSci"
                checked={filters.isArtSci}
                data-testid="filter-artsci"
              />
              <span>ArtSci</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                name="isEng"
                type="checkbox"
                onChange={handleInputChange}
                value="Eng"
                checked={filters.isEng}
                data-testid="filter-eng"
              />
              <span>Engi</span>
            </label>
          </div>
        </div>
      </form>
      {submitMessage && (
        <Announcement success={isSubmitSuccess}>{submitMessage}</Announcement>
      )}
    </div>
  );
};

export default Filter;

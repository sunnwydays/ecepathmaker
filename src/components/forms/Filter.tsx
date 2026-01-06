import { FC, useEffect, useRef, useState } from "react";
import { FilterState, GridPosition, YearTerm } from "../../types/types";
import TextInput from "./TextInput";
import { useLayoutContext } from "../layout/Layout";
import { addDependencies, filterCourses, getValidYearTerms } from "../../utils/utilImports";
import { UniqueIdentifier } from "@dnd-kit/core";
import Announcement from "../info/Announcement";

const Filter: FC<{
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}> = ({ filters, setFilters }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;

    setFilters((prev) => {
      switch (name) {
        case "searchTerm":
          return { ...prev, searchTerm: value };
        case "streams": {
          const streamNum = parseInt(value);
          const streams = prev.streams.includes(streamNum)
            ? prev.streams.filter((s) => s !== streamNum)
            : [...prev.streams, streamNum];
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

  const {
    courses,
    coursesUsed,
    setCoursesUsed,
    coursesOnGrid,
    setCoursesOnGrid,
    dependencies,
    setDependencies,
  } = useLayoutContext();

  // Puts the course on the earliest available slot
  const putCourseOnAvailable = (code: UniqueIdentifier): GridPosition => {
    const course = courses[code];

    const ValidYearTermsProps = {
      coursesOnGrid,
      coursesUsed,
      course
    };
    const validYearTerms = getValidYearTerms(ValidYearTermsProps);

    let targetPos: GridPosition = '';
    for (const [pos, course] of Object.entries(coursesOnGrid)) {
      if (!course && validYearTerms[(pos.slice(0, 2) as YearTerm)]) {
        targetPos = pos as GridPosition;
        break;
      }
    }

    if (!targetPos) return '';

    addDependencies({code, courses, dependencies, setDependencies});
    setCoursesUsed((prev) => ({
      ...prev,
      [code]: targetPos as GridPosition,
    }));
    setCoursesOnGrid((prev) => ({
      ...prev,
      [targetPos]: code,
    }));

    return targetPos;
  }

  // If only 1 course in search result, then add that to the earliest empty slot
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let code: UniqueIdentifier = '';
    let found = false;

    for (const [potentialCode, potentialPos] of Object.entries(coursesUsed)) {
      if (filterCourses(filters, potentialCode, courses[potentialCode])) {
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

  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      streams: [],
      availableF: true,
      availableS: true,
      isCS: false,
      isHSS: false,
      isSciMath: false,
      isArtSci: false,
      isEng: false,
    });
  };

  return (
    <div
      className="
        p-4 mt-4 bg-green1 dark:bg-green3 bg-opacity-50 dark:bg-opacity-70 
        rounded shadow text-center items-center flex flex-col dark:text-gray-50
      "
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
          />
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Streams</h3>
          <div className="flex gap-4 justify-center">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <label key={num} className="flex items-center gap-2">
                <input
                  name="streams"
                  type="checkbox"
                  value={num}
                  onChange={handleInputChange}
                  checked={filters.streams?.includes(num)}
                  data-testid={`filter-stream-${num}`}
                />
                <span>{num}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Term Availability</h3>
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
          <h3 className="font-medium">Course Type</h3>
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

import { FC } from "react";
import { FilterState } from "../../types/types";
import TextInput from "./TextInput";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    </div>
  );
};

export default Filter;

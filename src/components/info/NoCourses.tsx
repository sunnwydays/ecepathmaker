import { FC } from "react";
import { emptyState, textLink } from "../../styles/ui";

// "Nothing matches the filter", with a way out
const NoCourses: FC<{ onReset: () => void }> = ({ onReset }) => (
  <div className={`w-full select-none ${emptyState}`}>
    <p>No courses match the current filter</p>
    <button type="button" onClick={onReset} className={`mt-2 text-sm ${textLink}`}>
      Reset filters
    </button>
  </div>
);

export default NoCourses;

import { FC, useEffect, useState } from "react";
import { useLayoutContext } from "../layout/Layout";
import Announcement from "../info/Announcement";

const SIXTH_SLOTS = ["XX.6", "3F.6", "3S.6", "4F.6", "4S.6"] as const;

// Switch for the sixth (overloading) column. The column is also visible while
// any of its slots holds a course, and then it cannot be switched off.
const SixthToggle: FC = () => {
  const { showSixth, setShowSixth, coursesOnGrid } = useLayoutContext();
  const [refused, setRefused] = useState(false);

  const filled = SIXTH_SLOTS.some((slot) => coursesOnGrid[slot]);
  const on = showSixth || filled;

  useEffect(() => {
    if (!refused) return;
    const timeout = setTimeout(() => setRefused(false), 2000);
    return () => clearTimeout(timeout);
  }, [refused]);

  const handleClick = () => {
    if (!on) setShowSixth(true);
    else if (filled) setRefused(true);
    else setShowSixth(false);
  };

  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-disabled={filled}
        onClick={handleClick}
        data-testid="toggle-sixth"
        className={`mb-4 flex items-center gap-2 font-medium dark:text-gray-50 ${
          filled ? "opacity-50 cursor-not-allowed saturate-50" : ""
        }`}
      >
        <span>6th column</span>
        <span
          className={`relative inline-block h-6 w-11 rounded-full transition-colors ${
            on ? "bg-green2" : "bg-neutral3 dark:bg-gray-500"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
              on ? "translate-x-5" : ""
            }`}
          />
        </span>
      </button>
      {refused && (
        <Announcement>Move the courses out of the 6th column first</Announcement>
      )}
    </>
  );
};

export default SixthToggle;

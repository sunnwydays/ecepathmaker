import { FC, useEffect, useRef, useState } from "react";
import { LoadLayoutProps } from "../../types/types";
import { Announcement } from "../../utils/componentImports";
import { isValidString, parseString } from "../../utils/utilImports";

enum Load {
  NONE,
  SUCCESS,
  ERROR,
}

const LoadLayout: FC<LoadLayoutProps> = ({
  courses,
  coursesUsed,
  setCourses,
  setCoursesOnGrid,
  setCoursesUsed,
}) => {
  const [str, setStr] = useState("");
  const [load, setLoad] = useState(Load.NONE);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStr(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!str.trim().length) return;
    if (!isValidString(str)) {
      setLoad(Load.ERROR);
      return;
    }

    const result = parseString(str);

    setCoursesOnGrid(result.coursesOnGrid);
    setCourses({ ...courses, ...result.courses });
    Object.keys(coursesUsed).forEach((key) => {
      coursesUsed[key] = "";
    });
    setCoursesUsed({ ...coursesUsed, ...result.coursesUsed });
    setLoad(Load.SUCCESS);
    setStr("");
  };

  useEffect(() => {
    if (load !== Load.NONE) {
      timeoutRef.current = setTimeout(() => {
        setLoad(Load.NONE);
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [load]);

  return (
    <section>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <input
            type="text"
            value={str}
            placeholder="Layout string"
            className="w-full p-2 border rounded"
            onChange={handleInputChange}
            data-testid="string-input"
          />
        </div>
        <button
          type="submit"
          className="
                        bg-green2 text-white px-4 py-2 rounded
                        hover:bg-green3 transition-all
                        disabled:bg-opacity-70 
                        disabled:hover:bg-green2 disabled:hover:bg-opacity-70
                        disabled:cursor-not-allowed
                    "
          data-testid="load-layout"
          disabled={!str.trim().length}
        >
          Load layout
        </button>
      </form>
      {load === Load.SUCCESS && (
        <Announcement success>Layout loaded!</Announcement>
      )}
      {load === Load.ERROR && <Announcement>Invalid layout!</Announcement>}
    </section>
  );
};

export default LoadLayout;

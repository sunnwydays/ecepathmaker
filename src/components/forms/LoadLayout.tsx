import { FC, useEffect, useRef, useState } from "react";
import { LoadLayoutProps } from "../../types/types";
import { Announcement } from "../../utils/componentImports";
import { isValidString, parseString } from "../../utils/utilImports";
import Preset from "./Preset";
import TextInput from "./TextInput";
import SubmitButton from "../SubmitButton";

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
  setDependencies,
  savedLayouts,
}) => {
  const [str, setStr] = useState("");
  const [load, setLoad] = useState(Load.NONE);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStr(e.target.value);
  };

  const applyString = (str: string) => {
    const result = parseString(str);

    setCoursesOnGrid(result.coursesOnGrid);
    setCourses({ ...courses, ...result.courses });
    Object.keys(coursesUsed).forEach((key) => {
      coursesUsed[key] = "";
    });
    setCoursesUsed({ ...coursesUsed, ...result.coursesUsed });
    setDependencies(result.dependencies);
    setLoad(Load.SUCCESS);
    setStr("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!str.trim().length) return;
    if (!isValidString(str)) {
      setLoad(Load.ERROR);
      return;
    }

    applyString(str);
  };

  const loadPreset = (index: number) => {
    applyString(savedLayouts[index].str);
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
          <TextInput
            name="layout-string"
            value={str}
            placeholder="Layout string"
            onChange={handleInputChange}
            testId="string-input"
          />
        </div>
        <SubmitButton disabled={!str.trim().length} testId="load-layout">
          Load layout
        </SubmitButton>
      </form>
      {load === Load.SUCCESS && (
        <Announcement success>Layout loaded!</Announcement>
      )}
      {load === Load.ERROR && <Announcement>Invalid layout!</Announcement>}

      <div className="lg:grid grid-cols-2 flex flex-col gap-2 mt-4">
        {savedLayouts.map(
          (layout, index) =>
            layout?.name && (
              <Preset
                key={index}
                name={layout.name}
                index={index}
                loadPreset={loadPreset}
              />
            )
        )}
      </div>
    </section>
  );
};

export default LoadLayout;

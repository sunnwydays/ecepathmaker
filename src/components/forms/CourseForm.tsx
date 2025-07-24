import { HexColorPicker, HexColorInput } from "react-colorful";
import { FC, useEffect, useRef, useState } from "react";
import { CourseFormProps } from "../../types/types";
import {
  validateCourseCode,
  validateCourseName,
  validatePrerequisites,
} from "../../utils/utilImports";
import Announcement from "../info/Announcement";
import TextInput from "./TextInput";

const CourseForm: FC<CourseFormProps> = ({
  setCourses,
  setCoursesUsed,
  customInfo,
  setCustomInfo,
  preqString,
  setPreqString,
  coreqString,
  setCoreqString,
}) => {
  const [errors, setErrors] = useState({
    code: false,
    name: false,
    preq: false,
  });
  const errorMessages = {
    code: "Must be 3 letters followed by 3 numbers",
    name: 'Course name cannot contain "**"',
    preq: "Must be comma (and)- or pipe (or)-separated course codes",
  };

  const parsePrerequisites = (preqString: string): (string | string[])[] => {
    if (!preqString) return [];

    // Split into AND groups
    return preqString
      .split(",")
      .map((group) => {
        // Check if group has OR conditions
        if (group.includes("|")) {
          return group
            .split("|")
            .map((code) => code.trim().toUpperCase())
            .filter((code) => code.length > 0);
        }
        // Single prerequisite
        const code = group.trim().toUpperCase();
        return code.length > 0 ? code : [];
      })
      .filter((group) =>
        Array.isArray(group) ? group.length > 0 : group.length > 0
      );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    switch (name) {
      case "code":
        setErrors((prev) => ({ ...prev, code: false }));
        setCustomInfo((prev) => ({ ...prev, code: value.toUpperCase() }));
        break;
      case "name":
        setErrors((prev) => ({ ...prev, name: false }));
        setCustomInfo((prev) => ({ ...prev, name: value }));
        break;
      case "preq":
        setErrors((prev) => ({ ...prev, preq: false }));
        setPreqString(value.toUpperCase());
        setCustomInfo((prev) => ({ ...prev, preq: parsePrerequisites(value) }));
        break;
      case "coreq":
        setErrors((prev) => ({ ...prev, coreq: false }));
        setCoreqString(value.toUpperCase());
        setCustomInfo((prev) => ({ ...prev, coreq: parsePrerequisites(value) }));
        // may need to create a separate function for coreq to ensure it only accepts one coreq
        console.log("Coreq set to:", value);
        console.log("Parsed coreq:", parsePrerequisites(value));
        break;
      case "streams": {
        const streamNum = parseInt(value);
        if (customInfo.streams?.includes(streamNum)) {
          setCustomInfo((prev) => ({
            ...prev,
            streams: customInfo.streams?.filter((s) => s !== streamNum),
          }));
        } else {
          setCustomInfo((prev) => ({
            ...prev,
            streams: [...(customInfo.streams || []), streamNum],
          }));
        }
        break;
      }
      case "term":
        setCustomInfo((prev) => ({
          ...prev,
          onlyF: value === "F",
          onlyS: value === "S",
        }));
        break;
      case "isCS":
        if (customInfo.isCS) {
          setCustomInfo((prev) => ({ ...prev, isCS: false, isHSS: false }));
        } else {
          setCustomInfo((prev) => ({ ...prev, isCS: true }));
        }
        break;
      case "isHSS":
        if (customInfo.isHSS) {
          setCustomInfo((prev) => ({ ...prev, isHSS: false }));
        } else {
          setCustomInfo((prev) => ({ ...prev, isCS: true, isHSS: true }));
        }
        break;
      case "isSciMath":
      case "isArtSci":
        setCustomInfo((prev) => ({ ...prev, [name]: !customInfo[name] }));
        break;
      default:
        break;
    }
  };

  const handleColorChange = (color: string) => {
    setCustomInfo((prev) => ({ ...prev, color }));
  };

  const resetColor = () => {
    setCustomInfo((prev) => {
      return { ...prev, color: "E0E0E0" };
    });
  };

  const [justSubmitted, setJustSubmitted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (justSubmitted) {
      timeoutRef.current = setTimeout(() => {
        setJustSubmitted(false);
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [justSubmitted]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !validateCourseCode(customInfo.code) ||
      !validateCourseName(customInfo.name) ||
      !validatePrerequisites(preqString)
    ) {
      setErrors((prev) => ({
        ...prev,
        code: !validateCourseCode(customInfo.code),
        name: !validateCourseName(customInfo.name),
        preq: !validatePrerequisites(preqString),
      }));
      return;
    }

    setCourses((prev) => ({ ...prev, [customInfo.code]: customInfo }));
    setCoursesUsed((prev) => ({ [customInfo.code]: "", ...prev }));

    setPreqString("");
    setCoreqString("");
    // print the customInfo to console for debugging
    console.log("Custom Info submitted:", customInfo);
    setCustomInfo({
      code: "",
      name: "",
      preq: [],
      coreq: [],
      streams: [],
      color: "E0E0E0",
      isCS: false,
      isHSS: false,
      isSciMath: false,
      isArtSci: false,
      onlyF: false,
      onlyS: false,
    });

    setJustSubmitted(true);
  };

  return (
    <section className="dark:text-gray-50">
      <h2 id="add-course" className="mt-10 mb-6 text-2xl font-semibold">
        Add or update courses
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        data-testid="course-form"
      >
        {/* Course Identifier Section */}
        <div className="space-y-2">
          <TextInput
            name="code"
            value={customInfo.code}
            placeholder="Course Code (e.g. ECE444)*"
            onChange={handleInputChange}
            testId="code-input"
          />
          {errors.code && (
            <p className="text-comp3 text-sm">{errorMessages.code}</p>
          )}
          <TextInput
            name="name"
            value={customInfo.name}
            placeholder="Course Name"
            onChange={handleInputChange}
            testId="name-input"
          />
          {errors.name && (
            <p className="text-comp3 text-sm">{errorMessages.name}</p>
          )}
          <TextInput
            name="preq"
            value={preqString}
            placeholder="Prerequisites (e.g. ECE444,ECE345|ECE346)"
            onChange={handleInputChange}
            testId="preq-input"
          />
          <TextInput
            name="coreq"
            value={coreqString}
            placeholder="Corequisites (e.g. ECE302|ECE356)"
            onChange={handleInputChange}
            testId="coreq-input"
          />
          {errors.preq && (
            <p className="text-comp3 text-sm">{errorMessages.preq}</p>
          )}
          <HexColorPicker
            color={customInfo.color}
            onChange={handleColorChange}
          />
          <div className="flex gap-2">
            <HexColorInput
              name="color"
              color={customInfo.color}
              onChange={handleColorChange}
              placeholder="Colour (e.g. E0E0E0)"
              className="
                w-full p-2 border rounded min-w-72
                dark:bg-gray-400 dark:border-gray-300 dark:placeholder-gray-200"
              />
            <button
              type="button"
              className="
                bg-neutral3 text-white px-4 py-2 rounded hover:bg-neutral2 transition-all
                dark:bg-gray-500 dark:hover:bg-gray-600"
              onClick={resetColor}
            >
              reset
            </button>
          </div>
        </div>

        {/* Stream Flags */}
        <div className="space-y-2">
          <h3 className="font-semibold">Streams</h3>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <label key={num} className="flex items-center gap-2">
                <input
                  name="streams"
                  type="checkbox"
                  value={num}
                  data-testid={`stream-${num}`}
                  onChange={handleInputChange}
                  checked={customInfo.streams?.includes(num)}
                />
                <span>Stream {num}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Term Availability */}
        <div className="space-y-2">
          <h3 className="font-semibold">Term Availability</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="term"
                value="F"
                data-testid="only-f"
                onChange={handleInputChange}
                checked={!!customInfo.onlyF}
                // double bang converts undefined to false
              />
              <span>Fall Only</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="term"
                value="S"
                data-testid="only-s"
                onChange={handleInputChange}
                checked={!!customInfo.onlyS}
              />
              <span>Winter Only</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="term"
                value="B"
                onChange={handleInputChange}
                checked={!customInfo.onlyF && !customInfo.onlyS}
              />
              <span>Both Terms</span>
            </label>
          </div>
        </div>

        {/* Course Type Flags */}
        <div className="space-y-2">
          <h3 className="font-semibold">Course Type</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                name="isCS"
                type="checkbox"
                data-testid="cs"
                onChange={handleInputChange}
                value="CS"
                checked={!!customInfo.isCS}
              />
              <span>CS</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                name="isHSS"
                type="checkbox"
                data-testid="hss"
                onChange={handleInputChange}
                value="HSS"
                checked={!!customInfo.isHSS}
              />
              <span>HSS</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                name="isSciMath"
                type="checkbox"
                data-testid="scimath"
                onChange={handleInputChange}
                value="SciMath"
                checked={!!customInfo.isSciMath}
              />
              <span>Sci/Math</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                name="isArtSci"
                type="checkbox"
                data-testid="artsci"
                onChange={handleInputChange}
                value="ArtSci"
                checked={!!customInfo.isArtSci}
              />
              <span>ArtSci</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="
                        bg-green2 text-white px-4 py-2 rounded 
                        hover:bg-green3 transition-all
                        dark:bg-green3 dark:hover:bg-green4
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green2
                    "
          // disabled={???}
        >
          Add/Update Course
        </button>
      </form>

      { justSubmitted && (
        <Announcement success={true}>Course updated!</Announcement>
      )}
    </section>
  );
};

export default CourseForm;

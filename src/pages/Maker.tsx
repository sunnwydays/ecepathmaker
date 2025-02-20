import { useMemo, useState, useEffect } from "react";
import { CourseCardProps, CoursesOnGrid, CoursesUsed } from "../types/types";
import { mockCourses } from "../utils/dataImports";
import {
  CourseForm,
  CourseGrid,
  LoadLayout,
  StringDisplay,
} from "../utils/componentImports";

const Maker = () => {
  // Course info for custom course
  const [customInfo, setCustomInfo] = useState<CourseCardProps>({
    code: "",
    name: "",
    preq: [],
    streams: [],
    color: "E0E0E0",
    isCS: false,
    isHSS: false,
    isSciMath: false,
    isArtSci: false,
    onlyF: false,
    onlyS: false,
  });
  const [preqString, setPreqString] = useState("");

  // Load data from localStorage or use default values
  const [courses, setCourses] = useState(() => {
    const savedCourses = localStorage.getItem("courses");
    if (savedCourses) return JSON.parse(savedCourses);
    return mockCourses;
  });

  const initialCoursesUsed = useMemo<CoursesUsed>(() => {
    const savedCoursesUsed = localStorage.getItem("coursesUsed");
    if (savedCoursesUsed) return JSON.parse(savedCoursesUsed);

    const posMap: CoursesUsed = {};
    Object.keys(courses).forEach((courseCode) => (posMap[courseCode] = ""));
    return posMap;
  }, [courses]);

  const initialCoursesOnGrid = useMemo<CoursesOnGrid>(() => {
    const savedCoursesOnGrid = localStorage.getItem("coursesOnGrid");
    if (savedCoursesOnGrid) return JSON.parse(savedCoursesOnGrid);

    return {
      "3F.1": "",
      "3F.2": "",
      "3F.3": "",
      "3F.4": "",
      "3F.5": "",
      "3S.1": "",
      "3S.2": "",
      "3S.3": "",
      "3S.4": "",
      "3S.5": "",
      "4F.1": "",
      "4F.2": "",
      "4F.3": "",
      "4F.4": "",
      "4F.5": "",
      "4S.1": "",
      "4S.2": "",
      "4S.3": "",
      "4S.4": "",
      "4S.5": "",
      "XX.1": "",
      "XX.2": "",
      "XX.3": "",
      "XX.4": "",
      "XX.5": "",
    } as CoursesOnGrid;
  }, []);

  const [coursesUsed, setCoursesUsed] =
    useState<CoursesUsed>(initialCoursesUsed);
  const [coursesOnGrid, setCoursesOnGrid] =
    useState<CoursesOnGrid>(initialCoursesOnGrid);

  // Save courses to localStorage
  useEffect(() => {
    localStorage.setItem("courses", JSON.stringify(courses));
  }, [courses]);

  // Save coursesUsed to localStorage
  useEffect(() => {
    localStorage.setItem("coursesUsed", JSON.stringify(coursesUsed));
  }, [coursesUsed]);

  // Save coursesOnGrid to localStorage
  useEffect(() => {
    localStorage.setItem("coursesOnGrid", JSON.stringify(coursesOnGrid));
  }, [coursesOnGrid]);

  // Save everything when component unmounts (e.g. navigate to another page)
  useEffect(() => {
    return () => {
      localStorage.setItem("courses", JSON.stringify(courses));
      localStorage.setItem("coursesUsed", JSON.stringify(coursesUsed));
      localStorage.setItem("coursesOnGrid", JSON.stringify(coursesOnGrid));
    };
  }, [courses, coursesUsed, coursesOnGrid]);

  return (
    <div>
      <CourseGrid
        courses={courses}
        coursesUsed={coursesUsed}
        coursesOnGrid={coursesOnGrid}
        setCoursesUsed={setCoursesUsed}
        setCoursesOnGrid={setCoursesOnGrid}
        setCustomInfo={setCustomInfo}
        setPreqString={setPreqString}
      />
      <hr className="mt-8 stroke-2" />
      <div className="grid md:grid-cols-2 grid-cols-1 gap-x-16">
        <div>
          <h2 className="mt-10 mb-6 text-2xl font-semibold">
            Save/load layout
          </h2>
          <p className="mb-2 max-w-xl">
            Copy this string and save it for later
          </p>
          <StringDisplay courses={courses} coursesOnGrid={coursesOnGrid} />
          <p className="mt-8 mb-2 max-w-xl">
            Paste your previously copied string below to load it
          </p>
          <LoadLayout
            courses={courses}
            coursesUsed={coursesUsed}
            setCourses={setCourses}
            setCoursesUsed={setCoursesUsed}
            setCoursesOnGrid={setCoursesOnGrid}
          />
        </div>
        <CourseForm
          setCourses={setCourses}
          setCoursesUsed={setCoursesUsed}
          customInfo={customInfo}
          setCustomInfo={setCustomInfo}
          preqString={preqString}
          setPreqString={setPreqString}
        />
      </div>
    </div>
  );
};

export default Maker;

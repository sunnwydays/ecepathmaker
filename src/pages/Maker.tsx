import { useMemo, useState, useEffect } from "react";
import { CourseCardProps, CoursesOnGrid, CoursesUsed } from "../types/types";
import { mockCourses } from "../utils/dataImports";
import {
  CourseForm,
  CourseGrid,
  LoadLayout,
  SaveLayout,
} from "../utils/componentImports";
import { UniqueIdentifier } from "@dnd-kit/core";
import { emptyGrid } from "../utils/utilImports";
import { auth } from "../firebase/firebase";
import { saveLayouts } from "../firebase/firestore";
import { useLayoutContext } from "../components/layout/Layout";

const Maker = () => {
  const { savedLayouts, setSavedLayouts } = useLayoutContext();

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
  const [coreqString, setCoreqString] = useState("");

  // Load courses from localStorage or use default values
  const [courses, setCourses] = useState(() => {
    const savedCourses = localStorage.getItem("courses");
    if (savedCourses) return JSON.parse(savedCourses);
    return mockCourses;
  });
  // Save courses to localStorage
  useEffect(() => {
    localStorage.setItem("courses", JSON.stringify(courses));
  }, [courses]);

  // coursesUsed
  const initialCoursesUsed = useMemo<CoursesUsed>(() => {
    const savedCoursesUsed = localStorage.getItem("coursesUsed");
    if (savedCoursesUsed) return JSON.parse(savedCoursesUsed);

    const posMap: CoursesUsed = {};
    Object.keys(courses).forEach((courseCode) => (posMap[courseCode] = ""));
    return posMap;
  }, [courses]);
  const [coursesUsed, setCoursesUsed] =
    useState<CoursesUsed>(initialCoursesUsed);
  useEffect(() => {
    localStorage.setItem("coursesUsed", JSON.stringify(coursesUsed));
  }, [coursesUsed]);

  // coursesOnGrid
  const initialCoursesOnGrid = useMemo<CoursesOnGrid>(() => {
    const savedCoursesOnGrid = localStorage.getItem("coursesOnGrid");
    if (savedCoursesOnGrid) return JSON.parse(savedCoursesOnGrid);
    return emptyGrid;
  }, []);
  const [coursesOnGrid, setCoursesOnGrid] =
    useState<CoursesOnGrid>(initialCoursesOnGrid);
  useEffect(() => {
    localStorage.setItem("coursesOnGrid", JSON.stringify(coursesOnGrid));
  }, [coursesOnGrid]);

  // Map of co/prerequisites to their dependencies
  const initialDependencies = useMemo<
    Map<UniqueIdentifier, Set<UniqueIdentifier>>
  >(() => {
    const saved = localStorage.getItem("dependencies");
    if (!saved) {
      return new Map();
    }

    try {
      const parsed: [string, string[]][] = JSON.parse(saved);
      return new Map(parsed.map(([key, values]) => [key, new Set(values)]));
    } catch {
      return new Map();
    }
  }, []);
  const [dependencies, setDependencies] =
    useState<Map<UniqueIdentifier, Set<UniqueIdentifier>>>(initialDependencies);
  useEffect(() => {
    const obj: [UniqueIdentifier, UniqueIdentifier[]][] = Array.from(
      dependencies.entries()
    ).map(([key, valueSet]) => [key, Array.from(valueSet)]);
    localStorage.setItem("dependencies", JSON.stringify(obj));
  }, [dependencies]);

  useEffect(() => {
    localStorage.setItem("savedLayouts", JSON.stringify(savedLayouts));
    const user = auth.currentUser;
    if (user) saveLayouts(user.uid, savedLayouts);
  }, [savedLayouts]);

  return (
    <div>
      <CourseGrid
        courses={courses}
        coursesUsed={coursesUsed}
        coursesOnGrid={coursesOnGrid}
        dependencies={dependencies}
        setCoursesUsed={setCoursesUsed}
        setCoursesOnGrid={setCoursesOnGrid}
        setCustomInfo={setCustomInfo}
        setPreqString={setPreqString}
        setCoreqString={setCoreqString}
        setDependencies={setDependencies}
      />
      <hr className="mt-8 stroke-2" />
      <div className="grid md:grid-cols-2 grid-cols-1 gap-x-16 dark:text-gray-50">
        <div>
          <h2 className="mt-10 mb-4 text-2xl font-semibold">Load layout</h2>
          <p className=" mb-2 max-w-xl">
            Paste your previously copied string or load from cache
          </p>
          <LoadLayout
            courses={courses}
            coursesUsed={coursesUsed}
            setCourses={setCourses}
            setCoursesUsed={setCoursesUsed}
            setCoursesOnGrid={setCoursesOnGrid}
            setDependencies={setDependencies}
            savedLayouts={savedLayouts}
          />
          <h2 className="mt-8 mb-4 text-2xl font-semibold">Save layout</h2>
          <p className="mb-2 max-w-xl">
            Copy this string and save it for later or store layout in cache
          </p>
          <SaveLayout
            courses={courses}
            coursesOnGrid={coursesOnGrid}
            savedLayouts={savedLayouts}
            setSavedLayouts={setSavedLayouts}
          />
        </div>
        <CourseForm
          setCourses={setCourses}
          setCoursesUsed={setCoursesUsed}
          customInfo={customInfo}
          setCustomInfo={setCustomInfo}
          preqString={preqString}
          setPreqString={setPreqString}
          coreqString={coreqString}
          setCoreqString={setCoreqString}
        />
      </div>
    </div>
  );
};

export default Maker;

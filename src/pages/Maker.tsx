import { useMemo, useState, useEffect } from "react";
import {
  CourseCardProps,
  CoursesOnGrid,
  CoursesUsed,
  savedLayout,
} from "../types/types";
import { mockCourses } from "../utils/dataImports";
import { CourseGrid } from "../utils/componentImports";
import { UniqueIdentifier } from "@dnd-kit/core";
import { emptyGrid } from "../utils/utilImports";

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

  // Saved layouts
  const [savedLayouts, setSavedLayouts] = useState<savedLayout[]>(() => {
    const saved = localStorage.getItem("savedLayouts");
    if (saved) return JSON.parse(saved);
    return [];
  });
  useEffect(() => {
    localStorage.setItem("savedLayouts", JSON.stringify(savedLayouts));
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
      <div>blank space so you can try scrolling down</div>
      <div>blank space so you can try scrolling down</div>
      <div>blank space so you can try scrolling down</div>
      <div>blank space so you can try scrolling down</div>
      <div>blank space so you can try scrolling down</div>
      <div>blank space so you can try scrolling down</div>
      <div>blank space so you can try scrolling down</div>
      <div>blank space so you can try scrolling down</div>
      <div>blank space so you can try scrolling down</div>
      <div>blank space so you can try scrolling down</div>
      <div>blank space so you can try scrolling down</div>
      <div>blank space so you can try scrolling down</div>
      <div>blank space so you can try scrolling down</div>
      <div>blank space so you can try scrolling down</div>
      <div>blank space so you can try scrolling down</div>
    </div>
  );
};

export default Maker;

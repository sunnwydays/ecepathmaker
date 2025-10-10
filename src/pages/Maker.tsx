import { useState, useEffect } from "react";
import { CourseCardProps } from "../types/types";
import {
  CourseForm,
  CourseGrid,
  LoadLayout,
  SaveLayout,
} from "../utils/componentImports";
import { UniqueIdentifier } from "@dnd-kit/core";
import { auth } from "../firebase/firebase";
import { saveCourses, saveCoursesOnGrid, saveCoursesUsed, saveDependencies, saveLayouts } from "../firebase/firestore";
import { useLayoutContext } from "../components/layout/Layout";

const Maker = () => {
  const {
    savedLayouts,
    setSavedLayouts,
    courses,
    setCourses,
    coursesUsed,
    setCoursesUsed,
    coursesOnGrid,
    setCoursesOnGrid,
    dependencies,
    setDependencies,
  } = useLayoutContext();
  // TODO: CHANGE THE ABOVE, probably don't need most of it because it's prop driling


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

  useEffect(() => {
    localStorage.setItem("courses", JSON.stringify(courses));
    const user = auth.currentUser;
    if (user) saveCourses(user.uid, courses);
  }, [courses]);

  useEffect(() => {
    localStorage.setItem("coursesUsed", JSON.stringify(coursesUsed));
    const user = auth.currentUser;
    if (user) saveCoursesUsed(user.uid, coursesUsed);
  }, [coursesUsed]);

  useEffect(() => {
    localStorage.setItem("coursesOnGrid", JSON.stringify(coursesOnGrid));
    const user = auth.currentUser;
    if (user) saveCoursesOnGrid(user.uid, coursesOnGrid);
  }, [coursesOnGrid]);

  useEffect(() => {
    const obj: [UniqueIdentifier, UniqueIdentifier[]][] = Array.from(
      dependencies.entries()
    ).map(([key, valueSet]) => [key, Array.from(valueSet)]);
    localStorage.setItem("dependencies", JSON.stringify(obj));
    const user = auth.currentUser;
    if (user) saveDependencies(user.uid, dependencies);
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

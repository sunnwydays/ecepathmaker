import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Analytics } from "@vercel/analytics/react";
import { Footer, Navbar } from "../../utils/componentImports";
import { CourseList, CoursesOnGrid, CoursesUsed, LayoutContextType, savedLayout } from "../../types/types";
import { UniqueIdentifier } from "@dnd-kit/core";
import { emptyGrid } from "../../utils/emptyGrid";
import mockCourses from "../../data/mockCourses";
import { COURSE_DATA_VERSION } from "../../data/courseUpdates";
import { applyCourseUpdates, refreshDependencies } from "../../utils/applyCourseUpdates";
import { saveCourses, saveCoursesOnGrid, saveCoursesVersion, saveCoursesUsed, saveCurriculum, saveDependencies, saveShowSixth, saveLayouts } from "../../firebase/firestore";
import { auth } from "../../firebase/firebase";
import Seo from "../seo/Seo";
import { getCurriculum } from "../../requirements/curricula";
import { Curriculum } from "../../requirements/types";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../../lib/site";

const siteJsonLd: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
];

interface LayoutProps {
  children: ReactNode;
}

// Lets a page ask for a wider main area while it is shown
const WidePageContext = createContext<(wide: boolean) => void>(() => {});

// eslint-disable-next-line react-refresh/only-export-components
export function useWidePage() {
  const setWide = useContext(WidePageContext);
  useEffect(() => {
    setWide(true);
    return () => setWide(false);
  }, [setWide]);
}

// eslint-disable-next-line react-refresh/only-export-components
export const LayoutContext = createContext<LayoutContextType | undefined>(
  undefined
);

// Reads stored course data and applies any course list updates it has not
// received yet. With nothing stored (first run) it uses the default list.
function initCourseData() {
  const savedCourses = localStorage.getItem("courses");
  if (!savedCourses) {
    const coursesUsed: CoursesUsed = {};
    Object.keys(mockCourses).forEach((code) => (coursesUsed[code] = ""));
    return {
      courses: mockCourses as CourseList,
      coursesUsed,
      version: COURSE_DATA_VERSION,
      upserted: [] as string[],
    };
  }

  const courses: CourseList = JSON.parse(savedCourses);
  const savedCoursesUsed = localStorage.getItem("coursesUsed");
  let coursesUsed: CoursesUsed;
  if (savedCoursesUsed) {
    coursesUsed = JSON.parse(savedCoursesUsed);
  } else {
    coursesUsed = {};
    Object.keys(courses).forEach((code) => (coursesUsed[code] = ""));
  }
  const version = Number(localStorage.getItem("coursesVersion")) || 0;
  return applyCourseUpdates({ courses, coursesUsed, version });
}

const Layout: FC<LayoutProps> = ({ children }) => {
  
  // courses, coursesUsed and coursesVersion are loaded together so stored
  // data can be brought up to date with the default course list
  const [initial] = useState(initCourseData);

  // courses
  const [courses, setCourses] = useState<CourseList>(initial.courses);
  useEffect(() => {
    localStorage.setItem("courses", JSON.stringify(courses));
    const user = auth.currentUser;
    if (user) saveCourses(user.uid, courses);
  }, [courses]);

  // coursesUsed
  const [coursesUsed, setCoursesUsed] = useState<CoursesUsed>(
    initial.coursesUsed
  );
  useEffect(() => {
    localStorage.setItem("coursesUsed", JSON.stringify(coursesUsed));
    const user = auth.currentUser;
    if (user) saveCoursesUsed(user.uid, coursesUsed);
  }, [coursesUsed]);

  // coursesVersion (which course list updates this user has received)
  const [coursesVersion, setCoursesVersion] = useState<number>(
    initial.version
  );
  useEffect(() => {
    localStorage.setItem("coursesVersion", String(coursesVersion));
    const user = auth.currentUser;
    if (user) saveCoursesVersion(user.uid, coursesVersion);
  }, [coursesVersion]);

  // coursesOnGrid
  const initialCoursesOnGrid = useMemo<CoursesOnGrid>(() => {
    const savedCoursesOnGrid = localStorage.getItem("coursesOnGrid");
    // Grids saved before the sixth column have no .6 keys
    if (savedCoursesOnGrid) return { ...emptyGrid, ...JSON.parse(savedCoursesOnGrid) };
    return emptyGrid;
  }, []);
  const [coursesOnGrid, setCoursesOnGrid] =
    useState<CoursesOnGrid>(initialCoursesOnGrid);
  useEffect(() => {
    localStorage.setItem("coursesOnGrid", JSON.stringify(coursesOnGrid));
    const user = auth.currentUser;
    if (user) saveCoursesOnGrid(user.uid, coursesOnGrid);
  }, [coursesOnGrid]);
  
  // Map of co/prerequisites to their dependencies (note, dependants would have probably be more accurate)
  const initialDependencies = useMemo<
    Map<UniqueIdentifier, Set<UniqueIdentifier>>
  >(() => {
    const saved = localStorage.getItem("dependencies");
    let map = new Map<UniqueIdentifier, Set<UniqueIdentifier>>();
    if (saved) {
      try {
        const parsed: [string, string[]][] = JSON.parse(saved);
        map = new Map(parsed.map(([key, values]) => [key, new Set(values)]));
      } catch {
        map = new Map();
      }
    }
    // courses refreshed by an update may have new prerequisites
    return refreshDependencies(
      initial.upserted,
      initial.courses,
      initial.coursesUsed,
      map
    );
  }, [initial]);
  const [dependencies, setDependencies] =
    useState<Map<UniqueIdentifier, Set<UniqueIdentifier>>>(initialDependencies);
  useEffect(() => {
    const obj: [UniqueIdentifier, UniqueIdentifier[]][] = Array.from(
      dependencies.entries()
    ).map(([key, valueSet]) => [key, Array.from(valueSet)]);
    localStorage.setItem("dependencies", JSON.stringify(obj));
    const user = auth.currentUser;
    if (user) saveDependencies(user.uid, dependencies);
  }, [dependencies]);

  // savedLayouts
  const [savedLayouts, setSavedLayouts] = useState<savedLayout[]>(() => {
    const saved = localStorage.getItem("savedLayouts");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem("savedLayouts", JSON.stringify(savedLayouts));
    const user = auth.currentUser;
    if (user) saveLayouts(user.uid, savedLayouts);
  }, [savedLayouts]);

  // curriculum (an unknown or missing saved id means the default one)
  const [curriculumId, setCurriculumId] = useState<string>(() =>
    getCurriculum(localStorage.getItem("curriculum")).id
  );
  useEffect(() => {
    localStorage.setItem("curriculum", curriculumId);
    const user = auth.currentUser;
    if (user) saveCurriculum(user.uid, curriculumId);
  }, [curriculumId]);

  // showSixth (whether the sixth column is shown even when it is empty)
  const [showSixth, setShowSixth] = useState<boolean>(
    () => localStorage.getItem("showSixth") === "true"
  );
  useEffect(() => {
    localStorage.setItem("showSixth", String(showSixth));
    const user = auth.currentUser;
    if (user) saveShowSixth(user.uid, showSixth);
  }, [showSixth]);

  const [widePage, setWidePage] = useState(false);

  return (
    <LayoutContext.Provider
      value={{
        courses,
        setCourses,
        coursesUsed,
        setCoursesUsed,
        coursesOnGrid,
        setCoursesOnGrid,
        dependencies,
        setDependencies,
        savedLayouts,
        setSavedLayouts,
        curriculumId,
        setCurriculumId,
        showSixth,
        setShowSixth,
        coursesVersion,
        setCoursesVersion,
      }}
    >
      <Seo jsonLd={siteJsonLd} />
      <div className="min-h-screen flex flex-col w-max md:w-full dark:bg-gray-700">
        <div className="h-24" />
        <Navbar />
        <main
          className={`flex-grow md:mx-auto mx-3 my-12 ${
            widePage
              ? "xl:w-[90%] lg:w-[92%] w-wps"
              : "xl:wp lg:w-wpl w-wps"
          }`}
        >
          <WidePageContext.Provider value={setWidePage}>
            {children}
          </WidePageContext.Provider>
          <Analytics />
        </main>
        <Footer />
      </div>
    </LayoutContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useLayoutContext(): LayoutContextType {
  const ctx = useContext(LayoutContext);
  if (!ctx)
    throw new Error("useLayoutContext must be used within LayoutProvider");
  return ctx;
}

// Unlike useLayoutContext, this works outside the provider (e.g. a card
// rendered on its own) and falls back to the default curriculum.
// eslint-disable-next-line react-refresh/only-export-components
export function useCurriculum(): Curriculum {
  const ctx = useContext(LayoutContext);
  return getCurriculum(ctx?.curriculumId);
}

export default Layout;
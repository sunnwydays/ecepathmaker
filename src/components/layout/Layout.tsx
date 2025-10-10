import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { Analytics } from "@vercel/analytics/react";
import { Footer, Navbar } from "../../utils/componentImports";
import { CoursesOnGrid, CoursesUsed, LayoutContextType, savedLayout } from "../../types/types";
import { UniqueIdentifier } from "@dnd-kit/core";
import { emptyGrid } from "../../utils/emptyGrid";
import mockCourses from "../../data/mockCourses";

interface LayoutProps {
  children: ReactNode;
}

// eslint-disable-next-line react-refresh/only-export-components
export const LayoutContext = createContext<LayoutContextType | undefined>(
  undefined
);

const Layout: FC<LayoutProps> = ({ children }) => {
  const [courses, setCourses] = useState(() => {
  const savedCourses = localStorage.getItem("courses");
    if (savedCourses) return JSON.parse(savedCourses);
    return mockCourses;
  });

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

  // coursesOnGrid
  const initialCoursesOnGrid = useMemo<CoursesOnGrid>(() => {
    const savedCoursesOnGrid = localStorage.getItem("coursesOnGrid");
    if (savedCoursesOnGrid) return JSON.parse(savedCoursesOnGrid);
    return emptyGrid;
  }, []);
  const [coursesOnGrid, setCoursesOnGrid] =
    useState<CoursesOnGrid>(initialCoursesOnGrid);
  
  // Map of co/prerequisites to their dependencies
  const initialDependencies = useMemo<
    Map<UniqueIdentifier, Set<UniqueIdentifier>>
  >(() => {
    const saved = localStorage.getItem("dependencies");
    if (!saved) return new Map();

    try {
      const parsed: [string, string[]][] = JSON.parse(saved);
      return new Map(parsed.map(([key, values]) => [key, new Set(values)]));
    } catch {
      return new Map();
    }
  }, []);
  const [dependencies, setDependencies] =
    useState<Map<UniqueIdentifier, Set<UniqueIdentifier>>>(initialDependencies);
  const [savedLayouts, setSavedLayouts] = useState<savedLayout[]>(() => {
    const saved = localStorage.getItem("savedLayouts");
    return saved ? JSON.parse(saved) : [];
  });

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
      }}
    >
      <div className="min-h-screen flex flex-col w-max md:w-full dark:bg-gray-700">
        <div className="h-24" />
        <Navbar />
        <main className="flex-grow md:mx-auto mx-3 xl:wp lg:w-wpl w-wps my-12">
          {children}
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

export default Layout;
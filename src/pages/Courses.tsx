import { useEffect, useMemo, useState } from "react";

import { FilterState } from "../types/types";
import { buildUnlocks } from "../utils/prereqGraph";
import { useCurriculum, useLayoutContext, useWidePage } from "../components/layout/Layout";
import CourseList, { SortKey } from "../components/explorer/CourseList";
import CourseDetail from "../components/explorer/CourseDetail";
import { CurriculumPicker } from "../utils/componentImports";
import Seo from "../components/seo/Seo";
import { SITE_URL } from "../lib/site";

const coursesJsonLd: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Courses",
      item: `${SITE_URL}/courses`,
    },
  ],
};

const Courses = () => {
  useWidePage();

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    streams: [],
    availableF: true,
    availableS: true,
    isCS: false,
    isHSS: false,
    isSciMath: false,
    isArtSci: false,
    isEng: false,
  });
  const [sort, setSort] = useState<SortKey>("group");
  const [hideOnGrid, setHideOnGrid] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const curriculum = useCurriculum();
  const { courses, coursesUsed } = useLayoutContext();

  // Group ids differ between curricula, so a stream filter cannot carry over
  useEffect(() => {
    setFilters((prev) =>
      prev.streams.length ? { ...prev, streams: [] } : prev
    );
  }, [curriculum.id]);

  // The context's dependencies map only covers courses placed on the grid
  const unlocks = useMemo(() => buildUnlocks(courses), [courses]);

  return (
    <div>
      <Seo
        title="Courses"
        path="/courses"
        description="Explore UofT ECE courses: filter by group, term and type, and see each course's prerequisites and what it unlocks"
        jsonLd={coursesJsonLd}
      />
      <h2 className="mb-8 text-2xl font-medium dark:text-gray-50">
        🗂️ Explore courses and their prerequisites (all the courses on Magellan
        and more)!
      </h2>
      <CurriculumPicker />
      <div className="mt-6 grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] grid-cols-1 gap-6 items-start">
        <CourseList
          courses={courses}
          coursesUsed={coursesUsed}
          filters={filters}
          setFilters={setFilters}
          sort={sort}
          setSort={setSort}
          hideOnGrid={hideOnGrid}
          setHideOnGrid={setHideOnGrid}
          selected={selected}
          onSelect={setSelected}
        />
        <div className="lg:sticky lg:top-28">
          {selected && courses[selected] ? (
            <CourseDetail
              code={selected}
              courses={courses}
              coursesUsed={coursesUsed}
              unlocks={unlocks}
              onSelect={setSelected}
            />
          ) : (
            <p className="rounded-md bg-neutral1 dark:bg-gray-600 dark:text-gray-50 p-4 italic">
              Select a course to see its details
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;

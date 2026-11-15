import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { FilterState } from "../types/types";
import { buildUnlocks } from "../utils/prereqGraph";
import { filterCourses } from "../utils/filterCourses";
import { useCurriculum, useLayoutContext, useWidePage } from "../components/layout/Layout";
import CourseList, { SortKey } from "../components/explorer/CourseList";
import CourseDetail from "../components/explorer/CourseDetail";
import PrereqGraph from "../components/explorer/PrereqGraph";
import GroupOverview from "../components/explorer/GroupOverview";
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

  // The selected course lives in the URL (?c=ECE302); each pick adds a
  // history entry so the back button walks back through them
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("c");

  const curriculum = useCurriculum();
  const { courses, coursesUsed, coursesOnGrid } = useLayoutContext();

  const selected = requested && courses[requested] ? requested : null;
  const unknownCode = requested && !selected ? requested : null;
  const setSelected = (code: string) => setSearchParams({ c: code });

  // Group ids differ between curricula, so a stream filter cannot carry over
  useEffect(() => {
    setFilters((prev) =>
      prev.streams.length ? { ...prev, streams: [] } : prev
    );
  }, [curriculum.id]);

  // Courses that pass the filters (and are not hidden for being on the grid)
  const matching = useMemo(
    () =>
      Object.keys(courses).filter(
        (code) =>
          filterCourses(filters, code, courses[code], curriculum) &&
          !(hideOnGrid && coursesUsed[code])
      ),
    [courses, coursesUsed, filters, hideOnGrid, curriculum]
  );

  // The context's dependencies map only covers courses placed on the grid
  const unlocks = useMemo(() => buildUnlocks(courses), [courses]);

  return (
    <div>
      <Seo
        title={selected ? `${selected} ${courses[selected].name}` : "Courses"}
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
          matching={matching}
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
        <div className="flex flex-col gap-4 min-w-0">
          {selected && courses[selected] ? (
            <>
              <CourseDetail
                code={selected}
                courses={courses}
                coursesUsed={coursesUsed}
                coursesOnGrid={coursesOnGrid}
                unlocks={unlocks}
                onSelect={setSelected}
              />
              <PrereqGraph
                code={selected}
                courses={courses}
                unlocks={unlocks}
                coursesUsed={coursesUsed}
                coursesOnGrid={coursesOnGrid}
                onSelect={setSelected}
              />
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="self-start text-sm underline dark:text-gray-50"
              >
                Back to all courses
              </button>
            </>
          ) : (
            <>
              {unknownCode && (
                <p
                  role="status"
                  className="rounded-md bg-comp1 bg-opacity-50 p-3 text-sm dark:text-gray-50"
                >
                  {unknownCode} is not in the course list
                </p>
              )}
              <GroupOverview
                courses={courses}
                codes={matching}
                onSelect={setSelected}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;

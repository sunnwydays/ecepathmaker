import { useState } from "react";
import { CourseCardProps } from "../types/types";
import {
  CourseForm,
  CourseGrid,
  LoadLayout,
  SaveLayout,
} from "../utils/componentImports";

const Maker = () => {

  // Course info for custom course
  const [customInfo, setCustomInfo] = useState<CourseCardProps>({
    code: "",
    name: "",
    preq: [],
    streams: [],
    color: "",
    isCS: false,
    isHSS: false,
    isSciMath: false,
    isArtSci: false,
    onlyF: false,
    onlyS: false,
  });
  const [preqString, setPreqString] = useState("");
  const [coreqString, setCoreqString] = useState("");

  return (
    <div>
      <CourseGrid
        setCustomInfo={setCustomInfo}
        setPreqString={setPreqString}
        setCoreqString={setCoreqString}
      />
      <hr className="mt-8 stroke-2" />
      <div className="grid md:grid-cols-2 grid-cols-1 gap-x-16 dark:text-gray-50">
        <div>
          <h2 className="mt-10 mb-4 text-2xl font-semibold">Load layout</h2>
          <p className=" mb-2 max-w-xl">
            Paste your previously copied string or load from cache
          </p>
          <LoadLayout />
          <h2 className="mt-8 mb-4 text-2xl font-semibold">Save layout</h2>
          <p className="mb-2 max-w-xl">
            Copy this string and save it for later or store layout in cache
          </p>
          <SaveLayout />
        </div>
        <CourseForm
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

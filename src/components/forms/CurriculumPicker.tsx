import { FC } from "react";
import { curricula } from "../../requirements/curricula";
import { useLayoutContext } from "../layout/Layout";
import SixthToggle from "./SixthToggle";

const CurriculumPicker: FC = () => {
  const { curriculumId, setCurriculumId } = useLayoutContext();

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4">
    <label className="mb-4 flex flex-wrap items-center gap-2 dark:text-gray-50">
      <span className="font-medium">Curriculum</span>
      <select
        value={curriculumId}
        onChange={(e) => setCurriculumId(e.target.value)}
        data-testid="curriculum-picker"
        className="
          p-2 border rounded
          dark:bg-gray-500 dark:border-gray-400"
      >
        {curricula.map((curriculum) => (
          <option key={curriculum.id} value={curriculum.id}>
            {curriculum.label}
          </option>
        ))}
      </select>
    </label>
    <SixthToggle />
    </div>
  );
};

export default CurriculumPicker;

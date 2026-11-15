import { FC } from "react";
import { curricula } from "../../requirements/curricula";
import { useLayoutContext } from "../layout/Layout";
import { input } from "../../styles/ui";

const CurriculumPicker: FC = () => {
  const { curriculumId, setCurriculumId } = useLayoutContext();

  return (
    <label className="mb-4 flex flex-wrap items-center gap-2 dark:text-gray-50">
      <span className="font-medium">Curriculum</span>
      <select
        value={curriculumId}
        onChange={(e) => setCurriculumId(e.target.value)}
        data-testid="curriculum-picker"
        className={`${input} py-1.5`}
      >
        {curricula.map((curriculum) => (
          <option key={curriculum.id} value={curriculum.id}>
            {curriculum.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default CurriculumPicker;

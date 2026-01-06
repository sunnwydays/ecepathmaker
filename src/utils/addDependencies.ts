import { addDependenciesProps } from "../types/types"

// for each of the current course's dependencies, add the entry 
export const addDependencies = ({
  code,
  courses,
  dependencies,
  setDependencies,
}: addDependenciesProps) => {
  // new reference so useEffect can track changes for updating localStorage
  const updated = setDependencies ? new Map(dependencies) : dependencies;

  const addToMap = (key: string) => {
    const existing = updated.get(key) ?? new Set();
    existing.add(code);
    updated.set(key, existing);
  };

  const applyDeps = (currPreqs?: (string | string[])[]) => {
    if (!currPreqs) return;

    for (const andPreq of currPreqs) {
      // append to existing array, deal with OR later
      if (Array.isArray(andPreq)) {
        for (const orPreq of andPreq) addToMap(orPreq);
      } else {
        addToMap(andPreq);
      }
    }
  }

  applyDeps(courses[code].preq);
  applyDeps(courses[code].coreq);

  if (setDependencies) setDependencies(updated);
}
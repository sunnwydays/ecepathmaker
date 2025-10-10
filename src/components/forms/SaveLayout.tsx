import { FC, useEffect, useRef, useState } from "react";
import { Announcement } from "../../utils/componentImports";
import TextInput from "./TextInput";
import SubmitButton from "../SubmitButton";
import { useLayoutContext } from "../layout/Layout";

enum Save {
  NONE,
  SUCCESS,
}

const SaveLayout: FC = () => {
  const {
    courses,
    coursesOnGrid,
    setSavedLayouts,
  } = useLayoutContext();

  const [str, setStr] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(str);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const serializeReqs = (label: string, reqs?: (string | string[])[]) => {
    if (!reqs?.length) return "";
    const parts = reqs.map((r) => (Array.isArray(r) ? r.join("|") : r));
    return label + parts.join(",");
  };

  useEffect(() => {
    let newStr = "";
    Object.entries(coursesOnGrid).forEach(([pos, courseCode]) => {
      if (pos !== "3F.1" && pos.includes(".1")) newStr += "@@";
      if (!courseCode) return;
      const course = courses[courseCode];
      newStr += courseCode + course.name + "%%";
      if (course.streams) newStr += course.streams.join("");
      if (course.kernel) newStr += "k";
      if (course.onlyF) newStr += "f";
      else if (course.onlyS) newStr += "s";
      if (course.isHSS) newStr += "h";
      else if (course.isCS) newStr += "c";
      if (course.isSciMath) newStr += "m";
      if (course.isArtSci) newStr += "a";
      if (course.color) newStr += "#" + course.color;

      const hasPreq = course.preq?.length;
      const hasCoreq = course.coreq?.length;
      if (hasPreq) newStr += serializeReqs("p", course.preq);
      if (hasCoreq) newStr += serializeReqs(hasPreq ? "o" : "po", course.coreq);

      if (pos[3] != "5") newStr += "$$";
    });
    setStr(newStr);
  }, [coursesOnGrid, courses]);

  const numLayouts = 4;
  const [name, setName] = useState("");
  const [saveIndex, setSaveIndex] = useState(0);
  const [save, setSave] = useState(Save.NONE);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // maximum 16 characters
    if (e.target.value.length > 16) return;
    setName(e.target.value);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newLayout = {
      name: name.trim() || `Layout ${saveIndex + 1}`,
      str: str,
    };

    setSavedLayouts((prev) => {
      const newLayouts = [...prev];

      // Fill any missing indices with default objects, important for firestore
      for (let i = 0; i <= saveIndex; i++) {
        if (!newLayouts[i]?.name) newLayouts[i] = { name: "", str: "" };
      }

      newLayouts[saveIndex] = newLayout;

      return newLayouts;
    });

    setSave(Save.SUCCESS);
    setName("");
  };

  useEffect(() => {
    if (save !== Save.NONE) {
      timeoutRef.current = setTimeout(() => {
        setSave(Save.NONE);
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [save]);

  return (
    <section className="flex flex-col">
      <p
        className="
                p-2 border-2 border-green3 border-opacity-70 rounded-md 
                bg-green1 bg-opacity-50 
                dark:text-gray-200
                break-all select-all"
      >
        {str}
      </p>
      <button
        onClick={handleCopy}
        className={`
                    bg-green2 text-white px-4 py-2 rounded
                    hover:bg-green3 transition-all
                    dark:bg-green3 dark:hover:bg-green4
                    mt-4
                    ${copied && "opacity-80"}
                `}
      >
        {copied ? "Copied!" : "Copy"}
      </button>

      <form
        onSubmit={handleSave}
        className="flex flex-col gap-4 mt-4"
        data-testid="save-form"
      >
        <div className="flex gap-4">
          <TextInput
            name="layout-name"
            value={name}
            placeholder="Layout name"
            onChange={handleNameChange}
            data-testid="layout-name-input"
            minWidth="52"
          />
          <div className="flex gap-4">
            {Array.from({ length: numLayouts }, (_, i) => (
              <label key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="saveIndex"
                  value={i}
                  checked={saveIndex === i}
                  onChange={() => setSaveIndex(i)}
                  data-testid={`save-slot-${i+1}`}
                />
                <span>{i + 1}</span>
              </label>
            ))}
          </div>
        </div>
          
        <SubmitButton testId="save-layout">
          Save current layout in slot {saveIndex + 1}
        </SubmitButton>
      </form>

      {save === Save.SUCCESS && (<Announcement success>
        Layout saved!
      </Announcement>)}
    </section>
  );
};

export default SaveLayout;

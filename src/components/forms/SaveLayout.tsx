import { FC, useEffect, useRef, useState } from "react";
import { Announcement } from "../../utils/componentImports";
import TextInput from "./TextInput";
import SubmitButton from "../SubmitButton";
import { useLayoutContext } from "../layout/Layout";
import { serializeLayout } from "../../utils/serializeLayout";
import { buttonPrimary } from "../../styles/ui";

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
  const [copyFailed, setCopyFailed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(str);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2000);
    }
  };

  useEffect(() => {
    setStr(serializeLayout(coursesOnGrid, courses));
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
        className={`${buttonPrimary} mt-4 ${copied ? "opacity-80" : ""}`}
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

      {copyFailed && <Announcement>Could not copy. Select the text and copy it yourself</Announcement>}

      {save === Save.SUCCESS && (<Announcement success>
        Layout saved!
      </Announcement>)}
    </section>
  );
};

export default SaveLayout;

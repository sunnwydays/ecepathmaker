import { Search } from "lucide-react";
import { TextInputProps } from "../../types/types";
import { input } from "../../styles/ui";

// Full class strings so Tailwind can see them. Only 36 ever produced CSS;
// 52 and 72 never did, so they stay unset to keep the rendered widths.
const MIN_WIDTH: Record<string, string> = { "36": "min-w-36" };

const TextInput: React.FC<TextInputProps> = ({
  name,
  value,
  placeholder,
  onChange,
  testId,
  minWidth = "72",
  searchIcon = false,
}) => {
  const field = (
    <input
      name={name}
      type="text"
      autoComplete="off"
      value={value}
      placeholder={placeholder}
      className={`w-full ${input} ${searchIcon ? "pl-9" : ""} ${MIN_WIDTH[minWidth] ?? ""}`}
      onChange={onChange}
      {...(testId ? { 'data-testid': testId } : {})}
    />
  );

  if (!searchIcon) return field;

  return (
    <div className="relative">
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
      />
      {field}
    </div>
  );
};

export default TextInput;

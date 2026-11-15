import { TextInputProps } from "../../types/types";

// Full class strings so Tailwind can see them. Only 36 ever produced CSS;
// 52 and 72 never did, so they stay unset to keep the rendered widths.
const MIN_WIDTH: Record<string, string> = { "36": "min-w-36" };

const TextInput: React.FC<TextInputProps> = ({
  name,
  value,
  placeholder,
  onChange,
  testId,
  minWidth = "72"
}) => {
  return (
    <input
      name={name}
      type="text"
      autoComplete="off"
      value={value}
      placeholder={placeholder}
      className={`
        w-full p-2 border rounded ${MIN_WIDTH[minWidth] ?? ""}
        dark:bg-gray-500 dark:border-gray-400 dark:placeholder-gray-300
      `}
      onChange={onChange}
      {...(testId ? { 'data-testid': testId } : {})}
    />
  );
};

export default TextInput;

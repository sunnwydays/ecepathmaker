import { TextInputProps } from "../../types/types";

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
        w-full p-2 border rounded min-w-${minWidth}
        dark:bg-gray-500 dark:border-gray-400 dark:placeholder-gray-300
      `}
      onChange={onChange}
      {...(testId ? { 'data-testid': testId } : {})}
    />
  );
};

export default TextInput;

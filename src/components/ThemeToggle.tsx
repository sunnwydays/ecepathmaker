import { useDarkMode } from "../utils/utilImports";
import { CiLight, CiDark } from "react-icons/ci";


const ThemeToggle = () => {
  const isDarkMode = useDarkMode();

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="px-2 py-2 text-black dark:text-white"
    >
      {isDarkMode ? <CiDark /> : <CiLight />}
    </button>
  );
};

export default ThemeToggle;

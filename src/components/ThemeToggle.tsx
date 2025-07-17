import { useDarkMode } from "../utils/utilImports";
import { CiLight, CiDark } from "react-icons/ci";


const ThemeToggle = () => {
  const isDarkMode = useDarkMode();

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const isNowDark = !html.classList.contains('dark');

    html.classList.toggle('dark');
    localStorage.setItem('theme', isNowDark ? 'dark' : 'light');
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

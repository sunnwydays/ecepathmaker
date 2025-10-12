import { saveTheme } from "../firebase/firestore";
import { auth } from "../firebase/firebase";
import { useDarkMode } from "../utils/utilImports";
import { CiLight, CiDark } from "react-icons/ci";


const ThemeToggle = () => {
  const isDarkMode = useDarkMode();

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const isNowDark = !html.classList.contains('dark');

    html.classList.toggle('dark');
    localStorage.setItem('theme', isNowDark ? 'dark' : 'light');
    const user = auth.currentUser;
    if (user) saveTheme(user.uid, isNowDark ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="px-1 py-2 text-black dark:text-white text-2xl flex items-center"
    >
      {isDarkMode ? <CiDark /> : <CiLight />}
    </button>
  );
};

export default ThemeToggle;

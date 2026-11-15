import { saveTheme } from "../firebase/firestore";
import { auth } from "../firebase/firebase";
import { useDarkMode } from "../utils/utilImports";
import { Moon, Sun } from "lucide-react";
import { iconButton } from "../styles/ui";


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
      aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
      className={iconButton}
    >
      {isDarkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
};

export default ThemeToggle;

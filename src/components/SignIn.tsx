import { FC } from "react";
import { CiLogin, CiLogout } from "react-icons/ci";
import { signInGoogle, signOut } from "../firebase/auth";
import { useAuth } from "../contexts/AuthContext";
import { useLayoutContext } from "./layout/Layout";
import { loadCourses, loadCoursesOnGrid, loadCoursesUsed, loadDependencies, loadLayouts, loadTheme } from "../firebase/firestore";

const SignIn: FC = () => {
  const { signedIn } = useAuth();

  const { 
    setSavedLayouts,
    setCourses,
    setCoursesUsed,
    setCoursesOnGrid,
    setDependencies
  } = useLayoutContext();

  const signIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const result = await signInGoogle();
    const user = result.user;
    
    try {
      // Fetch everything in parallel
      const [
        remoteSavedLayouts,
        remoteCourses,
        remoteCoursesUsed,
        remoteCoursesOnGrid,
        remoteDependencies,
        remoteTheme,
      ] = await Promise.all([
        loadLayouts(user.uid),
        loadCourses(user.uid),
        loadCoursesUsed(user.uid),
        loadCoursesOnGrid(user.uid),
        loadDependencies(user.uid),
        loadTheme(user.uid),
      ]);

      // Apply loaded data only if available
      if (remoteSavedLayouts?.length) setSavedLayouts(remoteSavedLayouts);
      if (Object.keys(remoteCourses ?? {}).length) setCourses(remoteCourses);
      if (Object.keys(remoteCoursesUsed ?? {}).length) setCoursesUsed(remoteCoursesUsed);
      if (Object.keys(remoteCoursesOnGrid ?? {}).length) setCoursesOnGrid(remoteCoursesOnGrid);
      if (remoteDependencies?.size) setDependencies(remoteDependencies);
      if (remoteTheme) {
        if (remoteTheme == 'dark') {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      }

    } catch (err) {
      console.error("Failed to load user data:", err);
    }
  };

  return (
    <div>
      <button
        onClick={signedIn ? signOut : signIn}
        className="px-1 py-2 text-2xl flex items-center"
      >
        {signedIn ? <CiLogout /> : <CiLogin />}
      </button>
    </div>
  );
};

export default SignIn;

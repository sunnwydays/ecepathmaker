import { FC } from "react";
import { CiLogin, CiLogout } from "react-icons/ci";
import { signInGoogle, signOut } from "../firebase/auth";
import { useAuth } from "../contexts/AuthContext";
import { useLayoutContext } from "./layout/Layout";
import { getCurriculum } from "../requirements/curricula";
import { applyCourseUpdates, refreshDependencies } from "../utils/applyCourseUpdates";
import { emptyGrid } from "../utils/emptyGrid";
import { loadCourses, loadCoursesOnGrid, loadCoursesVersion, loadCurriculum, loadShowSixth, loadCoursesUsed, loadDependencies, loadLayouts, loadTheme } from "../firebase/firestore";

const SignIn: FC = () => {
  const { signedIn } = useAuth();

  const { 
    setSavedLayouts,
    setCourses,
    setCoursesUsed,
    setCoursesOnGrid,
    setDependencies,
    setCurriculumId,
    setShowSixth,
    setCoursesVersion,
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
        remoteCurriculum,
        remoteShowSixth,
        remoteCoursesVersion,
      ] = await Promise.all([
        loadLayouts(user.uid),
        loadCourses(user.uid),
        loadCoursesUsed(user.uid),
        loadCoursesOnGrid(user.uid),
        loadDependencies(user.uid),
        loadTheme(user.uid),
        loadCurriculum(user.uid),
        loadShowSixth(user.uid),
        loadCoursesVersion(user.uid),
      ]);

      // Apply loaded data only if available
      if (remoteSavedLayouts?.length) setSavedLayouts(remoteSavedLayouts);
      // Remote courses go through any course list updates they have not received
      let dependencies = remoteDependencies;
      if (Object.keys(remoteCourses ?? {}).length) {
        const updated = applyCourseUpdates({
          courses: remoteCourses,
          coursesUsed: remoteCoursesUsed ?? {},
          version: remoteCoursesVersion || 0,
        });
        setCourses(updated.courses);
        if (Object.keys(remoteCoursesUsed ?? {}).length) setCoursesUsed(updated.coursesUsed);
        setCoursesVersion(updated.version);
        dependencies = refreshDependencies(
          updated.upserted,
          updated.courses,
          updated.coursesUsed,
          remoteDependencies ?? new Map()
        );
      }
      if (Object.keys(remoteCoursesOnGrid ?? {}).length) setCoursesOnGrid({ ...emptyGrid, ...remoteCoursesOnGrid });
      if (dependencies?.size) setDependencies(dependencies);
      if (remoteCurriculum) setCurriculumId(getCurriculum(remoteCurriculum).id);
      if (remoteShowSixth) setShowSixth(true);
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
        aria-label={signedIn ? "Sign out" : "Sign in with Google"}
        className="px-1 py-2 text-2xl flex items-center"
      >
        {signedIn ? <CiLogout /> : <CiLogin />}
      </button>
    </div>
  );
};

export default SignIn;

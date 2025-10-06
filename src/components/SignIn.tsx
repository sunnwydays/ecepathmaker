import { FC } from "react";
import { CiLogin, CiLogout } from "react-icons/ci";
import { signInGoogle, signOut } from "../firebase/auth";
import { useAuth } from "../contexts/AuthContext";
import { useLayoutContext } from "./layout/Layout";
import { loadLayouts } from "../firebase/firestore";

const SignIn: FC = () => {
  const { signedIn } = useAuth();

  const { setSavedLayouts } = useLayoutContext();

  const signIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const result = await signInGoogle();
    const user = result.user;
    try {
      const remoteSavedLayouts = await loadLayouts(user.uid);
      if (remoteSavedLayouts.length > 0) {
        setSavedLayouts(remoteSavedLayouts);
      }
    } catch (err) {
      console.error("Failed to load layouts:", err);
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

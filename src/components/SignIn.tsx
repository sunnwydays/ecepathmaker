import { FC } from 'react';
import { CiLogin, CiLogout } from "react-icons/ci";
import { signInGoogle, signOut } from "../firebase/auth";
import { useAuth } from "../contexts/AuthContext";


const SignIn:FC = () => {
    const { signedIn } = useAuth();
    // const [isSigningIn, setIsSigningIn] = useState(false);

    const signIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            await signInGoogle();
        } catch {
            console.log("Google sign in failed.")
        }
    }

    return (
        <div>
            <button 
                onClick={signedIn ? signOut : signIn}
                className="px-1 py-2 text-2xl flex items-center"
            >
                { signedIn ? <CiLogout/> : <CiLogin/> }
            </button>
        </div>
    )
}

export default SignIn;
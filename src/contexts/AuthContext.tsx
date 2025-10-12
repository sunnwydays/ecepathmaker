import { AuthContextType } from "../types/types";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const AuthContext = createContext<AuthContextType>({
  user: null,
  signedIn: false,
  loading: true,
});

/* eslint-disable react-refresh/only-export-components */
export const useAuth = () => {
    return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const initializeUser = async (newUser: User | null) => {
        if (newUser) {
            setUser(newUser);
        } else {
            setUser(null);
        }

        setLoading(false);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, signedIn: !!user, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
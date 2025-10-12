import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";
import { signOut as firebaseSignOut } from "firebase/auth";

const signInGoogle = async () => {
    const provider = new GoogleAuthProvider;
    const result = await signInWithPopup(auth, provider);
    return result;
}

const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    console.log("Signed out.");
  } catch (err) {
    console.error("Sign out failed: ", err);
  }
};

export { signInGoogle, signOut };
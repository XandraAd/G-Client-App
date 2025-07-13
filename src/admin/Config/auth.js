import { auth } from "./Firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  
} from "firebase/auth";

// create user
export const signUp = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user);
  return userCredential;
};

// Login user
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential?.user) {
      throw new Error("auth/user-not-found");
    }
    return userCredential;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error; // Re-throw the error for handling in the component
  }
};

//google SignIn
export const googleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  return user;
};

// Logout User
export const logout = () => {
  return auth.signOut();
};

//Reset Password
export const resetPassword = async (email) => {
  return auth.sendPasswordResetEmail(email);
};

// ✅ Verify Email
export const verifyEmail = async () => {
  const user = auth.currentUser;
  if (user) {
    return sendEmailVerification(user);
  } else {
    throw new Error("No user is currently signed in.");
  }
};



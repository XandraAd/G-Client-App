import { auth } from "./Firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  // GoogleAuthProvider,
  // signInWithPopup,
  
  sendPasswordResetEmail,
} from "firebase/auth";

// create user
export const signUp = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
 
  return userCredential;
};

// Login user
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    if (!userCredential?.user) {
      throw new Error("auth/user-not-found");
    }
    return userCredential;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error; // Re-throw the error for handling in the component
  }
};


// Logout User
export const logout = () => {
  return auth.signOut();
};

// resetPassword with custom redirect
export const resetPassword = async (email) => {
  const actionCodeSettings = {
    url: `${window.location.origin}/new-password`, // route that handles the password reset form
    handleCodeInApp: true,
  };

  return sendPasswordResetEmail(auth, email, actionCodeSettings);
};

{/**export const verifyEmail = async () => {
  const user = auth.currentUser;
  if (user) {
    const actionCodeSettings = {
      // This should match a route in your app that can handle the verification mode
      url: `${window.location.origin}/auth-action`, // ✅ This route will check ?mode=verifyEmail
      handleCodeInApp: true,
    };

    return sendEmailVerification(user, actionCodeSettings);
  } else {
    throw new Error("No user is currently signed in.");
  } */}




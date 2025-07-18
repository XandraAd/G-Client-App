import { auth } from "./Firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  
  
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

// resetPassword with custom redirect
export const resetPassword = async (email) => {
  const actionCodeSettings = {
    url: `${window.location.origin}/new-password`, // route that handles the password reset form
    handleCodeInApp: true,
  };

  return sendPasswordResetEmail(auth, email, actionCodeSettings);
};

// Verify Email
//export const verifyEmail = async () => {
 // const user = auth.currentUser;
 // if (user) {
  //  return sendEmailVerification(user);
 // } else {
 //   throw new Error("No user is currently signed in.");
 // }
//};


export const verifyEmail = async () => {
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
  }
};


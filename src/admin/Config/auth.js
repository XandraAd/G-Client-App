import { auth, db } from "./Firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// ----------------------
// Regular user signup
// ----------------------
export const signUp = async (email, password, learnerData) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await setDoc(doc(db, "users", userCredential.user.uid), {
    email,
    firstName: learnerData.firstName || "",
    lastName: learnerData.lastName || "",
    contact: learnerData.contact || "",
    isLearner: true,
    createdAt: new Date()
  });

  return userCredential;
};

// ----------------------
// Admin signup
// ----------------------
export const adminSignUp = async (email, password, adminData) => {
  let userCredential;
  try {
    userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(userCredential.user, {
      displayName: `${adminData.firstName} ${adminData.lastName}`
    });

    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      contact: adminData.contact,
      isAdmin: true,
      createdAt: new Date()
    });

    return userCredential;
  } catch (error) {
    console.error("Admin signup error:", error);
    if (userCredential?.user) {
      try {
        await deleteUser(userCredential.user);
      } catch (deleteError) {
        console.error("Error cleaning up user:", deleteError);
      }
    }
    throw error;
  }
};

// ----------------------
// Admin login
// ----------------------
export const adminSignIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists() || !userDoc.data().isAdmin) {
      await auth.signOut();
      throw new Error("User is not an admin");
    }

    return userCredential;
  } catch (error) {
    console.error("Admin sign in error:", error);
    throw error;
  }
};

// ----------------------
// Learner login
// ----------------------
export const learnerSignIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists() || !userDoc.data().role === "learner") {
      await auth.signOut();
      throw new Error("User is not a learner");
    }

    return userCredential;
  } catch (error) {
    console.error("Learner sign in error:", error);
    throw error;
  }
};

// ----------------------
// Logout
// ----------------------
export const logout = () => {
  return auth.signOut();
};

// ----------------------
// Password reset
// ----------------------
export const resetPassword = async (email) => {
  const actionCodeSettings = {
    url: `${window.location.origin}/new-password`,
    handleCodeInApp: true
  };
  return sendPasswordResetEmail(auth, email, actionCodeSettings);
};




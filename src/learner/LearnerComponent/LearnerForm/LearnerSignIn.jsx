import React, { useState, useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth, db } from "../../../admin/Config/Firebase.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { IoIosArrowRoundForward } from "react-icons/io";
import { learnerSignIn } from "../../../admin/Config/auth.js";
import { useCart } from "../../../admin/contexts/CartContext"; // Import cart context

const LearnerSignIn = ({ switchForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const provider = new GoogleAuthProvider();


  // ✅ handle role check on login
  const checkRoleAndRedirect = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        if (role === "learner") {
          // OPTIONAL: Merge guest cart with user cart after successful login
          // await mergeGuestCart();
          
          const redirectTo = location.state?.redirectTo || "/learner/dashboard";
          navigate(redirectTo, { replace: true });
        } else {
          // ❌ Prevent admin or other roles from logging in here
          await signOut(auth);
          setError("Access denied. Learner account required.");
        }
      } else {
        await signOut(auth);
        setError("No account record found. Please sign up first.");
      }
    } catch (error) {
      console.error("Role check error:", error);
      setError("An error occurred during authentication.");
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkRoleAndRedirect(user);
      }
    });
    return () => unsubscribe();
  }, [navigate, location]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Clear guest cart before sign in to start fresh
      localStorage.removeItem("guestCart");
      
      const { user } = await learnerSignIn(email, password);
      await checkRoleAndRedirect(user);
    } catch (error) {
      console.error("Sign In Error:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    
    try {
      // Clear guest cart before sign in to start fresh
      localStorage.removeItem("guestCart");
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Extract profile info from Google
      const displayName = user.displayName || "";
      const [firstName = "", lastName = ""] = displayName.split(" ");

      // Check if user already exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new learner in Firestore
        await setDoc(userRef, {
          uid: user.uid,
          firstName,
          lastName,
          email: user.email,
          role: "learner",
          emailVerified: user.emailVerified,
          createdAt: new Date(),
        });
      }
      
      // Now check role and redirect
      await checkRoleAndRedirect(user);
    } catch (error) {
      console.error("Google Sign In Error:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/learner/reset", { replace: true });
  };

  return (
    <main className="flex flex-col items-center justify-center px-4 py-12 grow ">
      <div className="max-w-md w-full space-y-6">
        <h2 className="text-center text-2xl font-bold">
          Log in to continue your learning journey
        </h2>

        {error && (
          <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex items-center justify-center w-full border border-gray-300 rounded py-2 hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <FcGoogle className="text-2xl mr-2" />
          Log in using Google
        </button>

        <div className="flex items-center justify-center space-x-2 text-gray-400">
          <hr className="w-1/4 border-gray-300" />
          <span>or</span>
          <hr className="w-1/4 border-gray-300" />
        </div>

        <form className="space-y-4" onSubmit={handleSignIn}>
          <div>
            <label htmlFor="email" className="block text-sm mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm mb-1">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
              placeholder="••••••••"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 bottom-2.5 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showPassword ? (
                <AiFillEyeInvisible size={20} />
              ) : (
                <AiFillEye size={20} />
              )}
            </button>
          </div>

          <div className="text-right text-sm">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-blue-600 hover:underline"
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#01589A] text-white rounded-md py-2 flex items-center justify-center gap-2 hover:bg-blue-700 transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              "Logging in..."
            ) : (
              <>
                <IoIosArrowRoundForward />
                Login
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm">
          Need to create an account?{" "}
          <button
            onClick={switchForm}
            type="button"
            className="text-blue-600 hover:underline"
            disabled={loading}
          >
            Sign up
          </button>
        </div>
      </div>
    </main>
  );
};

export default LearnerSignIn;
import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth, db } from "../../../admin/Config/Firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { IoIosArrowRoundForward } from "react-icons/io";

const LearnerSignIn = ({ switchForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ redirect once Firebase updates the learner
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "learner") {
          const redirectTo = location.state?.redirectTo || "/";
          navigate(redirectTo, { replace: true });
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, location]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // ❌ don’t navigate here – the effect will handle it
    } catch (error) {
      console.error("Sign In Error:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // ❌ same here, let the effect redirect
    } catch (error) {
      console.error("Google Sign In Error:", error.message);
      setError(error.message);
    }
  };

  const handleForgotPassword = () => {
    navigate("/learner/reset", { replace: true });
  };

  return (
    <main className="flex flex-col items-center justify-center px-4 py-12 grow border">
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
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full border border-gray-300 rounded py-2 hover:bg-gray-50"
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
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 bottom-2.5 text-gray-400 hover:text-gray-600"
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
            <IoIosArrowRoundForward />
            Login
          </button>
        </form>

        <div className="text-center text-sm">
          Need to create an account?{" "}
          <button
            onClick={switchForm}
            type="button"
            className="text-blue-600 hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </main>
  );
};

export default LearnerSignIn;

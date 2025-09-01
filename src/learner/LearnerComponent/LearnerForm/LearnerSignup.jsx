import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup, // Fixed import
  GoogleAuthProvider,
  updateProfile,
  deleteUser
} from "firebase/auth";
import { auth, db } from "../../../admin/Config/Firebase.js";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import axios from "axios";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { doc, setDoc, getDoc } from "firebase/firestore";

const LearnerSignUp = ({ switchForm }) => {
  const [registerUser, setRegisterUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // Added separate loading for Google
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const navigate = useNavigate();
  const location = useLocation(); // Added location hook
  const provider = new GoogleAuthProvider();

  const { firstName, lastName, email, password, passwordConfirmation } = registerUser;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== passwordConfirmation) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    let userCredential = null;
    try {
      // 1. Create user in Firebase Auth
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      // 3. Save user role in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email,
        role: "learner", 
        emailVerified: false, // Fixed: changed from string to boolean
        createdAt: new Date(),
      });

      // 4. Send OTP to email
      const otpResponse = await axios.post(
        "/api/auth/send-otp",
        { email }
      );

      if (otpResponse.data.success) {
        setMessage("Verification OTP sent to your email");
        setShouldRedirect(true);
      }
    } catch (error) {
      console.error("Sign Up Error:", error.message);
      setError(error.message);

      // Rollback user creation if verification fails
      if (userCredential?.user) {
        try {
          await deleteUser(userCredential.user);
        } catch (deleteError) {
          console.error("Error deleting user:", deleteError.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setGoogleLoading(true);
    
    try {
      const result = await signInWithPopup(auth, provider); // Fixed function name
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

      // Navigate to dashboard
      const redirectPath = location.state?.from || "/learner/dashboard";
      navigate(redirectPath, { replace: true });

    } catch (error) {
      console.error("Google Signup Error:", error.message);
      setError(error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (shouldRedirect) {
      const returnPath = location.state?.from || "/learner/dashboard";
      navigate("/learner/verify", { 
        state: { 
          email,
          firstName,
          lastName,
          returnPath
        } 
      });
    }
  }, [shouldRedirect, navigate, email, firstName, lastName, location.state]);

  return (
    <main className="flex flex-col items-center justify-center px-4 py-12 grow">
      <div className="max-w-md w-full space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center">
          Sign up to get started
        </h2>

        {message && (
          <div className="p-3 bg-green-50 text-green-700 rounded text-sm md:text-base">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded text-sm md:text-base">
            {error}
          </div>
        )}

        {/* Google Signup */}
        <button
          onClick={handleGoogleSignup}
          type="button"
          disabled={googleLoading || loading}
          className={`
            flex items-center justify-center gap-2 
            w-full border border-gray-300 rounded-md 
            py-2 md:py-3 hover:bg-gray-50
            ${googleLoading || loading ? "opacity-70 cursor-not-allowed" : ""}
          `}
        >
          {googleLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-gray-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-gray-700 text-sm md:text-base font-medium">
                Signing up with Google...
              </span>
            </>
          ) : (
            <>
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="w-5 h-5 md:w-6 md:h-6"
              />
              <span className="text-gray-700 text-sm md:text-base font-medium">
                Sign up with Google
              </span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-sm text-gray-400">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* First Name */}
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="firstName"
              placeholder="First name"
              value={firstName}
              onChange={handleChange}
              required
              disabled={loading || googleLoading}
              className="
                w-full pl-10 pr-3 py-2 md:py-3 
                border border-gray-300 rounded-md text-sm md:text-base 
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-70
              "
            />
          </div>

          {/* Last Name */}
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="lastName"
              placeholder="Last name"
              value={lastName}
              onChange={handleChange}
              required
              disabled={loading || googleLoading}
              className="
                w-full pl-10 pr-3 py-2 md:py-3 
                border border-gray-300 rounded-md text-sm md:text-base 
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-70
              "
            />
          </div>

          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={handleChange}
              required
              disabled={loading || googleLoading}
              className="
                w-full pl-10 pr-3 py-2 md:py-3 
                border border-gray-300 rounded-md text-sm md:text-base 
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-70
              "
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={password}
              onChange={handleChange}
              required
              minLength="6"
              disabled={loading || googleLoading}
              className="
                w-full pl-10 pr-10 py-2 md:py-3 
                border border-gray-300 rounded-md text-sm md:text-base 
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-70
              "
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading || googleLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-70"
            >
              {showPassword ? <AiFillEyeInvisible size={18} /> : <AiFillEye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPasswordConfirm ? "text" : "password"}
              name="passwordConfirmation"
              placeholder="Confirm password"
              value={passwordConfirmation}
              onChange={handleChange}
              required
              disabled={loading || googleLoading}
              className="
                w-full pl-10 pr-10 py-2 md:py-3 
                border border-gray-300 rounded-md text-sm md:text-base 
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-70
              "
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              disabled={loading || googleLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-70"
            >
              {showPasswordConfirm ? <AiFillEyeInvisible size={18} /> : <AiFillEye size={18} />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className={`
              w-full bg-[#01589A] text-white rounded-md 
              py-2 md:py-3 text-sm md:text-base font-medium
              flex items-center justify-center gap-2 
              hover:bg-blue-700 transition
              ${loading || googleLoading ? "opacity-70 cursor-not-allowed" : ""}
            `}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="text-sm md:text-base text-center text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={switchForm}
            disabled={loading || googleLoading}
            className="text-blue-600 hover:underline font-medium disabled:opacity-70"
          >
            Log in
          </button>
        </p>
      </div>
    </main>
  );
};

export default LearnerSignUp;
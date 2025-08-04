import React, { useState,useEffect } from "react";
import axios from "axios";
import Logo from "../../../assets/icons/logo.png";
import {useNavigate} from "react-router-dom"

import { db } from "../../Config/Firebase";
import { deleteUser ,updateProfile} from "firebase/auth";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { signUp } from "../../Config/auth";

const SignUp = ({ switchForm}) => {
  const [registerUser, setRegisterUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    phoneNumber: " ",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const navigate=useNavigate()

  

  const { firstName, lastName, email, password, passwordConfirmation } =
    registerUser;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterUser((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (registerUser.password !== registerUser.passwordConfirmation) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setMessage("Signing up... please verify email after signup");
    let userCredential = null;

    try {
      // 1. Create user in Firebase Auth
      userCredential = await signUp(registerUser.email, registerUser.password);
      const user = userCredential.user;

      // 2. Update display name
      await updateProfile(user, {
        displayName: `${registerUser.firstName} ${registerUser.lastName}`,
      });

      // 3. Send OTP
      const otpResponse = await axios.post(
        "http://localhost:5000/api/auth/send-otp",
        { email: registerUser.email }
      );

      if (otpResponse.data.success) {
        // 4. Store user data in Firestore
        await addDoc(collection(db, "users"), {
          email: registerUser.email,
          createdAt: serverTimestamp(),
          emailVerified: false,
        });

        localStorage.setItem("otpEmail", registerUser.email); // fallback
        setMessage("Signup successful! A verification email has been sent.");
        setShouldRedirect(true); // trigger navigation in useEffect
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message);

      if (userCredential?.user) {
        await deleteUser(userCredential.user); // rollback
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Navigate after OTP success
  useEffect(() => {
    if (shouldRedirect) {
      navigate("/verify-otp", { state: { email: registerUser.email } });
    }
  }, [shouldRedirect, navigate, registerUser.email]);

  
  
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={Logo}
              className="w-[106.67px] h-[30px] object-contain"
              alt="Company Logo"
            />
            <h2 className="text-2xl font-bold mt-4 text-gray-800">
              Admin Sign Up
            </h2>
            <p className="text-center text-gray-600 mt-2">
              Create Your Account to Manage and Access the Dashboard
              Effortlessly.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {message && (
              <p className="text-green-600 text-sm mb-4">{message}</p>
            )}

            <div>
              <label
                htmlFor="firstName"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                First name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Last name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label
                htmlFor="passwordConfirmation"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="passwordConfirmation"
                name="passwordConfirmation"
                value={passwordConfirmation}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          {error && <div className="error-message text-red-600">{error}</div>}

          {/* Submit Button */}
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 px-4 py-2 text-white font-medium rounded-md
               bg-[#01589A] hover:bg-blue-600 transition duration-200 shadow-sm"
          `}
          >
         {loading ? "Creating..." : " Sign Up"}
          </button>

          {/* Login Link */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={switchForm}
              className="text-[#01589A] hover:underline font-medium"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;

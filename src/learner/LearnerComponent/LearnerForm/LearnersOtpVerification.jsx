import React, { useState, useEffect } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import axios from "axios";
import bgImage from "../../../../public/assets/icons/computer.png";
import LearnersNavBar from "../LearnersNavBar";
import Footer from "../../LearnerPages/Footer";

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || localStorage.getItem("otpEmail");

  // ✅ This protects against empty email being passed
  useEffect(() => {
    if (email) {
      localStorage.setItem("otpEmail", email);
    } else {
      setMessage("Session expired. Please sign up again.");
      navigate("/signup");
    }
  }, [email, navigate]);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        {
          email,
          otp,
        }
      );

      if (response.data.success) {
        console.log("Email verified!");
        setMessage("Email verified successfully!");
        localStorage.removeItem("otpEmail"); // ✅ Clean up
        navigate("/learner/dashboard");
      } else {
        setError("Incorrect or expired OTP");
      }
    } catch (err) {
      console.error("Verification error:", err); // Log full error
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  const handleResend = () => {
    setResendMessage("A new OTP has been sent.");
    setTimeout(() => setResendMessage(""), 4000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <LearnersNavBar />

      <div className="flex flex-grow">
        {/* Left: Image side */}
        <div className="hidden md:flex w-2/5 items-center justify-cente ml-28">
          <img
            src={bgImage}
            alt="Computer Illustration"
            className="max-w-[80%] max-h-[80%] object-contain"
          />
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-3/5 flex items-center justify-center px-6 py-12 bg-white">
          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
              Forgot password
            </h2>
            <p className="text-sm text-center text-gray-600 mb-6">
              Enter your email to reset your password
            </p>

            {message && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded text-sm">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <form
              onSubmit={handleVerify}
             
            >
              
              <h2 className="text-xl font-semibold text-gray-800 mb-2 flex justify-center">
                OTP Verification
              </h2>
              <p className="text-gray-600 mb-4">
                Verify your accounts using the 6 digit sent to:
                <br />
                <span className="font-semibold">{email}</span>
              </p>

              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="123456"
                required
              />

              <button
                type="submit"
                className="w-full bg-[#01589A] text-white py-2 rounded hover:bg-blue-600 transition duration-200"
              >
                Verify
              </button>

              <div className="text-sm text-center mt-4 text-gray-600">
                Didn’t receive the OTP?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-[#01589A] hover:underline font-medium"
                >
                  Resend OTP
                </button>
                {resendMessage && (
                  <div className="text-green-600 mt-2">{resendMessage}</div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OTPVerification;

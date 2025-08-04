import React, { useState, useEffect } from "react";
import Logo from "../../../assets/icons/logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import LoginBackground from "../../../assets/icons/loginBackground.png";
import axios from "axios";

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
        navigate("/dashboard");
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
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: `url(${LoginBackground})` }}
    >
      {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <form
        onSubmit={
          handleVerify
        }
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <img
          src={Logo}
          className="w-[106.67px] h-[30px] object-contain mx-auto"
          alt="Company Logo"
        />
        <h2 className="text-xl font-semibold text-gray-800 mb-2 flex justify-center">
          OTP Verification
        </h2>
        <p className="text-gray-600 mb-4">
          Enter the verification code we sent to your
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
          maxLength={5}
          className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          placeholder="12345"
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
  );
};

export default OTPVerification;

import React, { useState } from "react";
import Logo from "../../../assets/icons/logo.png";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add Firebase or API call here to send reset link
    alert(`Password reset link sent to ${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="Company Logo" className="h-8 object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">Admin Reset Password</h2>
        <p className="text-sm text-center text-gray-600 mb-6">
          Enter your email to reset your password
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#01589A] text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            Reset Password
          </button>
        </form>

        {/* Back link */}
        <div className="mt-6 text-sm text-center text-gray-600">
          Back to homepage?{" "}
          <button
            onClick={() => navigate("/home")}
            className="text-[#01589A] hover:underline font-medium"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

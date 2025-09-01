import React, { useState } from "react";
import Logo from "../../../../public/assets/icons/logo.png";
import { useNavigate } from "react-router-dom";
import LoginBackground from "../../../../public/assets/icons/loginBackground.png";
import { resetPassword } from "../../Config/auth";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }
    try {
      await resetPassword(email);
      setMessage(`Password reset link sent to ${email}`);
      setError("");
    } catch (err) {
      setError("Failed to send reset email");
      console.error(err);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: `url(${LoginBackground})` }}
    >
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="Company Logo" className="h-8 object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">
          Admin Reset Password
        </h2>
        <p className="text-sm text-center text-gray-600 mb-6">
          Enter your email to reset your password
        </p>
        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

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
            onClick={() => navigate("/signin")}
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

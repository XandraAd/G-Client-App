import React, { useState } from "react";
import bgImage from "../../../../public/assets/icons/computer.png";
import LearnersNavBar from "../LearnersNavBar";
import Footer from "../../LearnerPages/Footer";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../../admin/Config/auth";
import { FaEnvelope } from "react-icons/fa6";
import { IoIosArrowRoundForward } from "react-icons/io";

const LearnerResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }
    
    setIsLoading(true);
    try {
      await resetPassword(email);
      setMessage(`Password reset link sent to ${email}`);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to send reset email");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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

            <form onSubmit={handleSubmit}>
              <div className="mb-4 relative">
                <label
                  htmlFor="email"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-[#01589A] text-white py-2 rounded-md hover:bg-blue-600 transition flex justify-center items-center ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
               <IoIosArrowRoundForward />
            </form>

            <div className="mt-6 text-sm text-center text-gray-600">
              Back to homepage?{" "}
              <button
                onClick={() => navigate("/learner/signin")}
                className="text-[#01589A] hover:underline font-medium focus:outline-none"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LearnerResetPassword;
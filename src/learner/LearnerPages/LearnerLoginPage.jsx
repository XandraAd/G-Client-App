import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import LearnersNavBar from "../LearnerComponent/LearnersNavBar";
import LearnerSignIn from "../LearnerComponent/LearnerForm/LearnerSignIn";
import LearnerSignUp from "../LearnerComponent/LearnerForm/LearnerSignup";
import Footer from "./Footer";
import bgImage from "../../../public/assets/icons/computer.png";

const LearnerLoginPage = () => {
  const location = useLocation();
  const [isSignIn, setIsSignIn] = useState(true);

    // catch redirect message from CartPage
  const message = location.state?.message;

  // Update form based on route
  useEffect(() => {
    setIsSignIn(location.pathname.includes("signin"));
  }, [location]);

  const switchForm = () => setIsSignIn(!isSignIn);

  return (
    <div className="flex flex-col min-h-screen">
      <LearnersNavBar />

      <div className="flex flex-grow">
        {/* Image side */}
        <div className="hidden md:flex w-2/5 items-center justify-center ">
          <img src={bgImage} alt="Computer Illustration" className="max-w-[80%] max-h-[80%] object-contain" />
        </div>

        {/* Form side */}
        <div className="w-full md:w-3/5 flex items-center justify-center px-6 py-12 bg-white">
          {/* Show redirect message if any */}
          {message && (
            <p className="mb-4 text-red-500 font-medium text-sm">{message}</p>
          )}
          {isSignIn ? (
            <LearnerSignIn switchForm={switchForm} />
          ) : (
            <LearnerSignUp switchForm={switchForm} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LearnerLoginPage;
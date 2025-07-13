import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginBackground from "../../assets/icons/loginBackground.png";
import OverlayImage from "../../assets/icons/Rectangle 69.png";
import SignIn from "../Components/forms/SignIn";
import SignUp from "../Components/forms/SignUp";

const Home = ({email}) => {
  const location = useLocation();
  const navigate = useNavigate();
const isSignIn = location.pathname === "/signin";

    // Handle successful authentication
  const handleAuthSuccess = () => {
    navigate("/verify-otp", { state: { email } });
  };

  // Toggle between sign in and sign up forms
  const toggleForm = () => {
    navigate(isSignIn ? "/signup" : "/signin", { replace: true });// Use replace to prevent history buildup
  };

  
  // Handle forgot password navigation
  const handleForgotPassword = () => {
    navigate("/reset");
  };

 

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: `url(${LoginBackground})` }}
    >
      <img
        src={OverlayImage}
        alt="Overlay"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-30 z-0"
      />

      <div className="z-10 relative flex justify-center">
        {isSignIn ? (
          <SignIn
            switchForm={toggleForm}
            onSuccess={handleAuthSuccess}
            onForgotPassword={handleForgotPassword}
          />
        ) : (
          <SignUp switchForm={toggleForm} onSuccess={handleAuthSuccess} />
        )}
      </div>
    </div>
  );
};

export default Home;

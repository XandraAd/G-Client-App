import React,{useState,useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginBackground from "../../assets/icons/loginBackground.png";
import OverlayImage from "../../assets/icons/Rectangle 69.png";
import SignIn from "../Components/forms/SignIn";
import SignUp from "../Components/forms/SignUp";
import OTPVerification from "../Components/forms/OTpVerification"
import ResetPassword from "../Components/forms/ResetPassword";


const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentPath, setCurrentPath] = useState(location.pathname);

  // Update currentPath when route changes
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  const handleAuthSuccess = (email) => {
    navigate("/verify-otp", { state: { email } });
  };

  const toggleForm = () => {
    navigate(currentPath === "/signin" ? "/signup" : "/signin", { replace: true });
  };

  const handleForgotPassword = () => {
    navigate("/reset", { replace: true });
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
        {currentPath === "/reset" ? (
          <ResetPassword />
        ) : currentPath === "/signin" ? (
          <SignIn
            switchForm={toggleForm}
            onSuccess={handleAuthSuccess}
            onForgotPassword={handleForgotPassword}
          />
        ) : currentPath === "/verify-otp" ? (
          <OTPVerification />
        ) : (
          <SignUp switchForm={toggleForm} onSuccess={handleAuthSuccess} />
        )}
      </div>
    </div>
  );
};


export default Home;

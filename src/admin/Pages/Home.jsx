import React,{useState,useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginBackground from "../../../public/assets/icons/loginBackground.png";
import OverlayImage from "../../../public/assets/icons/Rectangle 69.png";
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
    navigate("/verify-otp", 
      { state: { email },
      replace:true });
      
  };

  const toggleForm = () => {
    navigate(currentPath === "/signin" ? "/signup" : "/signin", { replace: true });
  };

  const handleForgotPassword = () => {
    navigate("/reset", { replace: true });
  };

  let formComponent;
  if (currentPath === "/reset") {
    formComponent = <ResetPassword />;
  } else if (currentPath === "/signin") {
    formComponent = (
      <SignIn
        switchForm={toggleForm}
      
        onForgotPassword={handleForgotPassword}
      />
    );
  } else if (currentPath === "/verify-otp") {
    formComponent = <OTPVerification />;
  } else {
    formComponent = <SignUp switchForm={toggleForm} onSuccess={handleAuthSuccess} />;
  }

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
        {formComponent}
      </div>
    </div>
  );
};


export default Home;

import { useState,useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { applyActionCode, getAuth } from "firebase/auth";

const FirebaseActionHandler = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying...");
  const oobCode = params.get("oobCode");
  const auth=getAuth();
  
  const mode = params.get("mode");

 
  useEffect(() => {
    if (!mode || !oobCode) {
      navigate("/signin");
      return;
    }

    if (mode === "resetPassword") {
      navigate(`/new-password?oobCode=${oobCode}`);
    } else if (mode === "verifyEmail") {
      applyActionCode(auth, oobCode)
        .then(() => {
          setMessage("Email verified successfully!");
          navigate("/signin");
        })
        .catch(() => {
          setMessage("Invalid or expired link.");
          navigate("/signin");
        });
    } else {
      navigate("/signin");
    }
  }, [mode, oobCode, navigate,auth]);

  return <p className="text-center">{message}</p>;
};

export default FirebaseActionHandler;

import React, { useState ,useEffect} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset,verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../../Config/Firebase";
import Logo from "../../../assets/icons/logo.png";
import LoginBackground from "../../../assets/icons/loginBackground.png";

const NewPassword = () => {
   const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [validCode, setValidCode] = useState(false);
  const oobCode = params.get("oobCode");

  useEffect(() => {
    if (!oobCode) {
      setError("Invalid or missing reset code.");
      return;
    }
     // Check if the code is valid
    verifyPasswordResetCode(auth, oobCode)
      .then(() => setValidCode(true))
      .catch(() => setError("Invalid or expired password reset link."));
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
     try {
      await confirmPasswordReset(auth, oobCode, password);
      setMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/signin"), 3000);
    } catch (err) {
      console.error("Reset error", err);
      setError("Failed to reset password.");
    }
  };

 
 

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: `url(${LoginBackground})` }}
    >
      
     <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
  {error && (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-sm text-center">
      <img src={Logo} alt="Logo" className="w-24 mx-auto mb-4" />
      <p className="text-red-600">{error}</p>
      <button
        onClick={() => navigate("/signin")}
        className="text-blue-600 underline mt-4"
      >
        Back to Login
      </button>
    </div>
  )}

  {!error && !validCode && (
    <div className="text-white text-lg">Verifying reset link...</div>
  )}

  {validCode && (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow-md w-full "
    >
      <img
        src={Logo}
        alt="Company Logo"
        className="w-[106.67px] h-[30px] object-contain mx-auto my-2"
      />
      <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
      <p className="text-center text-slate-600 mb-4">
        Create your new password
      </p>

      {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="mb-3">
        <label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-1">
          New Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="passwordConfirmation" className="text-sm font-medium text-gray-700 block mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          id="passwordConfirmation"
          name="passwordConfirmation"
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#01589A] text-white py-2 my-4 rounded hover:bg-blue-700 transition"
      >
        Reset Password
      </button>

      <div className="mt-4 text-center text-sm text-gray-600">
        Go back to{" "}
        <button
          type="button"
          onClick={() => navigate("/signin")}
          className="text-[#01589A] hover:underline font-medium"
        >
          Login
        </button>
      </div>
    </form>
  )}
</div>

        
      </div>
  
  );
};

export default NewPassword;



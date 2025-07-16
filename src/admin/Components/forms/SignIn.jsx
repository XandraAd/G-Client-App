import Logo from "../../../assets/icons/logo.png";
import { useState} from "react";
import { signIn, googleSignIn } from "../../Config/auth";
import { useNavigate } from "react-router-dom";


const SignIn = ({ switchForm, onSuccess, onForgotPassword }) => {
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });
   const [error, setError] = useState("");
   const [setNeedsVerification] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLogin((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!login.email || !login.password) {
      return alert("Please enter your email and password.");
    }

    try {
      // Call Firebase sign-in
      const userCredential = await signIn(login.email, login.password);
      const user = userCredential.user; //Get user data from the response

      if(!user.emailVerified) {
          setNeedsVerification(true);
           navigate("/verify-otp", { state: { email: user.email } });
        
        
        return;
      }

      // Callback on success
      onSuccess(user.email);
    } catch (error) {
      console.error("Login error:", error.code,error.message);
      setError("Failed to login: " + error.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <img
          src={Logo}
          className="w-[106.67px] h-[30px] object-contain mx-auto my-2   bg-white"
          alt="Company Logo"
        />
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
        <p className="text-center text-slate-600">
          {" "}
          Login to Manage and Access the Dashboard Effortlessly.
        </p>

        <div>
          <label
            htmlFor="email"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
          name="password"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {/* Forgot Password */}
        <div className="text-left text-xs mb-4">
          <button
            onClick={onForgotPassword}
            className="text-[#01589A] hover:underline"
          >
            Forgot Password?
          </button>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-[#01589A] text-white py-2 my-4 rounded hover:bg-blue-700 transition duration-200"
        >
          Sign In
        </button>
        <div className="mt-4 text-center text-sm text-gray-600">
          {" "}
          Don't have an Account? {""}
          <button
            type="button"
            onClick={switchForm}
            className="font-medium text-[#01589A]"
          >
            {" "}
            Sign up
          </button>
        </div>

        <button
          type="button"
          onClick={googleSignIn}
          className="w-full bg-red-500 text-white py-2 mt-4 rounded hover:bg-red-600 transition duration-200"
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
};

export default SignIn;

import Logo from "../../../assets/icons/logo.png";
import { useState } from "react";
import { adminSignIn } from "../../Config/auth"; // wraps Firebase signInWithEmailAndPassword
import { useNavigate } from "react-router-dom";
import { auth } from "../../Config/Firebase";

const SignIn = ({ switchForm, onForgotPassword }) => {
  const [login, setLogin] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLogin((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!login.email || !login.password) {
      setError("Please enter your email and password.");
      setLoading(false);
      return;
    }

    try {
      // 1. Firebase sign in
      const userCredential = await adminSignIn(login.email, login.password);
      const user = userCredential.user;

      // 2. Get Firebase ID token
      const idToken = await user.getIdToken();

      // 3. Call backend to check role
      const response = await fetch("http://localhost:5000/api/admin/check-role", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isAdmin) {
          navigate("/admin");
        } else {
          await auth.signOut();
          setError("Access denied. Admin privileges required.");
        }
      } else {
        await auth.signOut();
        setError("Unable to verify role. Try again.");
      }
    } catch (error) {
      console.error("Login error:", error.message);
      setError(error.message || "Failed to login.");
    } finally {
      setLoading(false);
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
          className="w-[106.67px] h-[30px] object-contain mx-auto my-2"
          alt="Company Logo"
        />
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
        <p className="text-center text-slate-600">
          Login to Manage and Access the Dashboard Effortlessly.
        </p>

        <div>
          <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={login.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={login.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Forgot Password */}
        <div className="text-left text-xs mb-4">
          <button 
            type="button"
            onClick={onForgotPassword} 
            className="text-[#01589A] hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#01589A] text-white py-2 my-4 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an Account?{" "}
          <button
            type="button"
            onClick={switchForm}
            className="font-medium text-[#01589A]"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
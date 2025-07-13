import React, { useState } from 'react';
import Logo from "../../../assets/icons/logo.png";
import { useNavigate } from 'react-router-dom'; 
import { auth,db} from '../../Config/Firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection,addDoc, serverTimestamp} from 'firebase/firestore';
import { signUp } from '../../Config/auth';


const SignUp = ({switchForm}) => {
  const [registerUser, setRegisterUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });

    const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { firstName, lastName, email, password, passwordConfirmation } = registerUser;


  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterUser((prev) => ({ ...prev, [name]: value }));
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (registerUser.password !== registerUser.passwordConfirmation) {
      return setError("Passwords do not match");
    }

    try {
        setLoading(true)

        await signUp(registerUser.email,registerUser.password)
        //Send email verification
        alert("Registration successfull,please verify your email")
        switchForm();
    }catch(err){
      setError(err.message);
    }finally{
        setLoading(true);
    }
      try {     // Create user with email and password
   await createUserWithEmailAndPassword(auth, registerUser.email, registerUser.password);


         // If you want to store additional user data
       await addDoc(collection(db, "users"), {
        firstName: registerUser.firstName,
         lastName: registerUser.lastName,
         email: registerUser.email,
        createdAt: serverTimestamp()
       });

      navigate("/"); // Redirect after successful signup
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }}

      
      
 
  

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-6">
            <img 
              src={Logo} 
              className="w-[106.67px] h-[30px] object-contain" 
              alt="Company Logo" 
            />
            <h2 className="text-2xl font-bold mt-4 text-gray-800">Admin Sign Up</h2>
            <p className="text-center text-gray-600 mt-2">
              Create Your Account to Manage and Access the Dashboard Effortlessly.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
           
              <div>
                <label htmlFor="firstName" className="block mb-1 text-sm font-medium text-gray-700">
                  First name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block mb-1 text-sm font-medium text-gray-700">
                  Last name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            

            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
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
                value={password}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label htmlFor="passwordConfirmation" className="block mb-1 text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="passwordConfirmation"
                name="passwordConfirmation"
                value={passwordConfirmation}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
           {error && <div className="error-message text-red-600">{error}</div>}

          {/* Submit Button */}
          <button
          type="submit" 
        disabled={loading}
        className={`submit-btn w-full mt-6 px-4 py-2 text-white font-medium rounded-md bg-[#01589A] hover:bg-blue-600 transition duration-200 shadow-sm"
          > ${loading ? 'Creating...' : ' '}`}>
            
           Sign up
          </button>

          {/* Login Link */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button 
            type='button'
              onClick={switchForm}
              className="text-[#01589A] hover:underline font-medium"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
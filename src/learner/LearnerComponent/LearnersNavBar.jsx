import React, { useState } from "react";
import { PiSignIn, PiList, PiX } from "react-icons/pi";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "../../admin/contexts/CartContext";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useLearnerAuth } from "../contexts/LearnerAuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../admin/Config/Firebase";
import Logo  from "../../assets/icons/logo.png"; 
import { formatUserData } from "../../admin/utils/user";

const LearnersNavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const { currentLearner } = useLearnerAuth();
  const learner = formatUserData(currentLearner);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/learner/signin");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/learner" className="flex items-center">
            <img
              src={Logo}
              alt="Logo"
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            <NavLink
              to="/learner"
              className={({ isActive }) => 
                `text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium py-2 ${
                  isActive ? "text-blue-600 border-b-2 border-blue-600" : ""
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/tracksPage"
              className={({ isActive }) => 
                `text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium py-2 ${
                  isActive ? "text-blue-600 border-b-2 border-blue-600" : ""
                }`
              }
            >
              Tracks
            </NavLink>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cartpage" className="relative">
              <FiShoppingCart className="h-6 w-6 text-gray-700 hover:text-blue-600" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Desktop Auth */}
            <div className="hidden md:flex space-x-4">
              {!currentLearner ? (
                <>
                  <Link
                    to="/learner/signin"
                    className="flex items-center space-x-1 border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium"
                  >
                    <span>Login</span>
                    <PiSignIn className="text-sm" />
                  </Link>
                  <Link
                    to="/learner/signup"
                    className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <span>Sign Up</span>
                    <PiSignIn className="text-sm" />
                  </Link>
                </>
              ) : (
                <div className="relative">
                  {/* Avatar + Name */}
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <img
                      src={
                        learner.photoURL ||
                        `https://ui-avatars.com/api/?name=${
                          learner.displayName || learner.email
                        }`
                      }
                      alt="avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-gray-700 font-medium">
                      {learner.name || learner.email}
                    </span>
                  </button>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                      <Link
                        to="/portal"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Portal
                      </Link>
                     <hr />
                      <button
                        onClick={() => {
                          handleLogout();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <PiX size={24} /> : <PiList size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t p-4 space-y-3 animate-slideDown">
          <NavLink
            to="/learner"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => 
              `block font-medium ${
                isActive 
                  ? "text-blue-600 border-l-4 border-blue-600 pl-3" 
                  : "text-gray-700 hover:text-blue-600"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/tracksPage"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => 
              `block font-medium ${
                isActive 
                  ? "text-blue-600 border-l-4 border-blue-600 pl-3" 
                  : "text-gray-700 hover:text-blue-600"
              }`
            }
          >
            Tracks
          </NavLink>

          <hr className="my-2" />

          {currentLearner ? (
            <>
              <Link
                to="/portal"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-blue-600 font-medium"
              >
                Portal
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-gray-700 hover:text-red-600 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/learner/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="block bg-blue-600 text-white px-4 py-2 rounded-md text-center hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/learner/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-center hover:bg-blue-50 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default LearnersNavBar;
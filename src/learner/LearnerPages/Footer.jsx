// src/components/Footer.jsx
import React from "react";
import { FaFacebook, FaLinkedin } from "react-icons/fa";
import { IoIosArrowUp } from "react-icons/io";
import Logo2 from "../../../public/assets/icons/logo2.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-blue-800 text-white">
      {/* Top section */}
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Logo */}
        <div>
          <img
            src={Logo2}
            alt="Company Logo"
            className="w-32 h-auto object-contain"
          />
        </div>

        {/* Menu */}
        <div>
          <h4 className="font-semibold mb-3">Menu</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/learner" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link to="/tracksPage" className="hover:underline">
                Tracks
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <p>+233 4100 2000</p>
          <p>New Reiss, Accra, Ghana</p>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-semibold mb-3">Social</h4>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <FaLinkedin className="text-xl" />
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                LinkedIn
              </a>
            </li>
            <li className="flex items-center space-x-2">
              <FaFacebook className="text-xl" />
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <hr className="mx-6 border-blue-600" />

      {/* Bottom bar */}
      <div className="py-4 text-sm">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} - G-client, All rights reserved</p>
          <a
            href="#"
            className="flex items-center space-x-1 hover:underline"
          >
            <span>Back to top</span>
            <IoIosArrowUp />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

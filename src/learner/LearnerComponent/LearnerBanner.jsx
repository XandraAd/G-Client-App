import React from 'react';
import { Link } from 'react-router-dom';
import BannerImage from "../../assets/icons/banner.jpg";

const LearnerBanner = () => {
  return (
    <div
      className="relative bg-cover bg-center bg-no-repeat h-[300px] md:h-[400px] grid grid-cols-1 md:grid-cols-2 px-6 md:px-16"
      style={{ backgroundImage: `url(${BannerImage})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-blue-800/40"></div>

      {/* Left Column - Text */}
      <div className="relative z-10 flex flex-col justify-center text-center md:text-left max-w-xl mx-auto md:mx-0">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
          It’s time to start investing in yourself
        </h2>
        <p className="text-lg md:text-xl text-white/90">
          Online courses open the opportunity for learning to almost anyone,
          regardless of their scheduling commitments.
        </p>

        {/* Button (only shown here on small screens) */}
        <div className="mt-6 md:hidden">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium shadow-lg transition">
            Get Started
          </button>
        </div>
      </div>

      {/* Right Column - Button (only on larger screens) */}
      <Link to="/learner/signin" className="relative z-10  hidden md:flex items-center justify-center">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium shadow-lg transition">
          Get Started
        </button>
      </Link>
    </div>
  );
};

export default LearnerBanner;


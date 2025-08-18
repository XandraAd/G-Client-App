import React from "react";
import { Link } from "react-router-dom";
import HeroBackground from "../../assets/icons/herobackground.jpg";

const LearnersHerosection = () => {
  return (
    <section
      className="relative flex items-center py-20 min-h-[400px]"
      style={{
        backgroundImage: `url(${HeroBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Subtle dark overlay for better text readability */}
      <div className="absolute inset-0 bg-blue-900/30"></div>

      {/* Content container aligned to left */}
      <div className="relative z-10 container mx-auto px-6">
        <div className="max-w-xs text-left ">
          <h2 className="text-4xl sm:text-5xl md:text-2xl font-bold leading-tight mb-6 text-white">
            Unlock Your Potential with Industry-Leading Courses!
          </h2>
          <p className="text-lg sm:text-[16px] mb-8 text-white/90 max-w-lg">
            Join thousands of learners gaining real-world skills and advancing
            their careers. Our expert-led courses are designed to empower you to
            succeed.
          </p>
          <Link
            to="/learner/signin"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LearnersHerosection;




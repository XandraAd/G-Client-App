import React from "react";
import Discovery1 from "../../../public/assets/icons/discoveryimg1.png";
import Discovery2 from "../../../public/assets/icons/discoveryimg2.png";

const LearnerDiscovery = () => {
  const techStack = [
    { name: "ReactJs", color: "border-blue-400 " },
    { name: "NextJs", color: "border-gray-400 " },
    { name: "NodeJs", color: "border-green-500 " },
    { name: "Django", color: "border-emerald-500 " },
    { name: "MongoDB", color: "border-green-600 " },
    { name: "Vue.Js", color: "border-teal-400" },
    { name: "AWS", color: "border-yellow-500 " },
    { name: "Azure", color: "border-sky-500 " },
    { name: "PowerBI", color: "border-amber-500 " },
    { name: "Python", color: "border-indigo-400 " },
    { name: "Excel", color: "border-lime-500 " },
    { name: "Tableau", color: "border-purple-500 " },
  ];

  return (
    <div className="bg-gradient-to-l from-blue-600 to-blue-800
     text-white flex flex-col md:flex-row items-center 
     justify-between p-8 lg:p-16  shadow-lg overflow-hidden">
      {/* Left Column */}
      <div className="max-w-xl space-y-6 m-auto md:max-w-sm xl:max-w-2xl">
        <h2 className="text-3xl md:text-4xl xl:text-6xl font-bold">
          What will be next step?
        </h2>
        <p className="text-lg leading-relaxed opacity-90 xl:w-[550px]">
          Discover our diverse stack of solutions, including software
          development, data science, and cloud tools. Sign up today and
          kickstart your journey!
        </p>

        {/* Tech Buttons */}
        <div className="flex flex-wrap gap-3 xl:w-[380px]">
          {techStack.map((tech,index) => (
            <button
              key={index}
              className={`border ${tech.color} px-4 py-2  xl:py-4
             text-sm font-medium
               bg-white/5 hover:bg-white/10 transition`}
            >
              {tech.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right Column - Images */}
      <div className="relative flex items-center justify-center mt-8 md:mt-0 w-full md:w-auto">
        {/* Computer */}
        <img
          src={Discovery1}
          alt="Computer"
          className="w-[400px] md:w-[600px]"
        />
        {/* Phone in front */}
        <img
          src={Discovery2}
          alt="Mobile"
          className="absolute bottom-8 right-48 w-[80px] md:w-[80px] 
           lg:right-80  lg:w-[120px] lg:bottom-12 z-10 
           transform translate-x-4 translate-y-4"
        />
      </div>
    </div>
  );
};

export default LearnerDiscovery;

import React from "react";
import { FaSignInAlt, FaSyncAlt, FaGraduationCap, FaArrowDown } from "react-icons/fa";
import SecureLogin from "../../assets/icons/secure-login.png";
import Authentication from "../../assets/icons/authentication.png";
import CodeIcon from "../../assets/icons/codeIcon.png";
import DataIcon from "../../assets/icons/dataIcon.png";
import CloudIcon from "../../assets/icons/CloudIcon.png";

const OnboardingSteps = () => {
  return (
    <div className="  h-[800px] grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 md:p-12 lg:p-16 max-w-7xl mx-auto">
      {/* Left Column - Steps */}
      <div className=" h-[600px] flex flex-col items-start space-y-8">   
        {/* Step 1 */}
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-start gap-4 w-full ">
          <div className="text-blue-600 text-3xl shrink-0">
            <FaSignInAlt />
          </div>
          <div>
            <h3 className="font-semibold text-base md:text-lg">
              Sign Up and Choose Your Course
            </h3>
            <p className="text-gray-600 text-sm md:text-base">
              Create your account quickly with just your email or social media login,
              then explore a wide range.
            </p>
          </div>
        </div>
      <div className="text-blue-500 text-2xl self-center "><FaArrowDown/></div>

        {/* Step 2 */}
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-start gap-4 w-full">
          <div className="text-blue-600 text-3xl shrink-0">
            <FaSyncAlt />
          </div>
          <div>
            <h3 className="font-semibold text-base md:text-lg">Onboarding</h3>
            <p className="text-gray-600 text-sm md:text-base">
              Get started seamlessly with a smooth onboarding experience. Learn the essentials
              and set yourself up for success from day one.
            </p>
          </div>
        </div>

        <div className="text-blue-500 text-2xl self-center "><FaArrowDown/></div>

        {/* Step 3 */}
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-start gap-4 w-full">
          <div className="text-blue-600 text-3xl shrink-0">
            <FaGraduationCap />
          </div>
          <div>
            <h3 className="font-semibold text-base md:text-lg">Start Learning</h3>
            <p className="text-gray-600 text-sm md:text-base">
              Start your learning journey with practical, hands-on experience. Develop the skills
              needed to build, implement, and manage effective solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Process Illustration */}
      <div className="h-[600px] rounded-xl shadow-lg p-6 flex flex-col gap-6">
        {/* Top Two Steps */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="font-semibold text-base">1</p>
            <p className="text-gray-600 text-sm">Secure Login</p>
            <img
              src={SecureLogin}
              alt="Secure Login"
              className="mx-auto mt-2 w-16 lg:w-32 h-16 lg:h-20  object-contain"
            />
          </div>
          <div>
            <p className="font-semibold text-base">2</p>
            <p className="text-gray-600 text-sm">Authentication</p>
            <img
              src={Authentication}
              alt="Authentication"
              className="mx-auto mt-2 w-16 lg:w-32 h-16 lg:h-20   object-contain"
            />
          </div>
        </div>

        {/* Courses Section */}
        <div>
          <p className="font-semibold my-8 text-base md:text-lg">3 Choose a course</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                icon: CodeIcon,
                title: "Software Development",
                desc: "Unlock your potential with comprehensive training in modern software development.",
                price: "GHS 3500",
              },
              {
                icon: DataIcon,
                title: "Data Science Mastery",
                desc: "Equip yourself with the skills to analyze, interpret, and leverage data, becoming an expert.",
                price: "GHS 4200",
              },
              {
                icon: CloudIcon,
                title: "Cloud Computing Expertise",
                desc: "Gain hands-on experience in cloud architecture, preparing you to manage scalable solutions.",
                price: "GHS 2200",
              },
            ].map((course, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-4 text-left hover:shadow-lg transition"
              >
                <img src={course.icon} alt="course icons" className="mb-2 h-8" />
                <h4 className="font-semibold text-sm md:text-base min-h-[5rem] ">
                  {course.title}
                </h4>
                <p className="text-gray-600 text-xs md:text-sm mt-1 line-clamp-3">
                  {course.desc}
                </p>
                <p className="mt-2 font-semibold text-xs md:text-sm text-blue-600">
                  Price: {course.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSteps;

import React from 'react';
import {  FaUserGraduate, FaGraduationCap, FaClock } from 'react-icons/fa';

const Card = ({ icon, count, description }) => {
  return (
    <div className="bg-white rounded-xl p-6 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl mb-4">
          {icon}
        </div>
      </div>
      <h3 className="text-4xl font-bold text-gray-800 mb-2">{count}</h3>
      <p className="text-gray-600 text-lg">{description}</p>
    </div>
  );
};

const StatsFromAdmin = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">We are proud</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We are good, we are passionate and committed to excellence. Life is a welcoming transition, growth, and success.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
     
        <Card
          icon={<FaGraduationCap />}
          count="4+"
          description="Courses"
        />
        <Card
          icon={<FaUserGraduate />}
          count="200+"
          description="Course students"
        />
        <Card
          icon={<FaClock />}
          count="250+"
          description="Hours of content"
        />
      </div>
    </div>
  );
};

export default StatsFromAdmin;

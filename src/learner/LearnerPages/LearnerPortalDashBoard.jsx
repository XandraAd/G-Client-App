import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import LearnersNavBar from "../LearnerComponent/LearnersNavBar";
import Footer from "./Footer";

const LearnerDashboard = () => {
  return (
   <div>
    <div>  <LearnersNavBar/></div>
   
    <div className="min-h-screen bg-gray-50">
      {/* Top Header with Tabs */}
      <div className="bg-blue-700 h-[175px] flex items-end">
        <nav className="w-full max-w-6xl mx-auto flex flex-wrap gap-4 px-4 md:px-6">
          <NavLink
            to="dashboard"  
            end  
            className={({ isActive }) =>
              isActive
                ? "bg-white text-blue-700 font-semibold rounded-t-lg px-4 md:px-6 py-2 md:py-3 shadow-md"
                : "text-white/80 hover:text-white px-4 md:px-6 py-2 md:py-3"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="settings"  
            className={({ isActive }) =>
              isActive
                ? "bg-white text-blue-700 font-semibold rounded-t-lg px-4 md:px-6 py-2 md:py-3 shadow-md"
                : "text-white/80 hover:text-white px-4 md:px-6 py-2 md:py-3"
            }
          >
            Settings
          </NavLink>
          <NavLink
            to="learnerinvoices"  
            className={({ isActive }) =>
              isActive
                ? "bg-white text-blue-700 font-semibold rounded-t-lg px-4 md:px-6 py-2 md:py-3 shadow-md"
                : "text-white/80 hover:text-white px-4 md:px-6 py-2 md:py-3"
            }
          >
            Invoices
          </NavLink>
        </nav>
      </div>

      {/* Page Content */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="bg-white shadow rounded-lg p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
    <div><Footer/></div>
    
    </div>
  
  );
};

export default LearnerDashboard;
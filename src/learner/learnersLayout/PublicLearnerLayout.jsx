
import React from "react";
import { Outlet} from "react-router-dom";
import LearnersNavBar from "../LearnerComponent/LearnersNavBar";
import Footer from "../LearnerPages/Footer";

const PublicLearnerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <LearnersNavBar/>
    

      {/* Main Content */}
      <main className="flex-1 container   ">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default PublicLearnerLayout;

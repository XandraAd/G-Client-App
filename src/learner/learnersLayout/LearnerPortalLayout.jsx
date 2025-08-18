// src/learner/learnersLayout/LearnerPortalLayout.js
import { Outlet, NavLink } from "react-router-dom";
import LearnersNavBar from "../LearnerComponent/LearnersNavBar";
import Footer from "../LearnerPages/Footer";

export default function LearnerPortalLayout() {
  return (
    <div className="flex flex-col min-h-screen">
  
<LearnersNavBar/>
      {/* Page Content */}
      <main  >
        <Outlet />
      </main>
      <Footer/>
    </div>
  );
}


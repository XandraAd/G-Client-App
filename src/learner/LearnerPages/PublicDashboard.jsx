// src/pages/PublicLearnerDashboard.jsx
import React from "react";

import LearnersHerosection from "../LearnerComponent/LearnersHerosection";
import LearnerTracks from "../LearnerComponent/LearnerTracks";

import LearnerDiscovery from "../LearnerComponent/LearnerDiscovery";
import LearnerBanner from "../LearnerComponent/LearnerBanner";
import OnboardingSteps from "../LearnerComponent/OnBoardingSteps";
import StatsFromAdmin from "../LearnerComponent/StatsFromAdmin";

const PublicLearnerDashboard = () => {
  return (
    <div className=" ">
     

      {/* Hero Section */}
      <LearnersHerosection />

      {/* Tracks Section */}
      <LearnerTracks />

      {/*Discovery Section*/}
      <LearnerDiscovery />

      {/* Stats Section */}
      <StatsFromAdmin/>
      
      {/*Banner Section*/}
      <LearnerBanner/>

      {/*OnBoarding*/}
      <OnboardingSteps/>
      

     
    </div>
  );
};

export default PublicLearnerDashboard;

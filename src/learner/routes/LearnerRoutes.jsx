// src/routes/LearnerRoutes.jsx
import { Routes, Route } from "react-router-dom";
import LearnerSignIn from "../pages/learner/LearnerSignIn";
import LearnerSignUp from "../pages/learner/LearnerSignUp";
import LearnerDashboard from "../pages/learner/LearnerDashboard";

export default function LearnerRoutes() {
  return (
    <Routes>
      <Route path="/learner/signin" element={<LearnerSignIn />} />
      <Route path="/learner/signup" element={<LearnerSignUp />} />
      <Route path="/learner/dashboard" element={<LearnerDashboard />} />
    </Routes>
  );
}

import React, { useState, useEffect } from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./admin/contexts/authContext";
import { useLearnerAuth } from "./learner/contexts/LearnerAuthContext";

// Admin components
import Layout from "./admin/Components/layout/Layout";
import Home from "./admin/Pages/Home";
import DashBoard from "./admin/Pages/DashBoard";
import Invoices from "./admin/Pages/Invoices";
import Learners from "./admin/Pages/Learners";
import Courses from "./admin/Pages/Courses";
import Report from "./admin/Pages/Report";
import Tracks from "./admin/Pages/Tracks";
import ManageProfile from "./admin/Pages/ManageProfile";
import OTPVerification from "./admin/Components/forms/OTpVerification";
import TrackDetails from "./admin/Pages/TrackDetails";
import LoadingIndicator from "./admin/Components/LoadingIndicator";
import ResetPassword from "./admin/Components/forms/ResetPassword";
import NewPassword from "./admin/Components/forms/NewPassword";
import FirebaseActionHandler from "./admin/Config/FirebaseAction";

// Learner components
import PublicLearnerLayout from "./learner/learnersLayout/PublicLearnerLayout";

import PublicDashboard from "./learner/LearnerPages/PublicDashboard";
import LearnerDashboard from "./learner/LearnerPages/LearnerPortalDashBoard";
import LearnerLoginPage from "./learner/LearnerPages/LearnerLoginPage";
import LearnerResetPassword from "./learner/LearnerComponent/LearnerForm/LearnerResetPassword";
import LearnerOtpVerification from "./learner/LearnerComponent/LearnerForm/LearnersOtpVerification";
import LearnerTracks from "./learner/LearnerComponent/LearnerTracks";
import TracksPage from "./learner/LearnerPages/TracksPage";
import LearnerTrackDetails from "./learner/LearnerComponent/LearnerTrackDetails";
import CartPage from "./learner/LearnerPages/CartPage";
import CheckOut from "./learner/LearnerPages/CheckOut";
import LearnerSettings from "./learner/LearnerPages/LearnerSettings";
import LearnerInvoices from "./learner/LearnerPages/LearnerInvoices";
import PrivateDashboard from "./learner/LearnerPages/PrivateDashboard";
import PaymentSuccess from "./learner/LearnerPages/PaymentSuccess";

function ProtectedRoute({ children, isAuthenticated, loading }) {
  if (loading) return <LoadingIndicator />;
  return isAuthenticated ? children : <Navigate to="/signin" replace />;
}

function LearnerProtectedRoute({ children, isAuthenticated, loading }) {
  if (loading) return <LoadingIndicator />;
  return isAuthenticated ? children : <Navigate to="/learner/signin" replace />;
}

function App() {
  const currentUser = useAuth(); // admin
  const { currentLearner, loading: learnerLoading } = useLearnerAuth(); // learner

  const [authChecked, setAuthChecked] = useState(false);
  const [learnerChecked, setLearnerChecked] = useState(false);

  useEffect(() => {
    if (currentUser !== undefined) setAuthChecked(true);
    if (currentLearner !== undefined) setLearnerChecked(true);
  }, [currentUser, currentLearner]);

  const isAdmin = !!currentUser;
  const isLearner = !!currentLearner;

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* ---------------- PUBLIC LEARNER ROUTES ---------------- */}
        <Route element={<PublicLearnerLayout />}>
         <Route path="/" element={<PublicDashboard />} /> 
          <Route path="/learner" element={<PublicDashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/tracks" element={<LearnerTracks />} />
          <Route path="/tracksPage" element={<TracksPage />} />
          <Route path="tracks/:id" element={<LearnerTrackDetails />} />
          <Route path="/cartpage" element={<CartPage />} />
          <Route path="/checkout" element={<CheckOut />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Route>

        {/* Learner Auth Pages */}
        <Route
          path="/learner/signin"
          element={<LearnerLoginPage initialForm="signin" />}
        />
        <Route
          path="/learner/signup"
          element={<LearnerLoginPage initialForm="signup" />}
        />
        <Route path="/learner/reset" element={<LearnerResetPassword />} />
        <Route path="/learner/verify" element={<LearnerOtpVerification />} />

        {/* ---------------- ADMIN AUTH PAGES ---------------- */}
        <Route path="/signin" element={<Home />} />
        <Route path="/signup" element={<Home />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/auth-action" element={<FirebaseActionHandler />} />

        {/* ---------------- ADMIN PROTECTED ROUTES ---------------- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute isAuthenticated={isAdmin} loading={!authChecked}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashBoard />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="tracks" element={<Tracks />} />
          <Route path="tracks/:id" element={<TrackDetails />} />
          <Route path="tracks/edit/:id" element={<TrackDetails />} />
          <Route path="learners" element={<Learners />} />
          <Route path="courses" element={<Courses />} />
          <Route path="report" element={<Report />} />
          <Route path="manage-profile" element={<ManageProfile />} />
        </Route>

        {/* ---------------- LEARNER PORTAL PROTECTED ROUTES ---------------- */}
        <Route
          path="/portal"
          element={
            <LearnerProtectedRoute
              isAuthenticated={isLearner}
              loading={!learnerChecked || learnerLoading}
            >
              <LearnerDashboard />
            </LearnerProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
     
      <Route path="dashboard" element={<PrivateDashboard/>}/>
          <Route path="settings" element={<LearnerSettings />} />
          <Route path="learnerinvoices" element={<LearnerInvoices />} />
        </Route>

        {/* ---------------- CATCH ALL ---------------- */}
        <Route path="*" element={<Navigate to="/" />} />
      </>
    )
  );

  if (!authChecked || !learnerChecked) return <LoadingIndicator />;
  return <RouterProvider router={router} />;
}

export default App;
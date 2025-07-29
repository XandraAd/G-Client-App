import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./admin/contexts/authContext/index";
import Layout from "./admin/Components/layout/Layout";

import Home from "./admin/Pages/Home";
import DashBoard from "./admin/Pages/DashBoard";
import Invoices from "./admin/Pages/Invoices";
import Learners from "./admin/Pages/Learners";
import Courses from "./admin/Pages/Courses";
import Report from "./admin/Pages/Report";
import Tracks from "./admin/Pages/Tracks";
import OTPVerification from "./admin/Components/forms/OTpVerification";
import TrackDetails from "./admin/Pages/TrackDetails";
import LoadingIndicator from "./admin/Components/LoadingIndicator"; // optional
import { useEffect, useState } from "react";
import ResetPassword from "./admin/Components/forms/ResetPassword";
import NewPassword from "./admin/Components/forms/NewPassword";
import FirebaseActionHandler from "./admin/Config/FirebaseAction";

function ProtectedRoute({ children, isAuthenticated, loading }) {
  if (loading) return <LoadingIndicator />;

  return isAuthenticated ? children : <Navigate to="/signin" replace />;
}

function App() {
  const currentUser = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (currentUser !== undefined) {
      setAuthChecked(true);
    }
  }, [currentUser]);

  const isAuthenticated = !!currentUser;

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>

        {/* Root path redirects to signin */}
        <Route path="/" element={<Navigate to="/signin" replace />} />


        {/* Public pages */}
        <Route path="/signin" element={<Home />} />
        <Route path="/signup" element={<Home />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/new-password" element={<NewPassword/>}/>

        {/* Protected dashboard area */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              authChecked={authChecked}
              isAuthenticated={isAuthenticated}
            >
              <Layout/>
            </ProtectedRoute>
          }
        >
          <Route index element={authChecked ? <DashBoard /> : null} />
  <Route path="invoices" element={<Invoices />} />
  <Route path="tracks" element={<Tracks />} />
  <Route path="tracks/:id" element={<TrackDetails />} />
  <Route path="tracks/edit/:id" element={<TrackDetails />} />
  <Route path="learners" element={<Learners />} />
  <Route path="courses" element={<Courses />} />
  <Route path="report" element={<Report />} />
         

        </Route>
          
        {/* Catch-all redirect */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/signin"} />}
        />
       <Route path="/auth-action" element={<FirebaseActionHandler />} />

      </>
    )
  );

 if (!authChecked) {
    return <LoadingIndicator />;
  }

  return <RouterProvider router={router} />;
}

// Separate component for protected layout
function ProtectedLayout({ isAuthenticated, authChecked, children }) {
  if (!authChecked) return <LoadingIndicator />;
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  
  return <Layout>{children}</Layout>;
}

export default App;

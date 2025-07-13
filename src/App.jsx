import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Navigate,
  Outlet,
  
} from "react-router-dom";
import { useAuth } from "./admin/contexts/authContext/index";
import Layout from "./admin/Components/layout/Layout";
import Home from "./admin/Pages/Home";
import Invoices from "./admin/Pages/Invoices";
import Learners from "./admin/Pages/Learners";
import Courses from "./admin/Pages/Courses";
import Report from "./admin/Pages/Report";
import OTPVerification from "./admin/Components/forms/OTpVerification";


import LoadingIndicator from "./admin/Components/LoadingIndicator"; // optional
import { useEffect, useState } from "react";
import ResetPassword from "./admin/Components/forms/ResetPassword";

function ProtectedRoute({ isAuthenticated, authChecked }) {
  if (!authChecked) return <LoadingIndicator /> ;
   
   return isAuthenticated ? <Outlet/> : <Navigate to="/signin" replace />;
  
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

          {/* Public pages */}
        <Route path="/signin" element={<Home />} />
        <Route path="/signup" element={<Home />} />
        <Route path="/reset" element={<ResetPassword />} />  
              <Route path="/verify-otp" element={<OTPVerification />} />


        {/* Protected dashboard area */}
        <Route path="/" element={<ProtectedRoute
         authChecked={authChecked} 
         isAuthenticated={isAuthenticated}>
          <Layout/>
          </ProtectedRoute> }>
         
            <Route index element={<Home />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="learners" element={<Learners />} />
            <Route path="courses" element={<Courses />} />
            <Route path="report" element={<Report />} />
          
        </Route>
           {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/signin"} />}/>

       
      </>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;

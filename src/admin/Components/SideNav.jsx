import { useState } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import LogOutIcon from "../../../public/assets/icons/logoutIcon.png";
import Logo from "../../../public/assets/icons/logo.png";
import NavLinks from "../Components/NavLinks";
import DashboardIcon from "../../../public/assets/icons/Glance Horizontal.png";
import VectorIcon from "../../../public/assets/icons/Vector.png";
import CommunityIcon from "../../../public/assets/icons/People Community.png";
import VectorIconBlue from "../../../public/assets/icons/VectorActive.png";
import HatGraduationIcon from "../../../public/assets/icons/Hat Graduation.png";
import DashboardIconBlue from "../../../public/assets/icons/GlanceActive.png";
import LearnerActive from "../../../public/assets/icons/learnerActive.png";
import InvoiceActive from "../../../public/assets/icons/invoiceActive.png";
import AdminImg from "../../../public/assets/icons/adminImg.png";
import { useAuth } from "../contexts/authContext/index"
import { formatUserData } from "../utils/user";


const navItems = [
  {
    title: "Dashboard",
    path: "/admin",
    icon: DashboardIcon,
    activeIcon: DashboardIconBlue,
  },
  { title: "Invoices",
     path: "invoices", 
     icon: VectorIcon ,
    activeIcon:InvoiceActive},

  { title: "Learners", 
    path: "learners", 
    icon: CommunityIcon,
  activeIcon:LearnerActive},
  {
    title: "Tracks",
    path: "tracks",
    icon: HatGraduationIcon,
    activeIcon: VectorIconBlue,
  },
  {
    title: "Courses",
    path: "courses",
    icon: HatGraduationIcon,
    activeIcon: VectorIconBlue,
  },
  {
    title: "Report",
    path: "report",
    icon: DashboardIcon,
    activeIcon: DashboardIconBlue,
  },
   
];

function SideNav({ isOpen, onClose}) {
  const navigate = useNavigate();
   const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeRoute, setActiveRoute] = useState(navItems[0].title);
  
const {currentUser}=useAuth();
const admin=formatUserData(currentUser,true);



  const handleLogout = async () => {
    try {
      setIsLoading(true);
      navigate({ pathname: "/signin" });
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteChange = (tab) => {
    setActiveRoute(tab);
  };

 const renderUserInfo = () => (
  <div className="flex flex-col items-start gap-2 px-4 py-3 text-white text-xs">
    <div className="flex items-center gap-3 w-full justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            console.log("Current pathname:", location.pathname);
            console.log("Navigating to manage-profile");
            navigate("manage-profile");
            setTimeout(
              () => console.log("New pathname:", window.location.pathname),
              100
            );
          }}
          className="focus:outline-none"
          aria-label="Edit profile"
        >
          <img
            src={
            admin?.photoURL || AdminImg
            }
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        </button>

        <div className="leading-tight">
          <h6 className="font-semibold text-sm">
            {admin?.name || currentUser?.displayName || "User"}
          </h6>
          <p className="text-[10px]">
            {admin?.email || "Loading..."}
          </p>
          {/* Show role or admin status */}
          <p className="text-[10px] italic">
          {admin?.role || "Admin"}
          </p>
        </div>
      </div>

      <button onClick={handleLogout} disabled={isLoading}>
        <img src={LogOutIcon} alt="Logout" className="w-4 h-4" />
      </button>
    </div>
  </div>
);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col bg-blue-500 min-h-full border p-2  lg:w-[200px] xl:w-[400px] lg:rounded-b-lg fixed">
        <div className="min-w-full mb-2 p-6 bg-white flex justify-center items-center shadow-md">
          <img src={Logo} className="w-32 h-auto object-contain" alt="Company Logo" />
        </div>

        <NavLinks
          navItems={navItems}
          activeRoute={activeRoute}
          handleRouteChange={handleRouteChange}
        />

        <div className="fixed bottom-2 w-[22%]">{renderUserInfo()}</div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed top-0 inset-0 z-50 lg:hidden">
          <div className="bg-blue-500 h-full w-2/3 p-2 flex flex-col justify-between">
            <NavLinks
              navItems={navItems}
              activeRoute={activeRoute}
              handleRouteChange={handleRouteChange}
              onClose={onClose}
            />
            <div className="mb-4">{renderUserInfo()}</div>
          </div>
        </div>
      )}

  

    </>
  );
}

export default SideNav;

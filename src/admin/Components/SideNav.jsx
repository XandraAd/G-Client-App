import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogOutIcon from "../../assets/icons/logoutIcon.png";
import Logo from "../../assets/icons/logo.png";
import NavLinks from "../Components/NavLinks";
import DashboardIcon from "../../assets/icons/Glance Horizontal.png";
import VectorIcon from "../../assets/icons/Vector.png";
import CommunityIcon from "../../assets/icons/People Community.png";
import VectorIconBlue from "../../assets/icons/VectorActive.png";
import HatGraduationIcon from "../../assets/icons/Hat Graduation.png";
import DashboardIconBlue from "../../assets/icons/GlanceActive.png";
import AdminImg from "../../assets/icons/adminImg.png";

const navItems = [
  {
    title: "Dashboard",
    path: "dashboard",
    icon: DashboardIcon,
    activeIcon: DashboardIconBlue,
  },
  { title: "Invoices", path: "invoices", icon: VectorIcon },
  { title: "Learners", path: "learners", icon: CommunityIcon },
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

function SideNav({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeRoute, setActiveRoute] = useState(navItems[0].title);

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
    <div className="flex items-center justify-between px-4 py-3 bg-inherit text-white text-xs">
      <div className="flex items-center gap-3">
        <img
          src={AdminImg}
          alt="Admin avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="leading-tight">
          <h6 className="font-semibold text-sm">admin 123</h6>
          <p className="text-[10px]">admin123@gmail.com</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="hover:text-red-300"
      >
        <img src={LogOutIcon} alt="Logout Icon" className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col bg-blue-500 min-h-full p-2 w-[22%] lg:w-[200px] xl:w-[400px] lg:rounded-b-lg fixed">
        <div className="min-w-full mb-2 p-6 bg-white flex justify-center items-center shadow-md">
          <img
            src={Logo}
            className="w-32 h-auto object-contain"
            alt="Company Logo"
          />
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
        <div className="fixed top-0 inset-0 z-50 lg:hidden ">
          <div className=" bg-blue-500 h-full w-2/3 p-2 flex flex-col justify-between lg:hidden">
            <NavLinks
              navItems={navItems}
              activeRoute={activeRoute}
              handleRouteChange={handleRouteChange}
              onClose={onClose}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default SideNav;


import { useState } from "react";
import { Link, useNavigate } from "react-router";
import DashboardIcon from "../../assets/icons/Glance Horizontal.png";
import VectorIcon from "../../assets/icons/Vector.png";
import CommunityIcon from "../../assets/icons/People Community.png";
import VectorIconBlue from "../../assets/icons/VectorActive.png"
import HatGraduationIcon from "../../assets/icons/Hat Graduation.png";
import DashboardIconBlue from "../../assets/icons/GlanceActive.png"
import Logo from "../../assets/icons/logo.png";

const navItems = [
  {
    title: "Dashboard",
    path: "/",
    icon: DashboardIcon,
   activeIcon: DashboardIconBlue,},


  {
    title: "Invoices",
    path: "invoices",
    icon: VectorIcon,
  
  
    
  },
  {
    title: "Learners",
    path: "learners",
    icon: CommunityIcon,
  },
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
      //await logout();
      setIsLoading(false);
      // You'll need to replace Chakra toast with a different solution
      // For example: react-hot-toast or your own toast component
      navigate({ pathname: "/signin" });
    } catch (error) {
      console.error('Wait still Loading',error) 
    }
  };

  const handleRouteChange = (tab) => {
    setActiveRoute(tab);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="flex flex-col bg-blue-500  p-1  shadow-md  min-h-[90vh] w-[20.5%] gap-3 fixed">
        <img src={Logo} className="w-[264px] h-[93px] object-contain mx-auto my-2   bg-white" alt="Company Logo"/>
        <hr className="border-gray-200" />
        
        {navItems.map((navItem) => (
          <Link
            key={navItem.title}
            to={navItem.path}
            onClick={() => handleRouteChange(navItem.title)}
            className={`capitalise ${
              activeRoute === navItem.title 
                ? "bg-white shadow-lg font-semibold text-blue-400 " 
                : "bg-transparent font-normal  text-white"
            } p-3 rounded-sm text-lg gap-4 w-full flex items-center`}
          >
            <img src={activeRoute === navItem.title ? navItem.activeIcon : navItem.icon} alt={navItem.title}   className="w-6 h-6" 
      
    />
            <span className="text-sm">{navItem.title}</span>
          </Link>
        ))}
        
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="bg-gradient-to-l from-teal-400 via-teal-300 to-teal-200 transition-all duration-1000 text-white font-bold rounded-lg uppercase shadow-lg mt-auto p-3 hover:bg-teal-400"
        >
          {isLoading ? "Logging out..." : "Logout"}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          <div className="relative bg-white h-full w-64 p-4">
            <div className="flex flex-col h-full gap-4">
              <img src={Logo} className="w-20 h-20 object-contain mx-auto" alt="Company Logo"/>
              
              {navItems.map((navItem, id) => (
                <Link
                  key={id}
                  to={navItem.path}
                  onClick={() => {
                    handleRouteChange(navItem.title);
                    onClose();
                  }}
                  className={`capitalise ${
                    activeRoute === navItem.title 
                      ? "bg-gray-200 shadow-lg " 
                      : "bg-transparent font-semibold"
                  } text-gray-600 p-3 rounded-lg text-lg gap-4 w-full flex items-center`}
                >
                  <img src={navItem.icon} alt={navItem.title} className= {`w-6 h-6 ${activeRoute === navItem.title ? navItem.activeIcon:navItem.icon}`}  />
                  <span className={`text-sm ${
        activeRoute === navItem.title ? "text-blue-500" : "text-gray-600"
      }`}>{navItem.title}</span>
                </Link>
              ))}
              
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="bg-gradient-to-l from-teal-400 via-teal-300 to-teal-200 transition-all duration-1000 text-white font-bold rounded-lg uppercase shadow-lg mt-auto p-3 hover:bg-teal-400"
              >
                {isLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SideNav;
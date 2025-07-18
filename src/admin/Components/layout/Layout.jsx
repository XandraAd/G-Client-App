import { Outlet,useNavigate } from "react-router-dom";
import SideNav from "../SideNav";
import Logo from "../../../assets/icons/logo.png";
import AdminImg from "../../../assets/icons/adminImg.png";
import { CiLogout } from "react-icons/ci";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getAuth, signOut } from "firebase/auth";

const Navigation = ({ onOpen }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [greetText, setGreetText] = useState("");
  const currentDate = useMemo(() => new Date(), []);
  const day = currentDate.toLocaleDateString("default", { weekday: "long" });
  const month = currentDate.toLocaleString("default", { month: "long" });
  const date = `${day}, ${month} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser.displayName || currentUser.email);
    }
    const currentHour = currentDate.getHours();
    if (currentHour < 12) setGreetText("Good Morning!");
    else if (currentHour < 18) setGreetText("Good Afternoon!");
    else setGreetText("Good Evening!");
  }, [currentDate]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const auth = getAuth();
      await signOut(auth);
      navigate({ pathname: "/signin" });
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="w-full ">
      {/* Top Row: Hamburger + Logo (left), User Info (right) */}
      <div className="flex items-center justify-between lg:hidden">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-2">
          <button
            className="text-blue-600 text-lg shadow-2xl"
            onClick={onOpen}
            aria-label="Open menu"
          >
            &#9776;
          </button>
          <img
            src={Logo}
            className="w-28 h-auto object-contain "
            alt="Company Logo"
          />
        </div>

        {/* Right: Admin Info */}
        <div className="flex items-center gap-1">
          <img
            src={AdminImg}
            alt="Admin avatar"
            className="w-6 h-6 rounded-full object-cover "
          />
          <div className="leading-tight  text-xs text-gray-800">
            <p className="font-semibold ">{user}</p>
            <p className="text-[8px]">{user?.email}</p>
          </div>
          <button onClick={handleLogout}>
            <CiLogout className="w-4 h-8  text-blue-600  " />
          </button>
        </div>
      </div>

      {/* Greeting (centered on mobile, inline on lg) */}
      <div className="mt-3 lg:text-center ">
        <p className="text-xs font-semibold text-gray-700 ">
          {greetText} {user} ,{date}
        </p>
      </div>
    </header>
  );
};

function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-[220px] xl:w-[450px]  ">
       <SideNav isOpen={isOpen} onClose={onClose}  />
      </aside>
      

      {/* Main content area */}
      <main className="flex-1  p-4">
        <Navigation onOpen={onOpen} />
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

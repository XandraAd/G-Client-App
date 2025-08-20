import { Outlet, useNavigate } from "react-router-dom";
import SideNav from "../SideNav";
import Logo from "../../../assets/icons/logo.png";
import AdminImg from "../../../assets/icons/adminImg.png";
import { CiLogout } from "react-icons/ci";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "../../contexts/authContext";


const Navigation = ({ onOpen, user, handleLogout }) => {
  const [greetText, setGreetText] = useState("");
  const currentDate = useMemo(() => new Date(), []);
  const day = currentDate.toLocaleDateString("default", { weekday: "long" });
  const month = currentDate.toLocaleString("default", { month: "long" });
  const date = `${day}, ${month} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  const navigate=useNavigate()
  const { currentUser } = useAuth();

  useEffect(() => {
    const currentHour = currentDate.getHours();
    if (currentHour < 12) setGreetText("Good Morning!");
    else if (currentHour < 18) setGreetText("Good Afternoon!");
    else setGreetText("Good Evening!");
  }, [currentDate]);

  return (
    <header className="w-full ">
      <div className="flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-2">
          <button
            className="text-blue-600 text-lg shadow-2xl"
            onClick={onOpen}
            aria-label="Open menu"
          >
            &#9776;
          </button>
          <img src={Logo} className="w-28 h-auto object-contain" alt="Company Logo" />
        </div>

        <div className="flex items-center gap-1">
            <button
            type="button"
            
    onClick={() => {
    console.log("Current pathname:", location.pathname);
    console.log("Navigating to manage-profile");
    navigate("manage-profile");
    // Check what the final URL is after navigation
    setTimeout(() => console.log("New pathname:", window.location.pathname), 100);
  }}
            className="focus:outline-none"
            aria-label="Edit profile"
          >
                    <img
                      src={currentUser?.photoURL || AdminImg}
                      alt="Admin avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </button>
          <div className="leading-tight text-xs text-gray-800">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-[8px]">{user.email}</p>
          </div>
          <button onClick={handleLogout}>
            <CiLogout className="w-4 h-8 text-blue-600" />
          </button>
        </div>
      </div>

      <div className="mt-3 lg:text-center">
        <p className="text-xs font-semibold text-gray-700">
          {greetText} {user.name}, {date}
        </p>
      </div>
    </header>
  );
};

function Layout() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState({ name: "", email: "" });
  const navigate = useNavigate();

  // Open/Close handlers for mobile nav
  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);

  // Load user from Firebase Auth on mount
  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser({
        name: currentUser.displayName || "Admin",
        email: currentUser.email,
      });
    }
  }, []);

  // Logout handler shared across components
  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-[220px] xl:w-[400px]">
        <SideNav isOpen={isOpen} onClose={onClose} user={user} handleLogout={handleLogout} />
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-4">
        <Navigation onOpen={onOpen} user={user} handleLogout={handleLogout} />
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

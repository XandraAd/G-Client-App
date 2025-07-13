import { Outlet, NavLink } from "react-router-dom";
import SideNav from "../SideNav";
//
import { useState, useEffect, useMemo, useCallback } from "react";



const Navigation = ({ onOpen }) => {
  const [greetText, setGreetText] = useState("");
  const currentDate = useMemo(() => new Date(), []);
  const day = currentDate.toLocaleDateString("default", { weekday: "long" });
  const month = currentDate.toLocaleString("default", { month: "long" });
  const date = `${day}, ${month} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;

  useEffect(() => {
    const currentHour = currentDate.getHours();
    if (currentHour < 12) setGreetText("Good Morning!");
    else if (currentHour < 18) setGreetText("Good Afternoon!");
    else setGreetText("Good Evening!");
  }, [currentDate]);

  return (
    <header className="flex items-center justify-between py-4 px-4">
      <button
        className="block xl:hidden text-blue-600 text-2xl"
        onClick={onOpen}
        aria-label="Open menu"
      >
        &#9776;
      </button>
      <p className="hidden lg:flex text-sm font-semibold">
        {greetText} {date}
      </p>
      <div className="flex items-center gap-4 ml-auto">
       
        <NavLink 
          to="#" 
          className="relative w-8 h-8 bg-gray-200 rounded-full"
          aria-label="User profile"
        >
          {/* Add proper avatar content */}
        </NavLink>
        <div 
          className="w-8 h-8 bg-gray-300 rounded-full border-2 border-green-500"
          aria-hidden="true"
        ></div>
      </div>
    </header>
  );
};

function Layout() {  // Removed isAuthenticated prop
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);

  return (
    <div className="flex py-2 ps-4">
      <SideNav isOpen={isOpen} onClose={onClose} />
      <main className="w-full xl:w-[80%] ms-auto pe-5">
        <Navigation onOpen={onOpen} />
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

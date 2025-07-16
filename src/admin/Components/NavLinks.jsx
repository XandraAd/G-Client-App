// NavLinks.jsx
import { Link } from "react-router-dom";

const NavLinks = ({ navItems, activeRoute, handleRouteChange, onClose }) => (
  <div className="flex-1 overflow-y-auto space-y-2">
    {navItems.map((navItem) => (
      <Link
        key={navItem.title}
        to={navItem.path}
        onClick={() => {
          handleRouteChange(navItem.title);
          if (onClose) onClose();
        }}
        className={`capitalize ${
          activeRoute === navItem.title
            ? "bg-white text-blue-500 shadow-md font-semibold"
            : "text-white"
        } flex items-center gap-3 p-3 rounded transition-all`}
      >
        <img
          src={
            activeRoute === navItem.title
              ? navItem.activeIcon || navItem.icon
              : navItem.icon
          }
          alt={navItem.title}
          className="w-5 h-5 "
        />
        <span className="text-sm">{navItem.title}</span>
      </Link>
    ))}
  </div>
);

export default NavLinks;

import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FaCompass, FaCalendarAlt, FaQrcode, FaUser, FaShieldAlt } from "react-icons/fa";
import "./BottomNav.css";

const BottomNav = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const email = localStorage.getItem("wahap_user_email") || "";
      const isAdm =
        email.toLowerCase() === "admin@wahap.com" ||
        email.toLowerCase() === "admin@gmail.com";
      setIsAdmin(isAdm);
      setUserName(localStorage.getItem("wahap_temp_user"));
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [location.pathname]);

  // Hide bottom nav on full-screen map views
  const isMapScreen = location.pathname.includes("/map");
  if (isMapScreen) {
    return null;
  }

  const profilePath = isAdmin ? "/admin" : userName ? "/events" : "/signin";
  const profileLabel = isAdmin ? "Admin" : userName ? "Account" : "Sign In";

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive && location.pathname === "/" ? "active" : ""}`
        }
      >
        <div className="bottom-nav-icon-wrap">
          <FaCompass className="bottom-nav-icon" />
        </div>
        <span className="bottom-nav-label">Explore</span>
      </NavLink>

      <NavLink
        to="/events"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? "active" : ""}`
        }
      >
        <div className="bottom-nav-icon-wrap">
          <FaCalendarAlt className="bottom-nav-icon" />
        </div>
        <span className="bottom-nav-label">Events</span>
      </NavLink>

      <NavLink
        to="/scan-qr"
        className={({ isActive }) =>
          `bottom-nav-item qr-item ${isActive ? "active" : ""}`
        }
      >
        <div className="bottom-nav-icon-wrap qr-circle">
          <FaQrcode className="bottom-nav-icon qr-icon" />
        </div>
        <span className="bottom-nav-label">Scan QR</span>
      </NavLink>

      <NavLink
        to={profilePath}
        className={({ isActive }) =>
          `bottom-nav-item ${
            isActive ||
            (isAdmin && location.pathname.startsWith("/admin")) ||
            (!userName && (location.pathname === "/signin" || location.pathname === "/signup"))
              ? "active"
              : ""
          }`
        }
      >
        <div className="bottom-nav-icon-wrap">
          {isAdmin ? (
            <FaShieldAlt className="bottom-nav-icon admin-icon" />
          ) : (
            <FaUser className="bottom-nav-icon" />
          )}
        </div>
        <span className="bottom-nav-label">{profileLabel}</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;

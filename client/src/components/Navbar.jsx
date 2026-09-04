import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaQrcode,
  FaSignInAlt,
  FaChevronDown
} from "react-icons/fa";
import API_URL from "../config";
import "./Navbar.css";

const CITIES = ["Hyderabad", "Mumbai", "Delhi", "Bangalore"];

function Navbar() {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // CHECK AUTH STATUS ON MOUNT AND LISTEN FOR CHANGES
  useEffect(() => {
    const checkAuthStatus = () => {
      const user = localStorage.getItem("wahap_temp_user");
      setIsLoggedIn(!!user);
      setUserName(user || "");
    };

    checkAuthStatus();

    // Listen for auth changes from SignIn page
    window.addEventListener("wahap_auth_change", checkAuthStatus);
    return () => window.removeEventListener("wahap_auth_change", checkAuthStatus);
  }, []);

  // CLOSE DROPDOWN
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // SEARCH
  const handleSearch = (e) => {
    e.preventDefault();
  };

  // Real-time search as user types
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim()) {
      navigate(`/events?query=${value}`);
    } else {
      navigate("/events");
    }
  };

  // 🔥 AUTO LOCATION (FIXED)
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(`${API_URL}/api/location/reverse?lat=${lat}&lng=${lng}`);

          const data = await res.json();

          if (data.city) {
            setSelectedCity(data.city);
            navigate(`/events?city=${data.city}`);
          } else {
            alert("Select location manually");
          }
        } catch (err) {
          console.error(err);
          alert("Error detecting location");
        }

        setIsDetecting(false);
        setIsDropdownOpen(false);
      },
      () => {
        alert("Location permission denied");
        setIsDetecting(false);
      }
    );
  };

  // LOGOUT HANDLER
  const handleLogout = () => {
    localStorage.removeItem("wahap_temp_user");
    localStorage.removeItem("wahap_user_email");
    localStorage.removeItem("wahap_user_picture");
    setIsLoggedIn(false);
    setUserName("");
    setIsUserMenuOpen(false);
    window.dispatchEvent(new Event("wahap_auth_change"));
    navigate("/");
  };

  // MANAGE PROFILE HANDLER
  const handleManageProfile = () => {
    setIsUserMenuOpen(false);
    navigate("/profile"); // Navigate to profile page (you can update this route)
  };

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <Link to="/" className="logo">WAHAP</Link>
      </div>

      {/* CENTER */}
      <form className="nav-search" onSubmit={handleSearch}>
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={handleSearchChange}
        />
      </form>

      {/* RIGHT */}
      <div className="nav-right">
        {/* LOCATION */}
        <div className="location-box" ref={dropdownRef}>
          <div
            className="location-display"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <FaMapMarkerAlt />
            <span>{selectedCity}</span>
            <FaChevronDown />
          </div>

          {isDropdownOpen && (
            <div className="location-dropdown">
              <div className="dropdown-item" onClick={detectLocation}>
                {isDetecting ? "Detecting..." : "📍 Use My Location"}
              </div>

              {CITIES.map((city) => (
                <div
                  key={city}
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedCity(city);
                    setIsDropdownOpen(false);
                  }}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QR BUTTON - ONLY VISIBLE WHEN LOGGED IN */}
        {isLoggedIn && (
          <button className="qr-btn" onClick={() => navigate("/scan-qr")}>
            <FaQrcode /> Scan QR
          </button>
        )}

        {/* USER PROFILE OR SIGN IN */}
        {isLoggedIn ? (
          <div className="user-menu" ref={userMenuRef}>
            <button 
              className="signin-btn user-name-btn"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              {userName}
            </button>
            {isUserMenuOpen && (
              <div className="user-dropdown">
                <button className="dropdown-item" onClick={handleManageProfile}>
                  Manage Profile
                </button>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="signin-btn" onClick={() => navigate("/signin")}>
            <FaSignInAlt /> Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
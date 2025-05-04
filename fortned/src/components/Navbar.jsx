// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            AppointMate
          </Link>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <NavLink to="/" isActive={isActive("/")}>
              Home
            </NavLink>
            <NavLink to="/book" isActive={isActive("/book")}>
              Book
            </NavLink>
            <NavLink to="/cancel" isActive={isActive("/cancel")}>
              Cancel
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink
                  to="/vendor/dashboard"
                  isActive={isActive("/vendor/dashboard")}
                >
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full bg-white text-blue-700 font-semibold shadow hover:bg-gray-100 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/vendor/login"
                  isActive={isActive("/vendor/login")}
                >
                  Login
                </NavLink>
                <NavLink
                  to="#pricing"
                  isActive={false}
                  className="bg-white text-blue-700 shadow hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("pricing")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Become a Vendor
                </NavLink>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 border-t border-blue-400 pt-4">
            <div className="flex flex-col gap-2">
              <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>
                Home
              </MobileNavLink>
              <MobileNavLink to="/book" onClick={() => setIsMenuOpen(false)}>
                Book Appointment
              </MobileNavLink>
              <MobileNavLink to="/cancel" onClick={() => setIsMenuOpen(false)}>
                Cancel Booking
              </MobileNavLink>

              {isAuthenticated ? (
                <>
                  <MobileNavLink
                    to="/vendor/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </MobileNavLink>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded-full bg-white text-blue-700 shadow font-semibold hover:bg-gray-100 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink
                    to="/vendor/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </MobileNavLink>
                  <MobileNavLink
                    to="#pricing"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById("pricing")
                        ?.scrollIntoView({ behavior: "smooth" });
                      setIsMenuOpen(false);
                    }}
                  >
                    Become a Vendor
                  </MobileNavLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Pill-style NavLink for Desktop
const NavLink = ({ to, children, isActive, className = "", onClick }) => (
  <Link
    to={to}
    className={`px-4 py-2 rounded-full transition duration-200 font-medium ${
      isActive
        ? "bg-white text-blue-700 shadow"
        : "hover:bg-white hover:text-blue-700 hover:shadow-md"
    } ${className}`}
    onClick={onClick}
  >
    {children}
  </Link>
);

// Pill-style NavLink for Mobile
const MobileNavLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    className="px-4 py-2 rounded-full bg-white text-blue-700 shadow font-medium text-center hover:bg-gray-100 transition"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navbar;

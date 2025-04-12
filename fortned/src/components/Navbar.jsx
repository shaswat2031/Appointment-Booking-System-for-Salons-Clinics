// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">
            <Link to="/" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>AppointMate</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" isActive={isActive('/')}>Home</NavLink>
            <NavLink to="/book" isActive={isActive('/book')}>Book</NavLink>
            <NavLink to="/check-status" isActive={isActive('/check-status')}>Check Status</NavLink>
            <NavLink to="/cancel" isActive={isActive('/cancel')}>Cancel</NavLink>
            
            {isAuthenticated ? (
              <>
                <NavLink to="/vendor/dashboard" isActive={isActive('/vendor/dashboard')}>Dashboard</NavLink>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/vendor/login" isActive={isActive('/vendor/login')}>
                  Vendor Login
                </NavLink>
                <NavLink 
                  to="/vendor/register" 
                  isActive={isActive('/vendor/register')}
                  className="ml-2 bg-white text-blue-600 hover:bg-gray-100"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-blue-500">
            <div className="flex flex-col space-y-2">
              <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</MobileNavLink>
              <MobileNavLink to="/book" onClick={() => setIsMenuOpen(false)}>Book Appointment</MobileNavLink>
              <MobileNavLink to="/check-status" onClick={() => setIsMenuOpen(false)}>Check Status</MobileNavLink>
              <MobileNavLink to="/cancel" onClick={() => setIsMenuOpen(false)}>Cancel Booking</MobileNavLink>
              
              {isAuthenticated ? (
                <>
                  <MobileNavLink to="/vendor/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</MobileNavLink>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left w-full px-4 py-2 hover:bg-blue-700 transition duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink to="/vendor/login" onClick={() => setIsMenuOpen(false)}>Vendor Login</MobileNavLink>
                  <MobileNavLink to="/vendor/register" onClick={() => setIsMenuOpen(false)}>Register</MobileNavLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Component for desktop navigation links
const NavLink = ({ to, children, isActive }) => (
  <Link 
    to={to} 
    className={`px-4 py-2 rounded transition duration-200 ${
      isActive ? 'bg-blue-700 font-medium' : 'hover:bg-blue-700'
    }`}
  >
    {children}
  </Link>
);

// Component for mobile navigation links
const MobileNavLink = ({ to, children, onClick }) => (
  <Link 
    to={to} 
    className="px-4 py-2 block hover:bg-blue-700 transition duration-200"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navbar;

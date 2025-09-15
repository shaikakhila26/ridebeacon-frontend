import { Link } from "react-router-dom";
import React, { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b shadow-sm fixed w-full top-0 left-0 z-50">
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
        <img src="/logo1.png" alt="RideBeacon Logo" className="h-12 w-20 " />
        </div>
        
        {/* Hamburger menu (visible on mobile) */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-yellow-600 hover:text-yellow-800 p-2 rounded focus:outline-none"
            aria-label="Open main menu"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              )}
            </svg>
          </button>
        </div>

        {/* Nav links (hidden on mobile) */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-yellow-600 font-semibold">Home</Link>
          <Link to="/about" className="text-gray-700 hover:text-yellow-600 font-semibold">About</Link>
          <Link to="/login" className="text-gray-700 hover:text-yellow-600 font-semibold">Login</Link>
        </div>
      </div>
      {/* Mobile menu (dropdown) */}
      {menuOpen && (
        <div className="md:hidden bg-white flex flex-col space-y-1 px-4 pb-3">
          <Link to="/" className="py-2 text-gray-700 hover:text-yellow-600 font-semibold" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" className="py-2 text-gray-700 hover:text-yellow-600 font-semibold" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/login" className="py-2 text-gray-700 hover:text-yellow-600 font-semibold" onClick={() => setMenuOpen(false)}>Login</Link>
        </div>
      )}
    </nav>
  );
}

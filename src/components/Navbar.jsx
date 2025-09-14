import { Link } from "react-router-dom";
import React from 'react';

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-black text-white fixed w-full z-50">
      {/* Logo + Text */}
      <div className="flex items-center gap-2">
        <img src="/logo1.png" alt="RideBeacon Logo" className="h-12 w-20 " />
        
      </div>

      {/* Navigation Links */}
      <ul className="hidden md:flex gap-8 items-center">
        <li>
          <a href="#home" className="hover:text-yellow-400">Home</a>
        </li>
        <li>
          <a href="#about" className="hover:text-yellow-400">About</a>
        </li>
        <li>
          <Link to="/login">
            <button className="px-4 py-2 bg-yellow-400 text-black rounded-full font-semibold hover:bg-yellow-300">
              Login
            </button>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

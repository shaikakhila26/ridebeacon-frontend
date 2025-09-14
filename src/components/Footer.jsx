import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";
import React from 'react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-black text-white pt-12 pb-6 px-6">
      {/* Contact Info */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h2 className="text-xl font-bold text-yellow-400 mb-4">RideBeacon</h2>
          <p className="text-sm text-gray-400">
            Your trusted ride partner — safe, fast, and reliable. Available anytime, anywhere.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
          <p className="flex items-center justify-center md:justify-start gap-2 text-gray-300 mb-2">
          
          </p>
          <p className="flex items-center justify-center md:justify-start gap-2 text-gray-300 mb-2">
            <Mail size={18} className="text-yellow-400" /> support@ridebeacon.com
          </p>
          <p className="flex items-center justify-center md:justify-start gap-2 text-gray-300">
            <MapPin size={18} className="text-yellow-400" /> Hyderabad, India
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
          <div className="flex justify-center md:justify-start gap-4">
            <a href="#" className="p-2 rounded-full bg-yellow-400 text-black hover:bg-yellow-300">
              <Facebook size={20} />
            </a>
            <a href="#" className="p-2 rounded-full bg-yellow-400 text-black hover:bg-yellow-300">
              <Twitter size={20} />
            </a>
            <a href="#" className="p-2 rounded-full bg-yellow-400 text-black hover:bg-yellow-300">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} RideBeacon. All rights reserved.
      </div>
    </footer>
  );
}

import { Home, Gift, Clock, MapPin } from "lucide-react";
import React from 'react';

export default function Benefits() {
  const benefits = [
    { icon: <Home size={32} />, title: "Home Pickup", desc: "We run door pickup for better convenience." },
    { icon: <Gift size={32} />, title: "Bonuses for Ride", desc: "Earn bonuses when you ride frequently." },
    { icon: <Clock size={32} />, title: "Fast Booking", desc: "Book rides instantly without stress." },
    { icon: <MapPin size={32} />, title: "GPS Searching", desc: "Track your ride with GPS in real-time." }
  ];

  return (
    <section className="bg-yellow-400 py-16 px-6 text-center">
      <h2 className="text-2xl font-bold mb-12">Some Benefits</h2>
      <div className="grid md:grid-cols-4 gap-8">
        {benefits.map((b, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow flex flex-col items-center">
            {b.icon}
            <h3 className="font-semibold mt-4 mb-2">{b.title}</h3>
            <p className="text-sm">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

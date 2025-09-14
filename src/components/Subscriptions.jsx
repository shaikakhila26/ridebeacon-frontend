import React from 'react';


export default function Subscriptions() {
  const items = [
    { title: "Within the City", desc: "We run services within the city to any destination you want.", color: "bg-yellow-400" },
    { title: "Within the State", desc: "We run services within the state to any destination you want.", color: "bg-yellow-400" },
    { title: "Within the Country", desc: "We run services within the country to any destination you want.", color: "bg-yellow-400" }
  ];

  return (
    <section id="about" className="py-16 bg-black text-center text-white">
      <h2 className="text-2xl font-bold mb-12">Our Subscriptions</h2>
      <div className="grid md:grid-cols-3 gap-6 px-6">
        {items.map((item, i) => (
          <div key={i} className={`p-6 rounded-xl shadow ${item.color}`}>
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-sm mb-4">{item.desc}</p>
            <button className="px-4 py-2 bg-black text-white rounded">Read More</button>
          </div>
        ))}
      </div>
    </section>
  );
}



import React, { useEffect, useState } from "react";
import axios from "axios";
import { useToasts } from "../components/Toasts";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { FaArrowRight } from "react-icons/fa";



const API_URL = import.meta.env.VITE_API_URL;

export default function DriverTripHistoryPage() {
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast, ToastContainer } = useToasts();
  const navigate = useNavigate();



  useEffect(() => {
   async function fetchRideHistory() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        addToast("Login required", { type: "error" });
        navigate("/login");
        return;
      }
      setLoading(true);
      try {
        const token = session?.access_token;
        const res = await axios.get(`${API_URL}/api/rides/history`, {
          params: { userId: session.user.id, role: "driver" },
           headers: { Authorization: `Bearer ${token}` }
        });
        setRideHistory(res.data);
      } catch {
        addToast("Failed to load trip history", { type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchRideHistory();
  }, [navigate, addToast]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #ffe259 0%, #ffa751 100%)",
        minHeight: "100vh",
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-lg px-8 py-12 mt-12 mb-12"
        style={{
          background: "rgba(20,20,15,0.90)",
        }}
      >
        <h1 className="text-2xl font-extrabold mb-6 text-center text-white tracking-tight font-['Montserrat',sans-serif]">
          Trip History
        </h1>
        {loading ? (
          <p className="text-center text-white">Loading...</p>
        ) : rideHistory.length === 0 ? (
          <p className="text-white text-center">No trips found.</p>
        ) : (
          <ul>
            {rideHistory.map((ride) => (
              <li
                key={ride.id}
                className="flex justify-between items-center py-2 px-3 mb-2 bg-black/80 hover:bg-yellow-400/70 hover:text-black text-white cursor-pointer rounded transition-colors group"
                style={{
                  minHeight: "55px",
                  fontSize: "1rem",
                  lineHeight: 1.2,
                }}
                onClick={() => navigate(`/driver/trips/${ride.id}`)}
              >
                <div>
                  <div className="flex items-center font-semibold text-base">
                    <span>{ride.pickup}</span>
                    <FaArrowRight className="mx-2 group-hover:text-black text-yellow-400 text-sm" />
                    <span>{ride.dropoff}</span>
                  </div>
                  <div className="text-xs text-yellow-100 mt-0.5 group-hover:text-black/60">
                    {new Date(ride.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right min-w-[70px]">
                  <div className="font-bold text-yellow-400 group-hover:text-black text-lg">
                    ₹{ride.fare.toFixed(2)}
                  </div>
                  <span
                    className={`text-xs font-bold tracking-wide ${
                      ride.status === "completed"
                        ? "text-green-400 group-hover:text-green-700"
                        : ride.status === "cancelled"
                        ? "text-red-400 group-hover:text-red-600"
                        : "text-yellow-200 group-hover:text-black"
                    }`}
                  >
                    {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {ToastContainer}
    </div>
  );
}

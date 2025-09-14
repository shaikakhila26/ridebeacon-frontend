import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaPhoneAlt, FaUserCircle,FaEnvelope } from "react-icons/fa";
import axios from "axios";
import { supabase } from "../lib/supabaseClient";
const API_URL = import.meta.env.VITE_API_URL;



export default function DriverTripDetailPage() {
  const { id } = useParams();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


useEffect(() => {

    if (!id) return;



    async function fetchRide() {

      setLoading(true);

      try {

        const { data: { session } } = await supabase.auth.getSession();

        const token = session?.access_token;



        const res = await axios.get(`${API_URL}/api/rides/${id}`, {

          headers: { Authorization: `Bearer ${token}` }

        });

        setRide(res.data);

      } catch (err) {

        console.error("Failed to fetch ride detail", err);

        setRide(null);

      } finally {

        setLoading(false);

      }

    }



    fetchRide();

  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!ride) return <p className="p-6">Trip not found.</p>;

   return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-stone-100 py-10 flex justify-center items-start">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-100 p-6">
          <button
            className="text-blue-500 font-bold mb-4"
            onClick={() => navigate(-1)}
          >
            &larr; Back
          </button>
          <h2 className="text-2xl font-extrabold tracking-tight mb-1 text-gray-900">
            {ride.pickup} <span className="text-yellow-600">→</span> {ride.dropoff}
          </h2>
          <div className="text-sm text-gray-600">
            {new Date(ride.created_at).toLocaleString()}
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-6">
            {ride.rider?.profile_pic ? (
              <img
                src={ride.rider.profile_pic}
                alt="Rider avatar"
                className="w-14 h-14 rounded-full object-cover border-2 border-yellow-300 mr-4"
              />
            ) : (
              <FaUserCircle className="text-4xl text-gray-400 mr-4" />
            )}
            <div>
              <div className="font-semibold text-gray-800">
                Rider: {ride.rider?.full_name || "N/A"}
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <FaPhoneAlt className="mr-1" />
                {ride.rider?.phone || "No phone"}
              </div>
              {/* Email if available */}
              {ride.rider?.email && (
                <div className="flex items-center text-gray-500 mt-1 text-sm">
                  <FaEnvelope className="mr-2 text-yellow-500" />
                  <span className="break-all">{ride.rider.email}</span>
                </div>
              )}
            </div>
          </div>

          

          <div className="flex justify-between items-center my-6">
            <div>
              <div className="font-medium text-gray-600 text-sm">Fare</div>
              <div className="text-2xl font-extrabold text-green-700">
                ₹{ride.fare?.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-600 text-sm">Status</div>
              <div className={`text-base font-bold ${
                ride.status === "completed"
                  ? "text-green-600"
                  : ride.status === "cancelled"
                  ? "text-red-600"
                  : "text-yellow-700"
              }`}>
                {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
              </div>
            </div>
          </div>
          {/* Add more info as needed, ex: payment method, driver details, etc */}
        </div>
      </div>
    </div>
  );
}
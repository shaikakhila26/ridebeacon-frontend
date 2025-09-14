import React, { useEffect, useState } from "react";
import axios from "axios";
import {supabase} from "../lib/supabaseClient";
const API_URL = import.meta.env.VITE_API_URL;




export  function DriverAverageRating({ driverId }) {
  const [avgRating, setAvgRating] = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    if (!driverId) return;
    async function fetchRating() {

      setLoading(true);

      try {

        const { data: { session } } = await supabase.auth.getSession();

        const token = session?.access_token;

        const res = await axios.get(

          `${API_URL}/api/reviews/drivers/${driverId}/reviews`,

          { headers: { Authorization: `Bearer ${token}` } }

        );

        setAvgRating(res.data.average_rating);

      } catch {

        setAvgRating(null);

      } finally {

        setLoading(false);

      }

    }



    fetchRating();

  }, [driverId]);



  return (

    <div>

      <h3 className="font-semibold mb-1">Average Rating</h3>

      {loading

        ? "Loading..."

        : avgRating

        ? <span className="text-lg font-bold text-yellow-500">{avgRating} ★</span>

        : <span className="text-gray-500">No rating yet</span>

      }

    </div>

  );

}


import React, { useState } from "react";
import axios from "axios";
import {supabase} from "../lib/supabaseClient";
const API_URL = import.meta.env.VITE_API_URL;




export default function RateDriverModal({ ride, riderId, onClose, onRated }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);


  const submitRating = async () => {
    if (rating < 1) {
         alert("please provide a rating");
         return;
    }

    if (!ride || !ride.id || !ride.driver || !ride.driver.id) {
    alert("Invalid ride or driver data.");
    return;
  }
    setLoading(true);
    try {
          const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
      await axios.post(`${API_URL}/api/reviews`, {
        ride_id: ride.id,
        driver_id: ride.driver.id,
        rider_id: riderId,
        rating,
        review,
      },
   { headers: { Authorization: `Bearer ${token}` } }
    );

      console.log('Submitting rating:', {
  ride_id: ride.id,
  driver_id: ride?.driver?.id,
  rider_id: riderId,
  rating,
  review,
});

      if (onRated) onRated(rating);
      onClose();
    } catch (err) {
        console.error("submit rating error:",err.response?.data || err.message);
      alert("Failed to submit rating." + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow max-w-sm w-full">
        <h3 className="font-semibold mb-4 text-xl">Rate your Driver</h3>
        <div className="mb-3 flex">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              type="button"
              className={`text-3xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
              onClick={() => setRating(star)}
              disabled={loading}
            >★</button>
          ))}
        </div>
        <textarea
          value={review}
          onChange={e => setReview(e.target.value)}
          rows={3}
          className="w-full p-2 border rounded mb-4"
          placeholder="Share your experience "
          disabled={loading}
        />
        <div className="flex gap-3">
          <button
            className="bg-yellow-500 text-white rounded px-4 py-2 font-bold"
            disabled={loading || rating === 0}
            onClick={submitRating}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          <button
            className="border rounded px-4 py-2"
            onClick={onClose}
            disabled={loading}
          >Cancel</button>
        </div>
      </div>
    </div>
  );
}

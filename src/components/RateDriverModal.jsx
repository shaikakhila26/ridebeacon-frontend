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

      onRated(rating);
    } catch (err) {
      console.error("Failed to submit rating:", err.response?.data?.error || err.message);
      alert("Failed to submit rating: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full relative flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-3xl font-light"
          aria-label="Close modal"
        >&times;</button>
        
        <h3 className="font-semibold text-2xl mb-2 text-gray-800 text-center">Rate Your Ride</h3>
        <p className="text-gray-600 mb-4 text-center">How was your experience with {ride?.driver?.full_name || 'your driver'}?</p>

        <div className="flex-1 overflow-y-auto flex flex-col items-center">
          <div className="mb-6 flex space-x-2">
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                type="button"
                className={`text-4xl transition-colors ${star <= rating ? "text-yellow-400" : "text-gray-300"} hover:scale-110 transform`}
                onClick={() => setRating(star)}
                disabled={loading}
              >★</button>
            ))}
          </div>
          <textarea
            value={review}
            onChange={e => setReview(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Share your experience (optional)"
            disabled={loading}
          />
        </div>
        
        <div className="w-full flex flex-col sm:flex-row gap-3 mt-4">
          <button
            className="w-full bg-yellow-500 text-white rounded-lg px-4 py-3 font-bold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || rating === 0}
            onClick={submitRating}
          >
            {loading ? "Submitting..." : "Submit Rating"}
          </button>
          <button
            className="w-full text-gray-600 font-bold px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useToasts } from "./Toasts";
import {supabase} from "../lib/supabaseClient";



export default function DriverReviews({ driverId, riderId }) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToasts();

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch reviews and average rating for driver
  useEffect(() => {
    async function fetchReviews() {
      try {
        
  const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
        const res = await axios.get(`${API_URL}/api/reviews/drivers/${driverId}/reviews`,{
            headers: { Authorization: `Bearer ${token}`}
        });
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.average_rating);
      } catch (err) {
        addToast("Failed to load driver reviews", { type: "error" });
      }
    }
    if (driverId) fetchReviews();
  }, [driverId, addToast]);

  // Submit new review for driver for a specific ride
  const submitReview = async () => {
    if (rating < 1 || rating > 5) {
      addToast("Please select a rating between 1 and 5", { type: "error" });
      return;
    }
    setLoading(true);
    try {
        
  const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
      // You need to supply ride_id to this component as well in a real app
      // For demo, riderId and driverId suffice; ideally use ride_id for uniqueness
      await axios.post(`${API_URL}/api/reviews`, {
        ride_id: null, // TODO: pass correct rideId here
        driver_id: driverId,
        rider_id: riderId,
        rating,
        review: reviewText,
      },
      {headers: {Authorization: `Bearer ${token}`}}
        
      );
      addToast("Review submitted!", { type: "success" });
      setReviewText("");
      setRating(0);
      // Refresh reviews after submitting
      const res = await axios.get(`${API_URL}/api/reviews/drivers/${driverId}/reviews`,{
        headers: { Authorization: `Bearer ${token}`}
      });
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.average_rating);
    } catch (err) {
      addToast("Failed to submit review", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md mt-6">
      <h3 className="text-xl font-semibold mb-2">
        Driver Reviews {avgRating && <span>({avgRating} ★)</span>}
      </h3>

      {/* Review List */}
      {reviews.length === 0 && <p>No reviews yet.</p>}
      <ul className="space-y-3 mb-4 max-h-48 overflow-auto">
        {reviews.map((rev) => (
          <li key={rev.id} className="border-b pb-2">
            <strong>{rev.rider.full_name || "Anonymous"}</strong> -{" "}
            <span>{rev.rating} ★</span>
            <p>{rev.review || <em>No feedback</em>}</p>
            <small>{new Date(rev.created_at).toLocaleDateString()}</small>
          </li>
        ))}
      </ul>

      {/* Submit Review */}
      <div>
        <label className="block font-semibold mb-1">Your Rating (1-5):</label>
        <div className="mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className={`inline-block mr-1 ${
                star <= rating ? "text-yellow-400" : "text-gray-400"
              } text-2xl`}
              onClick={() => setRating(star)}
              disabled={loading}
            >
              ★
            </button>
          ))}
        </div>

        <label className="block font-semibold mb-1">Write a review (optional):</label>
        <textarea
          rows={3}
          className="w-full border rounded p-2 mb-2"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Describe your experience"
          disabled={loading}
        />

        <button
          onClick={submitReview}
          disabled={loading}
          className="bg-yellow-500 text-white rounded px-4 py-2 hover:bg-yellow-600 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}

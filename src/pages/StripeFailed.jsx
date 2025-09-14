import { useNavigate } from "react-router-dom";
import React from 'react';

export default function StripeFailed() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Connection Failed</h1>
      <p className="text-gray-600 mb-6">
        We couldn’t complete your Stripe onboarding. Please try again.
      </p>
      <button
        onClick={() => navigate("/driver/dashboard")}
        className="px-5 py-3 bg-yellow-500 text-black font-bold rounded-xl"
      >
        Back to Dashboard
      </button>
    </div>
  );
}

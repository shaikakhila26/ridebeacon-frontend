import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {supabase} from "../lib/supabaseClient";

// Load your Stripe public key from env
const stripePromise = loadStripe(import.meta.env.VITE_APP_STRIPE_KEY);


function CheckoutForm({ clientSecret, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      setProcessing(false);
      return;
    }

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href, // stays on page, webhook confirms payment
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <PaymentElement />
      {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="mt-6 w-full bg-yellow-500 text-white font-bold p-3 rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? "Processing..." : "Pay now"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={processing}
        className="mt-2 w-full text-gray-600 font-bold p-3 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
    </form>
  );
}


const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function PaymentModal({ amount, rideId, riderId, onClose, onPaymentSuccess }) {
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    async function fetchClientSecret() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Authentication token not found.");
        
        const response = await fetch(`${API_BASE_URL}/api/create-payment-intent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ amount, rideId, riderId }),
        });
        
        const data = await response.json();
        
        if (!data.clientSecret) {
          throw new Error("Missing clientSecret in response");
        }
        setClientSecret(data.clientSecret);
      } catch (err) {
        alert("Failed to initiate payment." + err.message);
        onClose();
      }
    }
    fetchClientSecret();
  }, [amount, rideId, riderId, onClose, API_BASE_URL]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full relative flex flex-col min-h-[400px]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-3xl font-light"
          aria-label="Close payment modal"
        >&times;</button>
        
        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Pay Your Fare</h2>
          <div className="mb-6 text-lg text-green-600 font-semibold">
            Total: ₹{amount.toFixed(2)}
          </div>
          {clientSecret ? (
            <Elements options={{ clientSecret }} stripe={stripePromise}>
              <CheckoutForm clientSecret={clientSecret} onSuccess={onPaymentSuccess} onCancel={onClose} />
            </Elements>
          ) : (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading Payment Form...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
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
    <form onSubmit={handleSubmit} className=" flex flex-col space-y-4  h-full">
      <PaymentElement />
      {errorMessage && <div className="text-red-600">{errorMessage}</div>}
      <div className="flex justify-between mt-auto">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 px-4 py-2 rounded font-bold"
        >
          {processing ? "Processing..." : "Pay Fare"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled = {processing}
          className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function PaymentModal({amount, rideId, riderId, onClose, onPaymentSuccess }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [displayAmount ,setDisplayAmount] = useState(amount);
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    async function fetchClientSecret() {
      try {

        //for testing only
       // const testAmount =50 ;
        setDisplayAmount(amount);
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const res = await fetch(`${API_BASE_URL}/api/payments/intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" ,
           Authorization:`Bearer ${token}`
          },
          body: JSON.stringify({ amount, ride_id: rideId, rider_id: riderId }),
        });
        if (!res.ok) {

          throw new Error(`Failed to initiate payment: ${res.statusText}`);

        }
        const data = await res.json();
        if (!data.clientSecret) {

          throw new Error("Missing clientSecret in response");

        }
        setClientSecret(data.clientSecret);
      } catch (err) {
        alert("Failed to initiate payment."+err.message);
        onClose();
      }
    }
    fetchClientSecret();
  }, [amount, rideId, riderId, onClose,API_BASE_URL]);

  if (!clientSecret) return <div className="p-4">Loading Payment Form...</div>;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
  <div 
    className="bg-white rounded-xl p-8 shadow max-w-md w-full relative flex flex-col"
    style={{
      maxHeight: '90vh',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between', // Add this
  paddingBottom: '1rem' // give space for buttons
    }}
  >
    <button
      onClick={onClose}
      className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
      aria-label="Close payment modal"
    >&times;</button>
    <h2 className="text-xl font-bold mb-2">Pay Your Fare</h2>
    <div className="mb-6 text-lg text-green-600 font-semibold">₹{displayAmount}</div>
    <div style={{ flexGrow: 1, overflowY: 'auto' }}>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm
          clientSecret={clientSecret}
          onSuccess={onPaymentSuccess}
          onCancel={onClose}
        />
      </Elements>
    </div>
  </div>
</div>

  );
}
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useToasts } from "../components/Toasts";

export default function StripeSuccess() {
  const navigate = useNavigate();
  const { addToast } = useToasts();

  useEffect(() => {
    const refreshDriver = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        addToast("You need to log in again.", { type: "error" });
        navigate("/");
        return;
      }
      // Refetch user from DB to update stripe_account_id
      await supabase.from("users").select("*").eq("id", session.user.id).single();
      addToast("Stripe account connected successfully!", { type: "success" });
      navigate("/driver/dashboard"); // redirect back to dashboard
    };
    refreshDriver();
  }, [navigate, addToast]);

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Stripe Connected</h1>
      <p className="text-gray-600">You can now withdraw your earnings.</p>
    </div>
  );
}

import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useToasts } from "../components/Toasts";
import React from 'react';

export default function AuthCallback() {
  const navigate = useNavigate();
    const { addToast, ToastContainer } = useToasts();

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login");
        return;
      }

      const { data:userData, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error || !userData) {
        navigate("/login");
        return;
      }

     if (userData.role === "driver") {
    navigate("/driver-dashboard");
  } else {
    navigate("/rider-dashboard");
  }
    }

    checkUser();
  }, [navigate]);

  return <p>Redirecting...</p>;
}

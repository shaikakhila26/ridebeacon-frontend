import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useToasts } from "../components/Toasts";
import React from 'react';

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { addToast, ToastContainer } = useToasts();

  // Capture access_token from URL query params or hash
  useEffect(() => {
    let accessToken = null;
    const params = new URLSearchParams(window.location.search);
    accessToken = params.get("access_token");
    if (!accessToken && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      accessToken = hashParams.get("access_token");
    }
    console.log("Access Token:", accessToken);
    if (!accessToken) {
      addToast("Invalid or missing access token.", { type: "error" });
      navigate("/login");
    }
  }, []);

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      addToast("Please fill in all fields.", { type: "error" });
      return;
    }
    if (password !== confirmPassword) {
      addToast("Passwords do not match.", { type: "error" });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
      addToast(error.message, { type: "error" });
    } else {
      addToast("Password updated successfully. Please login.", { type: "success" });
      navigate("/login");
    }

    setLoading(false);
  };

  const EyeIcon = ({ open }) => (
    open ? (
      // Eye Open icon SVG
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ) : (
      // Eye Closed icon SVG
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.043-3.362m3.708-2.401A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.958 9.958 0 01-4.042 5.362M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
      </svg>
    )
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-yellow-100 via-yellow-300 to-yellow-500 px-4">
      <div className="bg-black/70 backdrop-blur-2xl rounded-2xl shadow-xl px-8 py-10 max-w-md w-full">
        <h2 className="text-3xl font-extrabold text-white mb-8 text-center tracking-tight drop-shadow-md">
          Reset Password
        </h2>

        <div className="space-y-6">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-gray-600 text-white placeholder-gray-300 focus:outline-none focus:border-yellow-400 transition pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              tabIndex={-1}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-gray-600 text-white placeholder-gray-300 focus:outline-none focus:border-yellow-400 transition pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              tabIndex={-1}
            >
              <EyeIcon open={showConfirmPassword} />
            </button>
          </div>

          <button
            onClick={handleUpdatePassword}
            disabled={loading}
            className="w-full py-3 font-bold text-black text-lg rounded shadow transition-all bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-400 tracking-wide drop-shadow-lg"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
      {ToastContainer}
    </div>
  );
}

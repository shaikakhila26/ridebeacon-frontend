import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { useToasts } from "../components/Toasts";
import React from 'react';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { addToast, ToastContainer } = useToasts();
  const [notifications, setNotifications] = useState([]);

  // Auth handlers
  const handleLogin = async () => {
  setLoading(true);
  const { error: signInError, data: session } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    addToast(signInError.message, { type: 'error' });
    setLoading(false);
    return;
  }

  // Explicitly get current session after login
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) {
    addToast("Failed to get user session after login.", { type: "error" });
    setLoading(false);
    return;
  }

  // Fetch user role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (userError) {
   addToast(userError.message, { type: 'error' });
    setLoading(false);
    return;
  }

  // Redirect based on role
  if (userData.role === 'driver') navigate('/driver-dashboard');
  else navigate('/rider-dashboard');

  setLoading(false);
};


  const handleGoogleLogin = async () => {
    const { data,error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://ridebeacon-frontend.vercel.app/auth/callback" },
    });
    if (error){
       addToast(error.message, { type: 'error' });
    return;
    }

    // Wait for redirect to complete and get session
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return;

  // Check if user exists in users table
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!existingUser) {
    // Insert user with default role = rider
    await supabase.from("users").insert({
      id: user.id,
      full_name: user.user_metadata.full_name || user.email,
      role: "rider",
    });
  }

  // Fetch role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // Redirect based on role
  if (userData.role === "driver") navigate("/driver-dashboard");
  else navigate("/rider-dashboard");
  };

  const handleForgotPassword = async () => {
  if (!email) {
    addToast('Please enter your email first.', { type: 'error' });
    return;
  }
  setLoading(true);
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://ridebeacon-frontend.vercel.app//update-password", // your password reset page route
  });
  if (error) {
    addToast(error.message, { type: 'error' });
  } else {
    addToast('Password reset email sent. Please check your inbox.', { type: 'success' });
  }
  setLoading(false);
};


  return (
    <>
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-tr from-yellow-100 via-yellow-300 to-yellow-500 overflow-hidden px-4">
      {/* Background blobs */}
      <div className="absolute top-[-90px] left-[-120px] w-[420px] h-[420px] rounded-[50px] bg-gradient-to-br from-yellow-400/60 via-yellow-300/60 to-yellow-100/40 rotate-[-15deg] shadow-2xl blur-[2px]" />
      <div className="absolute top-[36px] left-36 w-44 h-44 bg-gradient-to-br from-yellow-300 to-yellow-100 opacity-40 rotate-45 rounded-[35px] blur-[1px]" />
      <div className="absolute bottom-16 right-16 w-52 h-52 bg-gradient-to-tr from-yellow-400 via-yellow-200 to-yellow-50 opacity-20 rounded-full blur-xl" />
      <div className="absolute bottom-[-60px] left-32 w-64 h-28 bg-gradient-to-l from-yellow-400/30 via-yellow-200/20 to-yellow-100/10 opacity-50 rounded-b-full blur-2xl" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-black/70 backdrop-blur-2xl rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-white mb-8 text-center tracking-tight drop-shadow-md">
          User Login
        </h2>

        {/* Input Fields */}
        <div className="space-y-5 w-full max-w-md">
          {/* Email */}
          <div className="flex items-center bg-white/10 rounded-md px-3 py-2 shadow border border-gray-600 focus-within:border-yellow-400 transition">
            <span className="text-yellow-400 opacity-80">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border-none outline-none px-3 text-white font-medium placeholder-gray-300"
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div className="flex items-center bg-white/10 rounded-md px-3 py-2 shadow border border-gray-600 focus-within:border-yellow-400 transition relative">
            <span className="text-yellow-400 opacity-80">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="6" y="10" width="12" height="10" rx="2" />
                <path d="M12 16v2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" />
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border-none outline-none px-3 text-white font-medium placeholder-gray-300"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-gray-300 hover:text-yellow-400 transition"
            >
              {showPassword ? (
                // Eye Open
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                // Eye Closed
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.043-3.362m3.708-2.401A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.958 9.958 0 01-4.042 5.362M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="text-sm text-yellow-300 hover:text-yellow-500 cursor-pointer mt-2" onClick={handleForgotPassword}>
  Forgot Password?
</div>


        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-8 w-full max-w-md py-2 font-bold text-black text-lg rounded shadow transition-all
          bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-400
          tracking-wide drop-shadow-lg"
        >
          {loading ? "Logging in..." : "LOGIN"}
        </button>

        {/* Divider */}
        <div className="flex items-center justify-between mb-4 mt-6 w-full max-w-md">
          <hr className="w-full border-gray-700" />
          <span className="px-4 text-gray-400 text-sm">Or</span>
          <hr className="w-full border-gray-700" />
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-2 w-full max-w-md bg-white/90 border border-yellow-300 shadow rounded-md py-2 mb-3 font-semibold text-black hover:border-yellow-500 transition"
        >
          <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-5 h-5" />
          <span>Login with Google</span>
        </button>

        {/* Signup Link */}
        <div className="mt-2 text-gray-300 text-xs text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="ml-1 underline hover:text-yellow-400 transition">
            Create Your Account →
          </Link>
        </div>
      </div>
    </div>
    <div className="fixed top-4 right-4 space-y-2 z-50">
  {notifications.map((n) => (
    <div key={n.id} className="bg-white shadow-md border rounded-lg p-3 text-sm text-gray-800">
      {n.text}
    </div>
  ))}
</div>
{/* Toast notifications container */}
    {ToastContainer}
</>
  );
}

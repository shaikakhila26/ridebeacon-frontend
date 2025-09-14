import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import UpdatePassword from "./pages/UpdatePassword";
import AuthCallback from "./pages/AuthCallback";
import StripeSuccess from "./pages/StripeSuccess";
import StripeFailed from "./pages/StripeFailed";
import DriverTripHistoryPage from './pages/DriverTripHistoryPage';
import DriverTripDetailPage from './pages/DriverTripDetailPage';
import React from 'react';


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
           <Route path="/signup" element={<Signup />} />
           <Route path="/rider-dashboard" element={<UserDashboard />} />
            <Route path="/driver-dashboard" element={<DriverDashboard />} />
            <Route path="/driver/stripe/success" element={<StripeSuccess />} />
            <Route path="/driver/stripe/failed" element={<StripeFailed />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/driver/trips" element={<DriverTripHistoryPage />} />
            <Route path="/driver/trips/:id" element={<DriverTripDetailPage />} />
      </Routes>
    </Router>
  );
}

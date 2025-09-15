import React from "react";

// You can update the className below with your actual background/theme classes.
export default function About() {
  return (
    <div className="flex items-center min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-white px-4 py-8">
      <div className="w-full max-w-2xl mx-auto bg-white shadow-xl rounded-3xl p-8 border border-yellow-200">
        <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-500 mb-4 text-center drop-shadow-sm">
          About RideBeacon
        </h1>
        <p className="text-md md:text-lg text-gray-700 text-center mb-8">
          India's safest, smartest way to get around—whenever and wherever needed.
        </p>

        <div className="mb-8">
          <ul className="space-y-4">
            <li>
              <span className="font-semibold text-yellow-600">
                🚗 One-Tap Booking:
              </span>
              &nbsp;Enter your pick-up and drop-off, see your fare instantly, and book a ride in seconds.
            </li>
            <li>
              <span className="font-semibold text-yellow-600">
                📍 Real-Time Location &amp; Tracking:
              </span>
              &nbsp;Google Maps integration—track pickup, route and driver live.
            </li>
            <li>
              <span className="font-semibold text-yellow-600">
                🧑‍✈️ Roles for Riders &amp; Drivers:
              </span>
              &nbsp;Signup as a passenger or as a verified driver, each with custom dashboards and trip histories.
            </li>
            <li>
              <span className="font-semibold text-yellow-600">
                💳 Secure Online Payments:
              </span>
              &nbsp;Pay seamlessly with Stripe—get instant ride receipts in your email.
            </li>
            <li>
              <span className="font-semibold text-yellow-600">
                🗃️ Trip History &amp; Receipts:
              </span>
              &nbsp;Full account section with past trips, downloadable PDF receipts, and driver/rider profile management.
            </li>
            <li>
              <span className="font-semibold text-yellow-600">
                ⭐ Rate &amp; Review:
              </span>
              &nbsp;Give and receive feedback after every completed ride for a safer community.
            </li>
            <li>
              <span className="font-semibold text-yellow-600">
                📈 Driver Earnings Dashboard:
              </span>
              &nbsp;Detailed earnings for every registered driver.
            </li>
            <li>
              <span className="font-semibold text-yellow-600">
                ⛔ One-Click Ride Cancellation:
              </span>
              &nbsp;Easy cancellation and instant updates to drivers and riders, with full transparency.
            </li>
            <li>
              <span className="font-semibold text-yellow-600">
                🔒 Powered by Supabase:
              </span>
              &nbsp;Your account is secure with modern auth and privacy built-in.
            </li>
          </ul>
        </div>

        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 mb-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-600 mb-1">Our Mission</h2>
          <p className="text-gray-700">
            At RideBeacon, our vision is to empower everyday journeys—making travel safer, quicker, and more rewarding for everyone.
          </p>
        </div>

        <div className="text-center">
          <p className="text-md text-gray-600 mb-2">
            Ready to experience the next generation of ride-sharing?&nbsp;
            <Link
              to="/signup"
              className="inline-block font-medium text-yellow-700 hover:text-yellow-800 hover:underline px-2 py-1 rounded transition duration-200 bg-yellow-100 border border-yellow-200 shadow-sm"
            >
              Sign up and get started within seconds!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

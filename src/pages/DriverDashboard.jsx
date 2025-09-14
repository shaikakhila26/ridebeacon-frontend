import { useEffect, useState } from "react";
import axios from "axios";
import { supabase } from "../lib/supabaseClient";
import MapView from "../components/MapView";
import DriverProfile from "../components/DriverProfile";
import socket from "../lib/socket";
import { useToasts } from "../components/Toasts";
import { useNavigate } from "react-router-dom";



const API_URL = import.meta.env.VITE_API_URL;

export default function DriverDashboard() {
  const [driver, setDriver] = useState(null);
  const [rides, setRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [loadingDriver, setLoadingDriver] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false); // 🔹 availability toggle
  const [mapCenter, setMapCenter] = useState(null); // 🔹 new state for map center
  const { addToast, removeToast, ToastContainer } = useToasts();
   const [notifications, setNotifications] = useState([]);
const navigate = useNavigate();
const [earnings,setEarnings] = useState(0);
const [rideHistory, setRideHistory] = useState([]);
const [loadingHistory, setLoadingHistory] = useState(false);


  // Fetch driver profile
  useEffect(() => {
    async function getDriver() {
      setLoadingDriver(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
       addToast("Driver not logged in!", { type: "error" });
        setLoadingDriver(false);
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

        console.log("fetched driver:",data);
      setDriver(data);
      setIsAvailable(data?.is_available || false); // 🔹 load availability
      setLoadingDriver(false);

      // 🔹 Set initial map center to driver's last saved location
      if (data?.lat && data?.lng) {
        setMapCenter({ lat: data.lat, lng: data.lng });
      }

      //fetch earnings
      fetchEarnings(data.id);
    }

    getDriver();
  }, [addToast]);

  async function fetchEarnings(driverId) {
  if(!driverId) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();

      const token = session?.access_token;
    const res = await axios.get(`${API_URL}/api/drivers/${driverId}/earnings`,{
        headers: { Authorization: `Bearer ${token}`}
    });
    setEarnings(res.data);  // e.g. number in rupees
  } catch(e) {
    addToast("Failed to load earnings", { type: "error" });
  }
};
 

  // Join driver room
  useEffect(() => {
    if (driver?.id) {
      socket.emit("join_driver", driver.id);

      socket.on("ride_request", (ride) => {
        if (isAvailable) { // 🔹 only if available
          setRides((prev) => [...prev, ride]);
           addToast("🚖 New ride request received!", { type: "info" });
        }
      });

      socket.on("ride_status_update", ({ rideId, status }) => {
        if (activeRide?.id === rideId) {
          setActiveRide((prev) => ({ ...prev, status }));
         addToast(`ℹ️ Ride status updated to ${status}`, { type: "info" });

        }
      });

      return () => {
        socket.off("ride_request");
        socket.off("ride_status_update");
      };
    }
  }, [driver?.id, activeRide?.id, isAvailable,addToast]);

  // Track driver location
  useEffect(() => {
    if (!driver?.id) return;

    let watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setDriver((prev) => ({ ...prev, lat: latitude, lng: longitude }));

        // 🔹 Set map center first time only
        setMapCenter((prev) => prev || { lat: latitude, lng: longitude });

        // Update server DB with location
        supabase
          .from("users")
          .update({ lat: latitude, lng: longitude })
          .eq("id", driver.id)
          .then(() => {})
          .catch((err) => console.error("Supabase update error", err));

        socket.emit("driver_location", {
          rideId: activeRide?.id || null,
          driverId: driver.id,
          lat: latitude,
          lng: longitude,
        });
      },
      (err) => console.error("Geolocation error:", err),
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      if (watchId && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [driver?.id, activeRide?.id]);

  useEffect(() => {
  if (!driver) return;

  function handleIncomingRideRequest(ride) {
    if (isAvailable) {
      setRides((prev) => [...prev, ride]);
      addToast('New ride request received!', { type: 'info' });
    }
  }

  function handleRideStatusUpdate({ rideId, status }) {
    if (!activeRide || rideId !== activeRide.id) return;
    setActiveRide((prev) => ({ ...prev, status }));
    addToast(`Ride status updated: ${status}`, { type: 'info' });
  }

  socket.on('ride_request', handleIncomingRideRequest);
  socket.on('ride_status_update', handleRideStatusUpdate);

  return () => {
    socket.off('ride_request', handleIncomingRideRequest);
    socket.off('ride_status_update', handleRideStatusUpdate);
  };
}, [driver, activeRide, isAvailable, addToast]);


  // Fetch nearby rides
  async function fetchRides() {
    if (!driver?.lat || !driver?.lng || !isAvailable) return; // 🔹 only fetch when available
    try {
       const { data: { session } } = await supabase.auth.getSession();

      const token = session?.access_token; 
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/rides/nearby`, {
      params: {
        driver_lat: driver.lat,
        driver_lng: driver.lng,
        driver_id:driver.id,
      },
      headers: { Authorization: `Bearer ${token}`}
    });

    setRides(res.data);
  }
  catch {
    addToast("Failed to fetch nearby rides",{type:"error"});
  }
}

  // Accept ride
async function acceptRide(rideId) {
  try {
    // Clear previous ride to reset MapView state (optional step)
    setActiveRide(null);
    const { data: { session } } = await supabase.auth.getSession();

      const token = session?.access_token;

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/rides/${rideId}/accept`,
      {
        driver_id: driver.id,
      },
      {
        headers:{Authorization:`Bearer ${token}`}
      }
      
    );

    setActiveRide(res.data);
    setRides([]);
    socket.emit("update_ride_status", { rideId, status: "confirmed" });
  } catch (error) {
    console.error('Error accepting ride:', error);
  }
};

async function declineRide(rideId) {
  try {
    const { data: { session } } = await supabase.auth.getSession();

      const token = session?.access_token;
    await axios.patch(`${API_URL}/api/rides/${rideId}/decline`, {
      driver_id: driver.id},
      { headers: { Authorization: `Bearer ${token}` } }
      
    );
    setRides((prev) => prev.filter((r) => r.id !== rideId)); // remove from list
    addToast("❌ Ride declined", { type: "info" });
  } catch (err) {
    console.error("Error declining ride:", err);
    addToast("Failed to decline ride", { type: "error" });
  }
};




  // Update ride status
   async function updateRideStatus(status) {
    if (!activeRide) return;
try{
    const { data: { session } } = await supabase.auth.getSession();

      const token = session?.access_token;
    const res = await axios.patch(
      `${import.meta.env.VITE_API_URL}/api/rides/${activeRide.id}/status`,
      { status },
       {headers: { Authorization: `Bearer ${token}` } }
    );

    socket.emit("update_ride_status", { rideId: activeRide.id, status });
    setActiveRide(res.data);

    if (status === "completed") {
      await supabase.from("users").update({ is_available: true }).eq("id", driver.id);
      setIsAvailable(true); // 🔹 auto back online after trip
      setTimeout(() =>{ setActiveRide(null);
      setRides([]);
      fetchEarnings(driver.id);
    },3000);
    }
  }catch (error){
    console.error("Error updating ride status:", error);
    addToast("Failed to update ride status", { type: "error" });
  }
  };

  // Fetch nearby rides every 10s when available
  useEffect(() => {
    if (!driver?.lat || !driver?.lng || activeRide || !isAvailable) return;

    fetchRides();

    const interval = setInterval(fetchRides, 10000);

    return () => clearInterval(interval);
  }, [driver?.lat, driver?.lng, activeRide, isAvailable]);

  // Toggle availability
  async function toggleAvailability() {
    if (!driver || !driver.id) {
    console.error("Driver data not loaded yet.");
    addToast("Driver data not loaded yet. Please wait.", { type: "error" });
    return;
  }
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);

    await supabase.from("users").update({ is_available: newStatus }).eq("id", driver.id);

    if (!newStatus) {
      setRides([]); // clear rides when going offline
    }
  };


  useEffect(() => {
  if (!activeRide) {
    // Reset map center to driver's current location or a default location if driver is not set
    setMapCenter(driver ? { lat: driver.lat, lng: driver.lng } : { lat: 12.9716, lng: 77.5946 });
  }
}, [activeRide, driver]);

useEffect(() => {
  async function fetchDriverHistory() {
    if (!driver?.id) return;

    setLoadingHistory(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();

        const token = session?.access_token;
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/rides/history`, {
        params: { userId : driver.id,role:'driver' },
        headers: { Authorization: `Bearer ${token}`}
      });
      setRideHistory(res.data);
    } catch {
      addToast('Failed to load ride history', { type: 'error' });
    } finally {
      setLoadingHistory(false);
    }
  }

  fetchDriverHistory();
}, [driver?.id,addToast]);



  if (loadingDriver)
    return <p className="p-4 text-center">Loading driver info...</p>;

  return (
    <>
    <div className="relative h-screen w-full">
      {/* Full Map */}
      <MapView
       key={activeRide ? activeRide.id : 'none'}   // forces remount / state reset on new ride
        center={mapCenter} // 🔹 pass driver’s location as initial map center
        pickupLocation={
          activeRide ? { lat: activeRide.pickup_lat, lng: activeRide.pickup_lng } : null
        }
        dropoffLocation={
          activeRide ? { lat: activeRide.dropoff_lat, lng: activeRide.dropoff_lng } : null
        }
        driverLocation={driver ? { lat: driver.lat, lng: driver.lng } : null}
      />

      {/* Top Bar */}
      <div className="absolute top-4 left-0 right-0 px-5 flex justify-between items-center">
        <button
          onClick={() => setShowProfile(true)}
          className="bg-black/70 text-white px-4 py-2 rounded-full shadow-md"
        >
          ☰
        </button>

        {/* 🔹 Availability Toggle */}
        <button
          onClick={toggleAvailability}
          className={`px-4 py-2 rounded-full font-bold shadow-md ${
            isAvailable ? "bg-green-500 text-white" : "bg-gray-400 text-black"
          }`}
        >
          {isAvailable ? "Online" : "Offline"}
        </button>
      </div>

      {/* Profile Drawer */}
      {showProfile &&( <DriverProfile onClose={() => setShowProfile(false)}
      

        earnings= {earnings} />
    
)}
         
      {/* Active Ride Bottom Sheet */}
      {activeRide && (activeRide.status !== "completed" || activeRide.payment_status !== "completed") && (
        <div className="absolute bottom-0 left-0 w-full bg-black text-white p-6 rounded-t-3xl shadow-2xl">
          <h3 className="text-xl font-bold mb-3">Trip Details</h3>
          <div className="mb-4">
            <p className="font-semibold text-lg">{activeRide.pickup}</p>
            <p className="text-gray-400">Pickup</p>
            <p className="mt-2 font-semibold text-lg">{activeRide.dropoff}</p>
            <p className="text-gray-400">Dropoff</p>
          </div>
          <div className="flex gap-3">
            {activeRide.status === "confirmed" && (
              <button
                onClick={() => updateRideStatus("ongoing")}
                className="flex-1 bg-yellow-400 text-black font-bold py-4 rounded-xl"
              >
                Start Trip
              </button>
            )}
            {activeRide.status === "ongoing" && (
              <button
                onClick={() => updateRideStatus("completed")}
                className="flex-1 bg-green-500 text-white font-bold py-4 rounded-xl"
              >
                Complete Trip
              </button>
            )}
            {activeRide.status === "completed" && (
              <button
                disabled
                className="flex-1 bg-gray-600 text-white font-bold py-4 rounded-xl cursor-not-allowed"
              >
                Ride Completed
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ride Requests Bottom Sheet */}
      {!activeRide && isAvailable && (
        <div className="absolute bottom-0 left-0 w-full bg-white p-6 rounded-t-3xl shadow-lg">
          <h3 className="text-lg font-bold mb-4">Ride Requests</h3>
          {rides.length > 0 ? (
            rides.map((ride) => (
              <div
                key={ride.id}
                className="flex justify-between items-center mb-3 p-4 rounded-2xl bg-gray-900 text-white shadow"
              >
                <div>
                  <p className="font-semibold text-lg">
                    {ride.pickup} → {ride.dropoff}
                  </p>
                  <p className="text-sm text-gray-400">Type: {ride.ride_type}</p>
                  <p className="text-sm text-green-400 font-semibold">Fare: ₹{ride.fare}</p>
                </div>
                <div className="flex gap-2">
                <button
                  onClick={() => acceptRide(ride.id)}
                  className="bg-yellow-400 text-black font-bold px-5 py-2 rounded-xl"
                >
                  Accept
                </button>
                <button
        onClick={() => declineRide(ride.id)}
        className="bg-red-500 text-white font-bold px-4 py-2 rounded-xl"
      >
        Decline
      </button>
              </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No rides nearby</p>
          )}
        </div>
      )}

      {/* 🔹 Message when Offline */}
      {!activeRide && !isAvailable && (
        <div className="absolute bottom-0 left-0 w-full bg-gray-100 p-6 rounded-t-3xl shadow-lg text-center">
          <p className="text-gray-600 font-medium">
            You are Offline. Go Online to receive rides.
          </p>
        </div>
      )}

      <div className="fixed top-4 right-4 space-y-2 z-50">
  {notifications.map((n) => (
    <div key={n.id} className="bg-white shadow-md border rounded-lg p-3 text-sm text-gray-800">
      {n.text}
    </div>
  ))}
</div>

     
    </div>
    {ToastContainer}
    </>
  );
}
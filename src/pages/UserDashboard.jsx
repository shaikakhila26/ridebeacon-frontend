import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import MapView from "../components/MapView";
import axios from "axios";
import socket from "../lib/socket";
import { useToasts } from "../components/Toasts";
import { useNavigate } from "react-router-dom";
import PaymentModal from "../components/PaymentModal.jsx";
import RateDriverModal from "../components/RateDriverModal.jsx"
import React from 'react';



const accountTabs = [
  { label: "Home" },
  { label: "Personal info" },
  { label: "Security" },
  { label: "Privacy & data" },
  {label : "Activity"},
  
];


export default function UserDashboard() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupTime, setPickupTime] = useState("now");
  const [passenger, setPassenger] = useState("me");

  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState("");

  const [profileOpen, setProfileOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");

  const [editingField, setEditingField] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  // Add state for coordinates
const [pickupCoords, setPickupCoords] = useState(null);
const [dropoffCoords, setDropoffCoords] = useState(null);
const [rideType, setRideType] = useState("Standard");

// 👇 add missing state
  const [user, setUser] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
 const [notifications, setNotifications] = useState([]);
 const [driverLocation, setDriverLocation] = useState(null);
 const [userLocation, setUserLocation] = useState(null);
 const navigate = useNavigate();
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [rideToPay, setRideToPay] = useState(null); // holds ride info to pay
const [mapResetKey, setMapResetKey] = useState(0);
const [rideHistory,setRideHistory ] = useState([]);
const [loadingHistory,setLoadingHistory]=useState(false);
const [showRateModal, setShowRateModal] = useState(false);
const [rateRide, setRateRide] = useState(null);


  // toasts
  const { addToast, ToastContainer } = useToasts();

 
  // Add these logging effects immediately after these state declarations
  useEffect(() => {
    console.log("Pickup coords updated:", pickupCoords);
  }, [pickupCoords]);

  useEffect(() => {
    console.log("Dropoff coords updated:", dropoffCoords);
  }, [dropoffCoords]);


  useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => {
        console.error("Error getting user location:", error);
        // Optionally set a default location here if permission denied
        setUserLocation({ lat: 12.9716, lng: 77.5946 }); // Bangalore fallback
      },
      { enableHighAccuracy: true , timeout: 10000, maximumAge: 0 }
    );
  } else {
    // Geolocation not supported, fallback location
    setUserLocation({ lat: 12.9716, lng: 77.5946 });
  }
}, []);


// 👇 Add inside your UserDashboard component
useEffect(() => {
  if (!activeRide?.driver?.id) return; // only listen if a driver is assigned

  // subscribe to driver's location updates
  const channel = supabase
    .channel("driver-location")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "drivers",
        filter: `id=eq.${activeRide.driver.id}`, // only this driver
      },
      (payload) => {
        console.log("Driver location update:", payload);
        setDriverLocation({
          lat: payload.new.lat,
          lng: payload.new.lng,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel); // cleanup
  };
}, [activeRide?.driver?.id]);


  useEffect(() => {
    async function fetchUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setProfile(null);
        setEmail("");
        return;
      }
      setEmail(user.email);
      setUser(user);

      let { data, error: profileError } = await supabase.from("users").select("id, full_name, phone, profile_pic, role").eq("id", user.id).single();
      if(profileError){
        setProfile(null);
      } else {
        setProfile(data || {});
        setEditName(data?.full_name || "");
        setEditPhone(data?.phone || "");
      }
      console.log("Fetched profile:", data, profileError);

    }
    fetchUser();
  }, []);

useEffect(() => {
  if (!profile) return;

  // Ride status change listener
  function handleRideStatusUpdate({ rideId, status }) {
    if (!activeRide || rideId !== activeRide.id) return;
    setActiveRide((prev) => ({ ...prev, status }));
    addToast(`Your ride status changed to ${status}`, { type: status === 'confirmed' ? 'success' : 'info' });
  }

  // Driver assigned to your ride
  function handleDriverAssigned({ rideId, driver }) {
    if (!activeRide || rideId !== activeRide.id) return;
    setActiveRide((prev) => ({ ...prev, driver }));
    addToast(`${driver?.full_name || 'Your driver'} is on the way`, { type: 'success' });
  }

  // Driver location updates
  function handleDriverLocationUpdate({ rideId, driverId, lat, lng }) {
    if (!activeRide || rideId !== activeRide.id) return;
    setDriverLocation({ lat, lng });
  }

  socket.on('ride_status_update', handleRideStatusUpdate);
  socket.on('driver_assigned', handleDriverAssigned);
  socket.on('ride_location_update', handleDriverLocationUpdate); // use the exact event name your server sends

  return () => {
    socket.off('ride_status_update', handleRideStatusUpdate);
    socket.off('driver_assigned', handleDriverAssigned);
    socket.off('ride_location_update', handleDriverLocationUpdate);
  };
}, [activeRide, profile, addToast]);


  // geocode util (unchanged)
async function geocodeAddress(address) {
  if (!address) return null;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/geocode?address=${encodeURIComponent(address)}`);
    if (!res.ok) {
      const errorData = await res.json();
      addToast("Failed to fetch location: " + (errorData.error || res.statusText));
      return null;
    }
    const data = await res.json();
    console.log("Geocode result for", address, ":", data);
    if (!data.lat || !data.lng) {
      addToast("Could not find location. Please check the address.");
      return null;
    }
    return { lat: data.lat, lng: data.lng };
  } catch (err) {
    console.error(err);
    addToast("Network error when geocoding.");
    return null;
  }
}




  // request ride
async function handleSearch() {
  console.log("handleSearch clicked", { pickup, dropoff });

  if (!pickup || !dropoff) {
    addToast("Enter both pickup and dropoff");
    return;
  }

  const pickupCoords = await geocodeAddress(pickup);
  const dropoffCoords = await geocodeAddress(dropoff);

  console.log("Geocoded pickupCoords:", pickupCoords);
  console.log("Geocoded dropoffCoords:", dropoffCoords);

  if (!pickupCoords || !dropoffCoords) {
    addToast("Could not find locations");
    console.error('pickupCoords or dropoffCoords is missing', {pickupCoords, dropoffCoords});
    return;
  }

  if (
    pickupCoords.lat === dropoffCoords.lat &&
    pickupCoords.lng === dropoffCoords.lng
  ) {
    addToast("Pickup and dropoff locations cannot be the same");
    return;
  }

  setPickupCoords(pickupCoords);
  setDropoffCoords(dropoffCoords);

  // continue `axios.post` to request ride, etc.

    try {
       const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token; 
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/rides`, {
        rider_id: profile.id,
        pickup,
        dropoff,
        ride_type: rideType,
        fare: 0,
        pickup_lat: pickupCoords.lat,
        pickup_lng: pickupCoords.lng,
        dropoff_lat: dropoffCoords.lat,
        dropoff_lng: dropoffCoords.lng,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );


      const rideData = res.data;
      setActiveRide(rideData);
      console.log("Request payload:", {
  rider_id: profile?.id,
  pickup,
  dropoff,
  ride_type: rideType,
  pickup_lat: pickupCoords?.lat,
  pickup_lng: pickupCoords?.lng,
  dropoff_lat: dropoffCoords?.lat,
  dropoff_lng: dropoffCoords?.lng,
});


      // notify drivers in real time (server also emits new_ride_request on this API)
      // this is optional (server already emitted), but keeping for reliability
      socket.emit("new_ride_request", rideData);

      // join the ride room to receive updates
      socket.emit("join_ride", rideData.id);

      addToast("Ride requested. Waiting for drivers to accept...");
    } catch (err) {
        console.error("Ride request Failed :",err);
      addToast(err.response?.data?.error || err.message);
    }
  }

  // Add this new useEffect to see actual dropoffCoords updates in real-time
useEffect(() => {
  console.log("DropoffLocation state updated to:", dropoffCoords);
}, [dropoffCoords]);


  async function saveField(field) {
    if (!profile) return;
    setSaving(true);

      if (field === "phone") {
    // Validate 10 digit phone number (only digits)
    const digitsOnly = editPhone.replace(/\D/g, "");
    if (digitsOnly.length !== 10) {
      addToast("Please enter exactly 10 digits for phone number.");
      setSaving(false);
      return;
    }
  }

    const updates = { id: profile.id };
    if(field === "name") updates.full_name = editName;
    if(field === "phone") updates.phone = editPhone;
    delete updates.updated_at; // remove if not existing

    const { error } = await supabase.from("users").upsert(updates, { returning: "minimal" });
    if(error) {
      addToast(`Failed to update ${field}: ${error.message}`);
    } else {
      setProfile((p) => ({ ...p, ...updates }));
      addToast(`${field === "name" ? "Name" : "Phone"} updated successfully`);
      setEditingField(null);
    }
    setSaving(false);
  }

 async function handleAvatarUpload(e) {
  if (!profile) return;
  const file = e.target.files?.[0];
  if (!file) return;

  setSaving(true);

  const fileExt = file.name.split('.').pop();
  const fileName = `${profile.id}_avatar.${fileExt}`;
  const filePath = `${profile.id}/${fileName}`;

  // Upload file (overwrites if exists)
  const {data:uploadData,  error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });

  console.log('Upload data:', uploadData);
console.log('Upload error:', uploadError);
  if(uploadError) {
    addToast("Upload failed: " + uploadError.message);
    setSaving(false);
    return;
  }
  
  // To avoid caching issues, append a timestamp query param
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  const publicUrl = data.publicUrl + `?t=${Date.now()}`;

  // Update the user profile with new avatar URL
  const { error: updateError } = await supabase
    .from('users')
    .update({ profile_pic: publicUrl })
    .eq('id', profile.id);

  if(updateError) {
    addToast("Profile update failed: " + updateError.message);
    setSaving(false);
    return;
  }

  // Update local state with new URL (including timestamp)
  setProfile(prev => ({ ...prev, profile_pic: publicUrl }));

  addToast("Avatar updated");
  setSaving(false);
}

async function cancelRide() {
  if (!activeRide) return;

  if (!window.confirm("Are you sure you want to cancel this ride?")) return;

  try {
    const { data: { session } } = await supabase.auth.getSession();
     const token = session?.access_token;
    await axios.patch(`${import.meta.env.VITE_API_URL}/api/rides/${activeRide.id}/cancel`,{
        headers: { Authorization: `Bearer ${token}` }
    });
    addToast("Ride cancelled", { type: "success" });
    setActiveRide(null);
    setDriverLocation(null);
    // Add additional cleanup as needed
  } catch (error) {
    addToast(error.response?.data?.error || "Failed to cancel ride", { type: "error" });
  }
}

function resetRideState() {
  setActiveRide(null);
  setPickup("");
  setDropoff("");
  setPickupCoords(null);
  setDropoffCoords(null);
  setRideToPay(null);
  setShowPaymentModal(false);
  setDriverLocation(null);
  setMapResetKey(k => k+1);
}

useEffect(() => {
  async function fetchRideHistory() {
    if (activeTab !== "Activity" || !user) return;
    setLoadingHistory(true);

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/rides/history`, {
        params: { userId: user.id,role:'rider' },
        headers: { Authorization: `Bearer ${token}` }
      });
      setRideHistory(res.data);
    } catch(err) {
      addToast("Failed to load ride history", { type: "error" });
    } finally {
      setLoadingHistory(false);
    }
  }

  fetchRideHistory();
}, [activeTab, user]);

async function downloadReceipt(rideId) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

const res = await axios.get(
  `${import.meta.env.VITE_API_URL}/api/rides/${rideId}/receipt`,
  {
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);


    // Create a Blob link to download the PDF receipt file
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RideReceipt_${rideId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    addToast('Receipt downloaded', { type: 'success' });
  } catch (error) {
    addToast('Failed to download receipt', { type: 'error' });
  }
}

// Show once when payment/ride completed
useEffect(() => {
  if (
    activeRide?.status === "completed" &&
    activeRide.payment_status === "completed" &&
    !rateRide &&
    activeRide.driver?.id
  ) {
    setRateRide(activeRide);
    setShowRateModal(true);
  }
  // Don't include `rateRide` in dependencies!
  // Only run when activeRide changes
}, [activeRide]);

// Clear on modal finish only (inside RateDriverModal trigger)
const handleRated = (rating) => {
  setShowRateModal(false);
  setRateRide(null);
  addToast(`Thank you for rating ${rating} stars!`,{ type: "success" });
};


// When payment is successful
async function handlePaymentSuccess() {
  try {
    const { data: { session } } = await supabase.auth.getSession();

      const token = session?.access_token;
    await axios.patch(`${import.meta.env.VITE_API_URL}/api/rides/${rideToPay.id}/mark-paid`,
        {},
      {  headers: { Authorization: `Bearer ${token}` }
    });
    addToast("Payment successful! Thank you.", { type: "success" });

    // Force-refetch latest ride data here:
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/rides/${rideToPay.id}`,{
        headers: { Authorization: `Bearer ${token}` }
    });
    setActiveRide(res.data);

    setRateRide(res.data);
    setShowRateModal(true); 
    setShowPaymentModal(false);
  } catch (error) {
    addToast("Failed to update payment status.", { type: "error" });
  } 
};


useEffect(() => {
  if (!activeRide?.id) return;

  function handleRideUpdate(updatedRide)  {
    if (updatedRide.id === activeRide.id) {
      setActiveRide(updatedRide);

      if (updatedRide.status === "completed" && updatedRide.payment_status !== "completed") {
        setRideToPay(updatedRide);
        setShowPaymentModal(true);
      }

      if (updatedRide.status === "completed" && updatedRide.payment_status === "completed") {
        if (!rateRide) {
          setRateRide(updatedRide);
          setShowRateModal(true);
        }
      }
    }
  };

  socket.on('ride_updated', handleRideUpdate);
  return () => {
    socket.off('ride_updated', handleRideUpdate);
  };
}, [activeRide]);





if (!userLocation) return <div>Loading your location...</div>;

  return (
    <>
    <div className="min-h-screen flex flex-col bg-[#fafbfc]">
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm border-b">
        <div className="text-2xl font-bold">Ride Beacon</div>
        <div className="flex items-center gap-6">
          <div className="flex gap-4">
            <button className="border-b-2 border-black pb-1 font-semibold">Trip</button>
            <button className="text-gray-500 hover:text-black">Rentals</button>
          </div>
          <button className="relative flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-gray-100 text-sm">
            <span className="hidden md:inline">Activity</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx={12} cy={12} r={10} stroke="currentColor" />
              <path d="M12 8l3 3-3 3" strokeLinecap="round" />
            </svg>
          </button>
          <div className="relative">
            <button onClick={() => setProfileOpen(p => !p)} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border hover:ring-2 hover:ring-yellow-400" aria-label="User menu" type="button">
              {profile?.profile_pic ? (
                <img src={profile.profile_pic} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx={12} cy={8} r={4} />
                  <path d="M16 21v-2a4 4 0 00-8 0v2" />
                </svg>
              )}
            </button>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} aria-hidden="true" />
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-lg p-4 z-20 border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      {profile?.profile_pic ? (
                        <img src={profile.profile_pic} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx={12} cy={8} r={4} />
                          <path d="M16 21v-2a4 4 0 00-8 0v2" />
                        </svg>
                      )}
                    </div>
                    <span className="text-lg font-bold capitalize">{profile?.full_name || "Unnamed User"}</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <button className="flex flex-col items-center gap-1 text-gray-700 hover:text-black text-xs">
                      <svg className="h-6 w-6 mb-1" fill="none" stroke="currentColor"><circle cx={12} cy={12} r={10} /><path d="M15 12a3 3 0 01-6 0" /></svg>
                      Help
                    </button>
                    <button className="flex flex-col items-center gap-1 text-gray-700 hover:text-black text-xs">
                      <svg className="h-6 w-6 mb-1" fill="none" stroke="currentColor"><rect x={4} y={8} width={16} height={10} rx={2} /><path d="M8 12h8" /></svg>
                      Wallet
                    </button>
                    <button className="flex flex-col items-center gap-1 text-gray-700 hover:text-black text-xs">
                      <svg className="h-6 w-6 mb-1" fill="none" stroke="currentColor"><rect x={4} y={4} width={16} height={16} rx={3} /><path d="M8 9h8M8 13" /></svg>
                      Activity
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3 mb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-gray-500">Ride Beacon Cash</div>
                        <div className="text-lg font-bold">₹0.00</div>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center w-full py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition mb-2" onClick={() => { setManageOpen(true); setProfileOpen(false); setActiveTab("Home"); }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor"><circle cx={12} cy={12} r={10} /><path d="M8 11h8M8 15h8" /></svg>
                    Manage account
                  </button>
                  <button className="flex items-center w-full py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor"><rect x={7} y={7} width={10} height={10} rx={2} /><path d="M9 9l6 6M15 9l-6 6" /></svg>
                    Promotions
                  </button>
                  <button
  onClick={async () => {
    await supabase.auth.signOut();
    navigate("/");
  }}
  className="w-full mt-2 py-2 rounded bg-gray-100 text-red-600 hover:bg-gray-200 transition"
>
  Log out
</button>

                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {manageOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full flex overflow-hidden relative">
            <button onClick={() => setManageOpen(false)} aria-label="Close modal" className="absolute top-4 right-4 bg-gray-100 rounded-full p-2 hover:bg-gray-200">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <nav className="w-44 border-r p-6 flex flex-col">
              {accountTabs.map(tab => (
                <button key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={`text-left mb-2 p-3 rounded hover:bg-gray-100 w-full font-medium ${
                    activeTab === tab.label ? "bg-yellow-50 border-l-4 border-yellow-600 text-yellow-600" : "text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <main className="flex-1 p-6 overflow-auto max-h-[85vh]">
              {activeTab === "Home" && (
                <>
                  <div className="flex flex-col items-center mb-5">
                    <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden mb-3">
                      {profile?.profile_pic ? (
                        <img alt="avatar" src={profile.profile_pic} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <circle cx={12} cy={12} r={10} />
                          <path d="M16 21v-2a6 6 0 00-8 0v2" />
                        </svg>
                      )}
                    </div>
                    <h2 className="text-2xl font-semibold">{profile?.full_name || "Unnamed User"}</h2>
                    <p className="text-gray-600">{email}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {["Personal info", "Security", "Privacy & data"].map(label => (
                      <button key={label} onClick={() => setActiveTab(label)} className="bg-gray-100 hover:bg-gray-200 rounded p-6 text-center font-semibold cursor-pointer">
                        {label === "Personal info" && (
                          <svg className="mx-auto mb-2 w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path d="M12 14v-4m-3 0a3 3 0 116 0" />
                            <circle cx={12} cy={9} r={4} />
                          </svg>
                        )}
                        {label === "Security" && (
                          <svg className="mx-auto mb-2 w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <circle cx={12} cy={12} r={10} />
                            <path d="M12 8v4l3 3" />
                          </svg>
                        )}
                        {label === "Privacy & data" && (
                          <svg className="mx-auto mb-2 w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <rect x={8} y={8} width={8} height={8} rx={2} />
                          </svg>
                        )}
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl border p-6 shadow flex items-center justify-between max-w-xl">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Complete your account check-up</h3>
                      <p className="text-gray-600">Complete your account check-up to make Ride Beacon work better for you and keep you secure.</p>
                      <button className="mt-3 px-6 py-2 rounded-full bg-gray-100 hover:bg-gray-200">Begin check-up</button>
                    </div>
                    <svg className="w-14 h-14 text-blue-500" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x={8} y={8} width={24} height={16} rx={3} fill="#3B82F6" />
                      <rect x={10} y={14} width={8} height={4} rx={1} fill="#fff" />
                      <rect x={22} y={14} width={8} height={4} rx={1} fill="#fff" />
                    </svg>
                  </div>
                </>
              )}

              {activeTab === "Personal info" && (
                <>
                  <h2 className="text-3xl font-semibold mb-6">Personal info</h2>
                  <div className="max-w-xl mx-auto">
                    <div className="flex items-center mb-8">
                      <div className="relative w-28 h-28 rounded-full overflow-hidden bg-gray-200">
                        {profile?.profile_pic ? (
                          <img alt="avatar" src={profile.profile_pic} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <circle cx={12} cy={12} r={10} />
                            <path d="M16 21v-2a6 6 0 00-8 0v2" />
                          </svg>
                        )}
                        <label className="absolute bottom-2 right-2 cursor-pointer bg-white p-2 rounded border shadow hover:bg-gray-100">
                          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={saving} />
                          <svg className="w-5 h-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </label>
                      </div>
                    </div>

                    <dl className="border rounded-md border-gray-100 divide-y divide-gray-200">
                      <div className="flex justify-between items-center p-4">
                        <dt className="font-medium text-gray-900">Name</dt>
                        <div className="flex items-center space-x-2">
                          {editingField === "name" ? (
                            <>
                              <input
                                type="text"
                                className="border px-2 py-1 rounded"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                disabled={saving}
                              />
                              <button className="text-green-600" onClick={() => saveField("name")} disabled={saving}>Save</button>
                              <button className="text-red-600" onClick={() => setEditingField(null)} disabled={saving}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <dd className="text-gray-700">{profile?.full_name || "Not set"}</dd>
                              <button className="text-yellow-600" onClick={() => { setEditingField("name"); setEditName(profile?.full_name || ""); }}>Edit</button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-4">
                        <dt className="font-medium text-gray-900">Phone</dt>
                        <div className="flex items-center space-x-2">
                          {editingField === "phone" ? (
                            <>
                              <input
                                type="text"
                                className="border px-2 py-1 rounded"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                disabled={saving}
                              />
                              <button className="text-green-600" onClick={() => saveField("phone")} disabled={saving}>Save</button>
                              <button className="text-red-600" onClick={() => setEditingField(null)} disabled={saving}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <dd className="text-gray-700">{profile?.phone || <em className="text-gray-400">Add phone</em>}</dd>
                              <button className="text-yellow-600" onClick={() => { setEditingField("phone"); setEditPhone(profile?.phone || ""); }}>
                                {profile?.phone ? "Edit" : "Add"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-4">
                        <dt className="font-medium text-gray-900">Email</dt>
                        <dd className="text-gray-700 flex items-center space-x-1">
                          <span>{email}</span>
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </dd>
                        <button disabled className="text-yellow-600 cursor-not-allowed">Verified</button>
                      </div>

                      <div className="flex justify-between items-center p-4">
                        <dt className="font-medium text-gray-900">Language</dt>
                        <dd className="text-gray-700">Update device language</dd>
                       <button
  onClick={() => addToast("Language update not implemented", { type: "info" })}
  className="text-yellow-600"
>
  Change
</button>

                      </div>
                    </dl>
                  </div>
                </>
              )}

              
              {activeTab === "Activity" && (
  <div className="max-w-xl mx-auto p-4 overflow-auto">
    <h2 className="text-2xl font-semibold mb-4">Ride History</h2>
  
    {loadingHistory ? (
      <p>Loading...</p>
    ) : rideHistory.length === 0 ? (
      <p>No ride history found.</p>
    ) : (
      <ul className="space-y-4">
        {rideHistory.map((ride) => (
          <li key={ride.id} className="p-4 border rounded-md shadow-sm bg-white">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="font-semibold">{ride.pickup} → {ride.dropoff}</p>
                <p className="text-sm text-gray-500">{new Date(ride.created_at).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{ride.fare.toFixed(2)}</p>
                <p className={`text-sm font-medium ${
                  ride.status === "completed" ? "text-green-600" :
                  ride.status === "cancelled" ? "text-red-600" : "text-gray-600"
                }`}>
                  {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                </p>
              </div>
            </div>

            {/* Show Download Receipt only if completed */}
            {ride.status === "completed" && (
              <button
                className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                onClick={() => downloadReceipt(ride.id)}
              >
                Download Receipt
              </button>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
)}

            </main>
          </div>
        </div>
      )}

      {/* Main content section */}
      <div className="flex flex-1">
        {/* Left panel */}
        <div className="w-full md:w-1/3 bg-white p-6 md:p-8 border-r">
          <h2 className="text-xl font-bold mb-6">Find a trip</h2>
          <div className="space-y-4">
            {/* Pickup */}
            <div className="flex items-center gap-3">
              <span className="bg-gray-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx={12} cy={12} r={10} />
                  <circle cx={12} cy={10} r={3} />
                  <path d="M12 13v6" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Pick-up location"
                value={pickup}
                onChange={e => setPickup(e.target.value)}
                className="flex-grow border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            {/* Dropoff */}
            <div className="flex items-center gap-3">
              <span className="bg-gray-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect x={4} y={11} width={16} height={7} rx={2} />
                  <path d="M7 11v-4a5 5 0 0110 0v4" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Drop-off location"
                value={dropoff}
                onChange={e => setDropoff(e.target.value)}
                className="flex-grow border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button
                title="Swap locations"
                onClick={() => { const t = pickup; setPickup(dropoff); setDropoff(t); }}
                className="ml-2 rounded-full bg-gray-200 p-2 hover:bg-yellow-100"
              >
                <svg className="w-5 h-5 text-gray-700" stroke="currentColor" fill="none" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M12 6v12M6 12h12" />
                </svg>
              </button>
            </div>

   
<div className="flex items-center gap-3">
  <span className="bg-gray-100 p-2 rounded-full">
    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x={4} y={4} width={16} height={16} rx={3} />
      <path d="M4 8h16" />
    </svg>
  </span>
  <select
    value={rideType}
    onChange={e => setRideType(e.target.value)}
    className="flex-grow border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
  >
    <option value="Standard">Standard</option>
    <option value="Premium">Premium</option>
    <option value="XL">XL</option>
  </select>
</div>
            {/* Pickup time */}
            <div className="flex items-center gap-3">
              <span className="bg-gray-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx={12} cy={12} r={10} />
                  <path d="M12 6l4 2v4" />
                </svg>
              </span>
              <select
                value={pickupTime}
                onChange={e => setPickupTime(e.target.value)}
                className="flex-grow border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="now">Pick up now</option>
                <option value="later">Schedule for later</option>
              </select>
            </div>
            {/* Passenger */}
            <div className="flex items-center gap-3">
              <span className="bg-gray-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx={12} cy={8} r={4} />
                  <path d="M16 21v-2a4 4 0 00-8 0v2" />
                </svg>
              </span>
              <select
                value={passenger}
                onChange={e => setPassenger(e.target.value)}
                className="flex-grow border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="me">For me</option>
                <option value="others">For someone else</option>
              </select>
            </div>
            <button
            disabled={!!activeRide}
type="button"
  className="w-full mt-6 bg-yellow-500 text-white p-3 rounded font-semibold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
  onClick={handleSearch}
>
  Request Ride
</button>

          </div>
        </div>
        


        <div className="w-full md:w-2/3 bg-gray-100">
    <MapView
    key = {mapResetKey}
    userLocation={userLocation}
     pickupLocation={pickupCoords} 
     dropoffLocation={dropoffCoords} 
     driverLocation={driverLocation}
    />


        </div>

        {/* Ride Status Persistent Panel (Uber-like Bottom/Side Sheet) */}
{activeRide && (
  <div
    className="
      fixed bottom-6 left-1/2 transform -translate-x-1/2
      w-[95vw] max-w-md md:max-w-lg
      bg-white rounded-2xl
      shadow-2xl shadow-black/20
      p-6 z-50 flex flex-col items-start gap-3
      transition-transform duration-300 ease-out
      md:w-1/3
      md:backdrop-blur-none
      backdrop-blur-sm
      md:backdrop-filter-none
    "
    style={{
      minHeight: 130,
    }}
  >
    <div className="flex items-center gap-3">
      {/* Status icon with animation */}
      <span className="relative w-8 h-8 flex items-center justify-center">
        {activeRide.status === "pending" && (
          <span className="absolute w-8 h-8 rounded-full bg-yellow-400 opacity-50 animate-ping" />
        )}
        {activeRide.status === "pending" && (
          <svg className="w-6 h-6 text-yellow-600 relative" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" />
          </svg>
        )}
        {activeRide.status === "confirmed" && (
          <svg className="w-8 h-8 text-blue-500 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" />
          </svg>
        )}
        {activeRide.status === "ongoing" && (
          <svg
            className="w-8 h-8 text-green-500 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="4" strokeDasharray="60" />
          </svg>
        )}
        {activeRide.status === "completed" && (
          <svg className="w-8 h-8 text-green-700" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" />
          </svg>
        )}
      </span>
      <div className="flex-1">
        <div
          key={activeRide.status} // trigger re-animation on status change
          className={`text-xl font-bold ${
            activeRide.status === "pending"
              ? "text-yellow-700"
              : activeRide.status === "completed"
              ? "text-green-700"
              : "text-black"
          } transition-opacity duration-500 ease-in-out`}
        >
          {activeRide.status === "pending" && "Waiting for drivers..."}
          {activeRide.status === "confirmed" && "Driver assigned. On the way!"}
          {activeRide.status === "ongoing" && "Enjoy your ride!"}
          {activeRide.status === "completed" && "Ride complete."}
          {activeRide?.status === "completed" && activeRide.payment_status !== "completed" && (
  <button
    className="mt-4 py-2 px-6 rounded bg-yellow-500 hover:bg-yellow-600 font-semibold"
    onClick={() => {
      setRideToPay(activeRide);
      setShowPaymentModal(true);
    }}
  >
    Pay Fare Now
  </button>
)}
{showPaymentModal && rideToPay && (
 <PaymentModal
  
  amount={rideToPay.fare}
  rideId={rideToPay.id}
  riderId={profile?.id}
  onClose={() => setShowPaymentModal(false)}
  onPaymentSuccess={handlePaymentSuccess}
  
/>

)}

{/* Place the Rate Driver modal here */}
    {showRateModal &&  rateRide && (
      <RateDriverModal
        ride={rateRide}
        riderId={profile?.id}
        onClose={() => {
            setRateRide(null);
            setShowRateModal(false);
            
            resetRideState();
        }}
        onRated={handleRated}
      />
    )}

        </div>
        <div className="text-gray-500 text-sm">
          From <span className="font-semibold">{activeRide.pickup}</span> to{" "}
          <span className="font-semibold">{activeRide.dropoff}</span>
        </div>
      </div>
      {(activeRide.status === "confirmed" || activeRide.status === "ongoing") &&
        activeRide.driver && (
          <div
            className="ml-4 flex items-center gap-3 opacity-0 animate-fadeIn"
            key={activeRide.driver.id} // force re-render & animation on driver change
          >
            <img
              src={activeRide.driver.profile_pic || "https://ui-avatars.com/api/?name=Driver"}
              alt="Driver"
              className="w-12 h-12 rounded-full border border-gray-300"
            />
            <span className="font-medium">{activeRide.driver.full_name || "Driver"}</span>
          </div>
        )}
    </div>
    {/* Cancel button only on 'pending' status */}
    {activeRide.status === "pending" && (
      <button
        className="mt-3 w-full text-center text-red-600 border border-red-400 rounded py-2 hover:bg-red-50 transition font-semibold"
        onClick={cancelRide}
      >
        Cancel Ride
      </button>
    )}
  </div>
)}



      </div>
      <div className="fixed top-4 right-4 space-y-2 z-50">
  {notifications.map((n) => (
    <div key={n.id} className="bg-white shadow-md border rounded-lg p-3 text-sm text-gray-800">
      {n.text}
    </div>
  ))}
</div>

    </div>
    {/* Toast notifications container */}
    {ToastContainer}
    </>
  );
}

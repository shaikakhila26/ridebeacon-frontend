import React ,{ useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useToasts } from "./Toasts";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DriverReviews from "./DriverReviews";
import { DriverAverageRating } from "./DriverAverageRating";




export default function DriverProfile({ onClose , requestPayout, earnings }) {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
 
    const [averageRating,setAverageRating] = useState(null);
  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [uploading, setUploading] = useState(false);
  const { addToast, ToastContainer } = useToasts();
   const [notifications, setNotifications] = useState([]);
   const API_URL = import.meta.env.VITE_API_URL;
    const [rideHistory, setRideHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);



  useEffect(() => {
    const fetchDriver = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (!error) {
        console.log("fetched driver:",data);
        setDriver(data);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setProfilePic(data.profile_pic || "");
      } else {
        console.error("Error fetching driver:", error);
      }

      setLoading(false);
    };

    fetchDriver();
  }, []);

  // Fetch ride history for driver
  useEffect(() => {

    if (!driver?.id) return;

    setLoadingHistory(true);

    async function fetchHistory() {

      const { data: { session } } = await supabase.auth.getSession();

      const token = session?.access_token;

      try {

        const res = await axios.get(`${API_URL}/api/rides/history`, {

          params: { userId: driver.id, role: "driver" },

          headers: { Authorization: `Bearer ${token}` }

        });

        setRideHistory(res.data);

      } catch {

        addToast("Failed to load ride history", { type: "error" });

      } finally {

        setLoadingHistory(false);

      }

    }

    fetchHistory();

    // eslint-disable-next-line

  }, [driver?.id]);

  // Upload profile pic to Supabase storage
const handleFileUpload = async (event) => {
  try {
    setUploading(true);
    const file = event.target.files[0];
    if (!file || !driver) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${driver.id}-${Date.now()}.${fileExt}`;

    // Upload with upsert (overwrite if exists)
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    // Update in DB
    const { error: updateError } = await supabase
      .from("users")
      .update({ profile_pic: publicUrl })
      .eq("id", driver.id);

    if (updateError) throw updateError;

    setProfilePic(publicUrl);
   addToast("Profile picture updated!", { type: "success" });
  } catch (error) {
    console.error("Upload failed:", error.message);
   addToast("Failed to upload image", { type: "error" });
  } finally {
    setUploading(false);
  }
};


  const handleUpdate = async () => {
    if (phone.length !== 10) {
    addToast("Phone number must be exactly 10 digits.", { type: "error" });
    return;
  }
    if (!driver) return;

    const { error, data } = await supabase
      .from("users")
      .update({
        full_name: fullName,
        phone,
        profile_pic: profilePic,
        updated_at: new Date(),
      })
      .eq("id", driver.id)
      .select()
      .single();

    if (error) {
      console.error("Update failed:", error);
      addToast("Could not update profile", { type: "error" });
      return;
    }

    console.log("fetched driver:",data);
    setDriver(data);
    setEditing(false);
    addToast("Profile updated successfully!", { type: "success" });
  };

// NEW: Fetch average rating for driver
 useEffect(() => {
  if (!driver?.id) return;

  async function fetchRating() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews/drivers/${driver.id}/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAverageRating(res.data.average_rating);
    } catch {
      setAverageRating(null);
    }
  }
  fetchRating();
}, [driver?.id]);

 

  if (loading) return null;
  if (!driver) return null;

  return (
    <>
    <div className="absolute inset-0 bg-black/60 flex justify-end z-50">
      <div className="w-80 bg-white h-full p-6 flex flex-col relative overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 text-xl"
        >
          ✕
        </button>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={profilePic || "https://via.placeholder.com/100"}
            alt="Driver"
            className="w-24 h-24 rounded-full border object-cover"
          />
          {editing && (
            <div className="mt-3 w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="w-full text-sm"
              />
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-1">
            {editing ? (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border rounded p-2 w-full"
              />
            ) : (
              driver.full_name
            )}
          </h2>
          <p className="text-sm text-gray-500">
            {editing ? (
  <input
    type="tel"
    placeholder="Enter 10-digit phone number"
    value={phone}
    maxLength={10}
    onChange={(e) => {
      const value = e.target.value;
      const onlyDigits = value.replace(/\D/g, "");  // Remove non-digits
      if (onlyDigits.length <= 10) {
        setPhone(onlyDigits);
      }
    }}
    className="border rounded p-2 w-full"
  />
) : (
  driver.phone || "No phone"
)}

          </p>
        </div>

        {/* Uber-style extras */}
        {!editing && (
          <>
            <div className="mb-6">
              
              <DriverAverageRating driverId={driver.id} />
            </div>
            <div className="mb-6">
              <h3 className="font-semibold mb-1">Vehicle</h3>
              <p className="text-gray-500">Not set</p>
            </div>
         <div className="mb-6">
  <h3 className="font-semibold mb-1">Earnings</h3>
   <p className="text-lg font-bold">₹{Number(earnings || 0).toFixed(2)}</p>
</div>

          </>
        )}

        <button
  onClick={() => navigate("/driver/trips")}
  className="bg-gray-200 px-4 py-2 rounded font-bold hover:bg-yellow-400"
>
  Trips
</button>


        {/* Action Buttons */}
        {editing ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleUpdate}
              className="w-full bg-yellow-400 py-3 rounded-xl font-bold"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="w-full bg-gray-200 py-3 rounded-xl font-bold"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setEditing(true)}
              className="w-full bg-yellow-400 py-3 rounded-xl font-bold"
            >
              Edit Profile
            </button>
            <button className="w-full bg-gray-200 py-3 rounded-xl font-bold">
              Support
            </button>
            <button
  onClick={async () => {
    await supabase.auth.signOut();
    navigate("/");
  }}
  className="mt-2 bg-gray-100 text-red-600 px-4 py-2 rounded hover:bg-gray-200 transition"
>
  Log Out
</button>

          </div>
        )}
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

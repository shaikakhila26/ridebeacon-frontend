// src/components/MapView.jsx
import React, { useEffect, useState, useMemo ,useRef} from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import polyline from "polyline";

const containerStyle = {
  width: "100%",
  height: "100vh",
  minHeight: 380,
};

// Define libraries once outside the component to prevent reload warnings
const libraries = ["places", "geometry"];

export default function MapView({ pickupLocation, dropoffLocation,userLocation, driverLocation , mapKey }) {
  const [mapRef, setMapRef] = useState(null);
  const [routePath, setRoutePath] = useState(null);
   const polylineRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Center the map on pickup first, then dropoff, then driver, else default location
  const center = useMemo(() => {
    if (pickupLocation) return pickupLocation;
    if (dropoffLocation) return dropoffLocation;
    if (userLocation) return userLocation;
    if (driverLocation) return driverLocation;
    return { lat: 12.9716, lng: 77.5946 };
  }, [pickupLocation, dropoffLocation, userLocation ,driverLocation]);

  // Fit map bounds to all visible points
  useEffect(() => {
    if (!mapRef) return;

    const bounds = new window.google.maps.LatLngBounds();
    let pointsAdded = false;

    [pickupLocation, dropoffLocation, driverLocation].forEach((loc) => {
      if (loc && loc.lat != null && loc.lng != null) {
        bounds.extend(loc);
        pointsAdded = true;
      }
    });

    if (pointsAdded) {
      mapRef.fitBounds(bounds);
    }
  }, [mapRef, pickupLocation, dropoffLocation, driverLocation]);

  // Fetch and decode route polyline from backend Directions API
  useEffect(() => {
    setRoutePath(null);
    
    async function fetchRoute() {
      if (!pickupLocation || !dropoffLocation) {
        
        return;
      }
      try {
        const origin = `${pickupLocation.lat},${pickupLocation.lng}`;
        const destination = `${dropoffLocation.lat},${dropoffLocation.lng}`;
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/directions?origin=${origin}&destination=${destination}`
        );
        const data = await res.json();

        if (data.polyline) {
          const decodedPath = polyline.decode(data.polyline).map(([lat, lng]) => ({ lat, lng }));
          setRoutePath(decodedPath);
        } 
        console.log("Polyline decoded and set");
      } catch (error) {
        console.error("Failed to fetch route:", error);
        setRoutePath(null);
      }
    }

    fetchRoute();
  }, [pickupLocation, dropoffLocation]);

    // Effect to remove lingering polyline overlay when routePath goes null
  useEffect(() => {
    // When routePath is falsy AND polylineRef has a Polyline on map, remove it
    if (!routePath &&mapRef && polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;

      if(userLocation) mapRef.setCenter(userLocation);
    }
  }, [routePath,mapRef,userLocation]);

  // Polyline onLoad handler to keep imperative reference
  const handlePolylineLoad = (poly) => {
    // Remove previous if exists
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }
    polylineRef.current = poly;
  };


  if (!isLoaded) {
    return <div className="h-64 w-full flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="w-full h-full">
      <GoogleMap
      key={mapKey}
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={setMapRef}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {pickupLocation && <Marker position={pickupLocation} label="P" />}
        {dropoffLocation && <Marker position={dropoffLocation} label="D" />}
        {driverLocation && (
          <Marker
            position={driverLocation}
            icon={{
              url: "/car-icon.png", // Use your custom car icon or fallback
              scaledSize: new window.google.maps.Size(36, 36),
            }}
            label=""
          />
        )}

        {routePath && ( 
          <Polyline
           key = {JSON.stringify(routePath)}
            path={routePath}
            onLoad ={handlePolylineLoad}
            options={{
              strokeColor: "#2F75FF", // Uber-like blue
              strokeOpacity: 0.9,
              strokeWeight: 6,
              clickable: false,
              zIndex: 10,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}

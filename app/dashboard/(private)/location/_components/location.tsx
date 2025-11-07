"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  LoadScriptNext as LoadScript,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/app/contextapi";
import LocationAdd from "./addlocation";
import toast from "react-hot-toast";
// import LocationAdd from "./locationadd/LocationAdd";

// Types
interface Coordinates {
  lat: number;
  lng: number;
}

interface ApiErrorResponse {
  error?: string;
}

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "400px",
};

const defaultCenter: Coordinates = {
  lat: 28.6139,
  lng: 77.209,
};

const Location = () => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || "";

  const { propertyId, userId } = useAppContext();

  console.log('useAppContext', propertyId);

  const [coordinates, setCoordinates] = useState<Coordinates>(defaultCenter);
  const [address, setAddress] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [landmark, setLandmark] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const isMounted = useRef<boolean>(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/property/edit/location/${propertyId}`);
        if (res.ok) {
          const data = await res.json();
          console.log('location data', data);

          const lat = typeof data.lat === "number" ? data.lat : parseFloat(data.lat) || defaultCenter.lat;
          const lng = typeof data.lng === "number" ? data.lng : parseFloat(data.lng) || defaultCenter.lng;
          if (isNaN(lat) || isNaN(lng)) throw new Error("Invalid coordinates");

          setCoordinates({ lat, lng });
          setAddress(data.address || "");
          setPincode(data.pincode || "");
          setLandmark(data.landmark || "");
          setCity(data.city || "");
        } else {
          console.warn("No location found in DB");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch location data");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) fetchLocation();
  }, [propertyId]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    if (mapRef.current) {
      google.maps.event.clearInstanceListeners(mapRef.current);
      mapRef.current = null;
    }
  }, []);

  const onAutocompleteLoad = useCallback((auto: google.maps.places.Autocomplete) => {
    autocompleteRef.current = auto;
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (!isMounted.current || !autocompleteRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const loc = place.geometry.location;
        const newCoords: Coordinates = { lat: loc.lat(), lng: loc.lng() };
        setCoordinates(newCoords);
        mapRef.current?.panTo(newCoords);
        setAddress(place.formatted_address || "");
        const comps = place.address_components || [];
        const cityComp = comps.find((c) => c.types.includes("locality") || c.types.includes("sublocality"));
        const pinComp = comps.find((c) => c.types.includes("postal_code"));
        setCity(cityComp?.long_name || "");
        setPincode(pinComp?.long_name || "");
      } else {
        setError("No location details available for this place.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch place details.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onMarkerDragEnd = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (!isMounted.current || !event.latLng) return;
    setLoading(true);
    setError(null);
    const newCoords: Coordinates = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    setCoordinates(newCoords);

    try {
      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newCoords.lat},${newCoords.lng}&key=${googleMapsApiKey}`
      );
      const data = await resp.json();
      if (data.results && data.results[0]) {
        setAddress(data.results[0].formatted_address || "");
        const comps = data.results[0].address_components || [];
        const cityComp = comps.find((c: any) => c.types.includes("locality"));
        const pinComp = comps.find((c: any) => c.types.includes("postal_code"));
        setCity(cityComp?.long_name || "");
        setPincode(pinComp?.long_name || "");
      } else {
        setError("No address found for these coordinates.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to reverse geocode.");
    } finally {
      setLoading(false);
    }
  }, [googleMapsApiKey]);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!isMounted.current) return;
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const res = await fetch(`/api/property/edit/location/${propertyId}`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         address,
  //         pincode,
  //         city,
  //         landmark,
  //         lat: coordinates.lat,
  //         lng: coordinates.lng,
  //       }),
  //     });

  //     const data = await res.json(); 
  //     console.log(data,'data');


  //     if (res.ok) {
  //       console.info("Location saved", data);
  //     } else {
  //       setError(data.error || "Failed to save location");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setError("Failed to save location");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMounted.current) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/history/location/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          userId,
          newLocation: {
            address,
            pincode,
            city,
            landmark,
            lat: coordinates.lat,
            lng: coordinates.lng,
          },
        }),
      });

      const json = await res.json();
      console.log("location history response", json);

      if (json.status) {
        toast.success(
          json.message || "Location changes submitted for approval"
        );
      } else {
        toast.error(json.message || "Failed to submit location changes");
      }
    } catch (err) {
      console.error("handleSubmit error", err);
      toast.error("Failed to submit location changes");
    } finally {
      setLoading(false);
    }
  };


  const renderLatitude = () => (typeof coordinates.lat === "number" ? coordinates.lat.toFixed(6) : "0.000000");
  const renderLongitude = () => (typeof coordinates.lng === "number" ? coordinates.lng.toFixed(6) : "0.000000");

  return (
    <div className="space-y-6 bg-white max-w-7xl mx-auto p-6 w-full">
      <h3 className="text-2xl font-semibold">Property Location</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Card */}
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle>Update location details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Ensure accuracy for guest convenience.</p>

            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            {loading && <p className="text-sm text-sky-600 mb-2">Loading...</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2" htmlFor="city">City</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Jaisalmer" disabled={loading} />
                </div>
                <div>
                  <Label className="mb-2" htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="10001" disabled={loading} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2" htmlFor="latitude">Latitude</Label>
                  <Input id="latitude" value={renderLatitude()} readOnly />
                </div>
                <div>
                  <Label className="mb-2" htmlFor="longitude">Longitude</Label>
                  <Input id="longitude" value={renderLongitude()} readOnly />
                </div>
              </div>

              <div>
                <Label className="mb-2" htmlFor="landmark">Landmark / Colony</Label>
                <Input id="landmark" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Enter landmark or colony" disabled={loading} />
              </div>

              <div>
                <Label className="mb-2" htmlFor="address">Address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main Street" disabled={loading} />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}
                  className="bg-blue-700 hover:bg-blue-800 flex items-center gap-2 cursor-pointer w-32"

                >
                  {loading ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Map Card */}
        <Card className="h-full border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-pulse text-sm">Loading map…</div>
              </div>
            ) : (
              googleMapsApiKey && (
                <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={["places"]} onError={(err) => setError("Failed to load Google Maps API.")}>
                  <div className="relative">
                    <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                      <div className="absolute w-full z-10 px-4 -top-10">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Search for a place"
                            className="w-full rounded-md border px-10 py-2 bg-white"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </Autocomplete>

                    <GoogleMap mapContainerStyle={containerStyle} center={coordinates} zoom={14} onLoad={onLoad} onUnmount={onUnmount}>
                      <Marker position={coordinates} draggable onDragEnd={onMarkerDragEnd} />
                    </GoogleMap>
                  </div>
                </LoadScript>
              )
            )}
          </CardContent>
        </Card>
      </div>
      <hr />
      <LocationAdd propertyId={propertyId} userId={userId} />
    </div>
  );
};

export default Location;

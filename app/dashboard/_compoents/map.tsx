"use client";

import * as React from "react";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";

type LatLng = { lat: number; lng: number };

type AddressDetails = {
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
};

const DEFAULT_CENTER: LatLng = { lat: 26.9157487, lng: 70.9083443 }; // fallback (Jaisalmer)

type Props = {
  lat?: number;
  lng?: number;
  onChange: (pos: LatLng, details?: AddressDetails) => void; // 👈 अब details भी देंगे
  height?: number | string;
  zoom?: number;
};

export default function MapPickerGoogle({
  lat,
  lng,
  onChange,
  height = 340,
  zoom = 12,
}: Props) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY ?? "";

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  // initial center
  const start: LatLng =
    typeof lat === "number" && typeof lng === "number"
      ? { lat, lng }
      : DEFAULT_CENTER;

  const [center, setCenter] = React.useState<LatLng>(start);
  const [markerPos, setMarkerPos] = React.useState<LatLng>(start);
  const autocompleteRef = React.useRef<google.maps.places.Autocomplete | null>(
    null
  );
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // sync props → state
  React.useEffect(() => {
    if (typeof lat === "number" && typeof lng === "number") {
      const next = { lat, lng };
      setCenter(next);
      setMarkerPos(next);
    }
  }, [lat, lng]);

  const containerStyle = React.useMemo(
    () => ({
      width: "100%",
      height: typeof height === "number" ? `${height}px` : height,
      position: "relative" as const,
      borderRadius: 12,
      overflow: "hidden",
    }),
    [height]
  );

  if (loadError)
    return <p style={{ color: "red" }}>Failed to load Google Maps.</p>;
  if (!isLoaded) return <p>Loading map…</p>;

  // map UI
  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
    clickableIcons: true,
    gestureHandling: "greedy",
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM,
    },
  };

  const setPoint = (pos: LatLng, details?: AddressDetails) => {
    setMarkerPos(pos);
    setCenter(pos);
    onChange(pos, details);
  };


const fetchAddressFromLatLng = async (
  pos: LatLng
): Promise<AddressDetails | undefined> => {
  if (!window.google) return;

  const geocoder = new google.maps.Geocoder();
  const result = await geocoder.geocode({ location: pos });
  if (!result.results[0]) return;

  const comps = result.results[0].address_components || [];
  const get = (type: string) =>
    comps.find((c) => c.types.includes(type))?.long_name || "";

  return {
    addressLine1: result.results[0].formatted_address,
    addressLine2: `${get("sublocality_level_1")} ${get("sublocality_level_2")}`.trim(),
    // 👇 yaha landmark agar mile to use karo, warna fallback address ka pehla part
    landmark:
      get("point_of_interest") ||
      get("premise") ||
      get("establishment") ||
      result.results[0].address_components?.[0]?.long_name ||
      "",
    locality: get("locality"),
    city: get("administrative_area_level_2") || get("locality"),
    state: get("administrative_area_level_1"),
    country: get("country"),
    pincode: get("postal_code"),
  };
};

const onMapClick = async (e: google.maps.MapMouseEvent) => {
  if (!e.latLng) return;
  const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
  const details = await fetchAddressFromLatLng(pos);
  setPoint(pos, details);
};


const onMarkerDragEnd = async (e: google.maps.MapMouseEvent) => {
  if (!e.latLng) return;
  const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
  const details = await fetchAddressFromLatLng(pos);
  setPoint(pos, details);
};

  const onPlaceChanged = () => {
    const ac = autocompleteRef.current;
    if (!ac) return;
    const place = ac.getPlace();
    const loc = place?.geometry?.location;
    if (!loc) return;

    const pos = { lat: loc.lat(), lng: loc.lng() };

    // Address components निकालना
    const comps = place.address_components || [];
    const get = (type: string) =>
      comps.find((c) => c.types.includes(type))?.long_name || "";

    const details: AddressDetails = {
      addressLine1: place.name || "",
      addressLine2: `${get("sublocality_level_1")} ${get("sublocality_level_2")}`.trim(),
      landmark: get("point_of_interest"),
      locality: get("locality"),
      city: get("administrative_area_level_2") || get("locality"),
      state: get("administrative_area_level_1"),
      country: get("country"),
      pincode: get("postal_code"),
    };

    setPoint(pos, details);
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${markerPos.lat},${markerPos.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Search box overlay */}
      <div
        style={{
          position: "absolute",
          zIndex: 2,
          top: 12,
          left: 12,
          right: 12,
          display: "flex",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        <div style={{ flex: 1, maxWidth: 520, pointerEvents: "auto" }}>
          <Autocomplete
            onLoad={(ac) => (autocompleteRef.current = ac)}
            onPlaceChanged={onPlaceChanged}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Search a place or address"
              style={{
                width: "100%",
                height: 40,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                outline: "none",
                boxShadow:
                  "0 6px 16px rgba(2, 6, 23, 0.06), 0 1px 2px rgba(2, 6, 23, 0.06)",
                background: "#fff",
              }}
            />
          </Autocomplete>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onClick={onMapClick}
      >
        <Marker
          position={markerPos}
          draggable
          onDragEnd={onMarkerDragEnd}
          title="Drag to adjust position"
        />
      </GoogleMap>

      {/* Footer */}
      <div
        style={{
          marginTop: 8,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={openInGoogleMaps}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Open in Google Maps
        </button>
      </div>
    </div>
  );
}

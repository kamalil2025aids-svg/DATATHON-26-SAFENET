import { useState, useEffect, useCallback } from "react";

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  source: "GPS" | "Manual Map Selection";
}

interface GeolocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: true,
    error: null,
  });

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
          },
        }
      );
      if (!response.ok) throw new Error("Reverse geocoding failed");
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (err) {
      console.error("Geocoding error:", err);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const requestLocation = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (typeof window !== "undefined" && !window.isSecureContext) {
      console.error("Geolocation Error: Insecure Context");
      console.error("window.isSecureContext:", window.isSecureContext);
      console.error("window.location.origin:", window.location.origin);
      setState({
        location: null,
        loading: false,
        error: "Current location cannot be accessed because the app is not running in a secure context (HTTPS)."
      });
      return;
    }

    if (!navigator.geolocation) {
      console.error("Geolocation Error: Not Supported");
      setState({
        location: null,
        loading: false,
        error: "Current location cannot be accessed because geolocation is not supported by your browser."
      });
      return;
    }

    const onSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const address = await reverseGeocode(latitude, longitude);
      setState({
        location: { lat: latitude, lng: longitude, address, source: "GPS" },
        loading: false,
        error: null,
      });
    };

    const onError = async (err: GeolocationPositionError) => {
      console.error("Geolocation Error Code:", err.code);
      console.error("Geolocation Error Message:", err.message);
      console.error("window.isSecureContext:", window.isSecureContext);
      console.error("window.location.origin:", window.location.origin);
      
      try {
        const permissionState = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        console.error("navigator.permissions state:", permissionState.state);
      } catch (e) {
        console.error("navigator.permissions state: Unable to query", e);
      }

      let errorMessage = "Current location cannot be accessed because browser permission was denied.";
      if (err.code === 2) {
        errorMessage = "Current location cannot be accessed because the position is unavailable.";
      } else if (err.code === 3) {
        errorMessage = "Current location cannot be accessed because the request timed out.";
      }

      setState({
        location: null,
        loading: false,
        error: errorMessage,
      });
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  }, []);

  const setManualLocation = useCallback(async (lat: number, lng: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const address = await reverseGeocode(lat, lng);
    setState({
      location: { lat, lng, address, source: "Manual Map Selection" },
      loading: false,
      error: null,
    });
  }, []);

  // Automatically request location permission immediately after loading
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { ...state, requestLocation, setManualLocation };
}
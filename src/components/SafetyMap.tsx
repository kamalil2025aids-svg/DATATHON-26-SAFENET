import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Navigation, MapPin, Crosshair } from "lucide-react";
import { useComplaints } from "@/components/ComplaintContext";

export function SafetyMap() {
  const { complaints } = useComplaints();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if geolocation is supported and allowed by permissions policy
    if (!navigator.geolocation || typeof navigator.geolocation.getCurrentPosition !== 'function') {
      setError("Geolocation is not supported or disabled in this environment.");
      setLoading(false);
      return;
    }

    let timeoutId = setTimeout(() => {
      setError("Location request timed out. Please set your location manually.");
      setLoading(false);
    }, 6000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLoading(false);
      },
      (err) => {
        clearTimeout(timeoutId);
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  const handleManualSetLocation = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Simulate setting lat/lng based on click position relative to center
    const lat = (y - 50) / 100;
    const lng = (x - 50) / 100;
    
    setUserLocation({ lat, lng });
    setError(null);
  };

  if (loading) {
    return (
      <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <CardContent className="flex h-[600px] flex-col items-center justify-center text-center">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-sm text-slate-400">Fetching your current location...</p>
          <p className="mt-1 text-xs text-slate-500">Please allow location access in your browser.</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !userLocation) {
    return (
      <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <CardContent className="flex h-[600px] flex-col items-center justify-center text-center p-6">
          <AlertTriangle className="mb-4 h-8 w-8 text-amber-400" />
          <p className="text-sm text-slate-400">Unable to retrieve your location automatically.</p>
          <p className="mt-1 text-xs text-slate-500 mb-4">{error || "Permission denied."}</p>
          <p className="text-xs text-cyan-400 mb-4">Click on the map below to set your location manually.</p>
          
          {/* Manual Map Picker */}
          <div 
            onClick={handleManualSetLocation}
            className="relative w-full max-w-md h-64 rounded-xl border border-white/10 bg-[#0a0f1c] cursor-pointer overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/20"></div>
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/15"></div>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Crosshair className="h-8 w-8 text-cyan-400/50 group-hover:text-cyan-400 transition" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
      <CardContent className="relative h-[600px] w-full overflow-hidden rounded-xl p-0">
        {/* Radar Grid Background */}
        <div className="absolute inset-0 bg-[#0a0f1c]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
          
          {/* Radar Rings */}
          <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/20"></div>
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/15"></div>
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/10"></div>
        </div>

        {/* User Location Marker */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative flex h-4 w-4 items-center justify-center">
            <span className="absolute h-4 w-4 animate-ping rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative h-3 w-3 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30"></span>
          </div>
        </div>

        {/* Real Complaints Markers */}
        {complaints.map((c) => {
          // Calculate position relative to center based on lat/lng difference
          const latDiff = c.location.lat - userLocation.lat;
          const lngDiff = c.location.lng - userLocation.lng;
          
          // Map differences to percentages
          const x = 50 + (lngDiff * 5000); 
          const y = 50 + (latDiff * 5000);
          
          if (x < -10 || x > 110 || y < -10 || y > 110) return null;

          const colorMap: Record<string, string> = {
            "Low": "#eab308",
            "Medium": "#f97316",
            "High": "#ef4444",
            "Critical": "#dc2626",
          };
          const color = colorMap[c.severity || "Low"] || "#eab308";

          return (
            <div
              key={c.id}
              className="absolute z-5"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="group relative flex items-center justify-center">
                <div className="absolute h-12 w-12 rounded-full opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: color }}></div>
                <div className="relative h-3 w-3 rounded-full ring-2 ring-white/20" style={{ backgroundColor: color }}></div>
                
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-20">
                  <div className="rounded-lg border border-white/10 bg-[#050816] px-3 py-2 text-center shadow-xl">
                    <p className="text-xs font-medium text-white">{c.category}</p>
                    <p className="text-[10px] text-slate-400">Severity: {c.severity || "Pending"}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Coordinates Overlay */}
        <div className="absolute bottom-4 left-4 z-20 rounded-lg border border-white/10 bg-[#050816]/80 px-3 py-2 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Navigation className="h-3 w-3 text-cyan-400" />
            <span className="font-mono">
              {userLocation.lat.toFixed(4)}° N, {userLocation.lng.toFixed(4)}° E
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 z-20 rounded-lg border border-white/10 bg-[#050816]/80 p-3 backdrop-blur-md">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">Safety Levels</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <span className="text-xs text-slate-300">Critical/High</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500"></span>
              <span className="text-xs text-slate-300">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
              <span className="text-xs text-slate-300">Low</span>
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-8 z-10">
          <p className="text-[10px] font-medium uppercase tracking-wider text-cyan-400/80">You are here</p>
        </div>
      </CardContent>
    </Card>
  );
}
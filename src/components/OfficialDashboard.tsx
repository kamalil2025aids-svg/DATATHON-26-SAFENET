import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthContext";
import { useComplaints, Complaint } from "@/components/ComplaintContext";
import { toast } from "sonner";
import {
  LayoutDashboard, FileText, Map as MapIcon, User, ShieldCheck,
  CheckCircle2, AlertTriangle, Activity, MapPin, Clock, Building2, ArrowRightCircle, Loader2
} from "lucide-react";

const navItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "queue", label: "Complaint Queue", icon: FileText },
  { id: "map", label: "Live Map", icon: MapIcon },
  { id: "profile", label: "Profile", icon: User },
];

const departments = ["All", "Municipal Corporation", "Public Works", "Electricity Board", "Water Board", "Fire Department", "Traffic Police"];

export function OfficialDashboard() {
  const { user, logout } = useAuth();
  const { complaints, updateComplaintStatus } = useComplaints();
  const [activeView, setActiveView] = useState("overview");
  const [filterDept, setFilterDept] = useState("All");

  return (
    <div className="flex min-h-screen bg-[#050816] text-slate-100">
      <aside className="hidden w-64 flex-col border-r border-white/5 bg-white/[0.02] p-4 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 ring-1 ring-cyan-400/20">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
          </div>
          <span className="font-sans text-lg font-bold tracking-tight text-white">Safe<span className="text-cyan-400">Net</span></span>
        </div>
        
        <div className="mb-6 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2">
          <p className="text-xs font-medium text-cyan-400">Official Portal</p>
          <p className="mt-0.5 truncate text-xs text-slate-400">{user?.email}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                activeView === item.id
                  ? "bg-cyan-400/10 text-cyan-400 ring-1 ring-cyan-400/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-1 ring-white/10">
              <AvatarFallback className="bg-cyan-400/10 text-cyan-400">{user?.name?.[0] || "O"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.name || "Official"}</p>
              <p className="truncate text-xs text-slate-400">Gov. Officer</p>
            </div>
          </div>
          <Button onClick={logout} variant="outline" size="sm" className="mt-3 w-full border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white">
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="flex items-center justify-between border-b border-white/5 p-4 md:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
            <span className="font-sans text-lg font-bold tracking-tight text-white">Safe<span className="text-cyan-400">Net</span> <span className="text-xs text-cyan-400">Official</span></span>
          </div>
          <Avatar className="h-8 w-8 ring-1 ring-white/10">
            <AvatarFallback className="bg-cyan-400/10 text-cyan-400 text-xs">{user?.name?.[0] || "O"}</AvatarFallback>
          </Avatar>
        </header>

        <div className="p-4 pb-20 md:p-8 md:pb-8">
          {activeView === "overview" && <OfficialOverview complaints={complaints} />}
          {activeView === "queue" && (
            <ComplaintQueue 
              complaints={complaints} 
              filterDept={filterDept} 
              setFilterDept={setFilterDept} 
              updateComplaintStatus={updateComplaintStatus} 
            />
          )}
          {activeView === "map" && <OfficialMap complaints={complaints} />}
          {activeView === "profile" && <OfficialProfile />}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 border-t border-white/5 bg-[#050816]/90 backdrop-blur-lg md:hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition ${
                activeView === item.id ? "text-cyan-400" : "text-slate-500"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}

function OfficialOverview({ complaints }: { complaints: Complaint[] }) {
  const pending = complaints.filter(c => c.status === "Submitted" || c.status === "Verified").length;
  const inProgress = complaints.filter(c => c.status === "Assigned" || c.status === "In Progress").length;
  const resolved = complaints.filter(c => c.status === "Completed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-white md:text-3xl">Government Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Monitor city-wide complaints and department performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Complaints" value={complaints.length} icon={FileText} color="text-cyan-400" />
        <StatCard title="Pending Review" value={pending} icon={AlertTriangle} color="text-amber-400" />
        <StatCard title="In Progress" value={inProgress} icon={Activity} color="text-blue-400" />
        <StatCard title="Resolved" value={resolved} icon={CheckCircle2} color="text-emerald-400" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Recent Submissions</CardTitle>
            <CardDescription className="text-slate-400">Latest complaints from citizens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {complaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="mb-2 h-8 w-8 text-slate-500" />
                <p className="text-sm text-slate-400">No complaints submitted yet.</p>
              </div>
            ) : (
              complaints.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{c.category}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-400">
                        <Building2 className="h-3 w-3" /> {c.department || "Unassigned"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.severity && <Badge variant="outline" className="border-red-400/20 bg-red-400/5 text-red-400">{c.severity}</Badge>}
                    <Badge variant="outline" className="border-cyan-400/20 bg-cyan-400/5 text-cyan-400">{c.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Department Load</CardTitle>
            <CardDescription className="text-slate-400">Active complaints by dept</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {departments.slice(1).map(dept => {
              const count = complaints.filter(c => c.department === dept && c.status !== "Completed").length;
              return (
                <div key={dept} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{dept}</span>
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">{count}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ComplaintQueue({ 
  complaints, 
  filterDept, 
  setFilterDept, 
  updateComplaintStatus 
}: { 
  complaints: Complaint[], 
  filterDept: string, 
  setFilterDept: (d: string) => void, 
  updateComplaintStatus: (id: string, status: Complaint["status"]) => void 
}) {
  const filtered = filterDept === "All" 
    ? complaints 
    : complaints.filter(c => c.department === filterDept);

  const handleStatusUpdate = (id: string, status: Complaint["status"]) => {
    updateComplaintStatus(id, status);
    toast.success(`Complaint marked as ${status}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-white md:text-3xl">Complaint Queue</h1>
        <p className="mt-1 text-sm text-slate-400">Review and manage incoming complaints.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setFilterDept(dept)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              filterDept === dept
                ? "bg-cyan-400 text-[#050816]"
                : "border border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/5"
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-3 h-10 w-10 text-slate-500" />
              <p className="text-sm text-slate-400">No complaints in this category.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((c) => (
            <Card key={c.id} className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{c.category}</h3>
                        {c.severity && <Badge variant="outline" className="border-red-400/20 bg-red-400/5 text-red-400">{c.severity}</Badge>}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" /> {c.location.address}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <Building2 className="h-3 w-3" /> {c.department || "Unassigned"}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" /> {new Date(c.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-2 text-sm text-slate-300">{c.description}</p>
                      {c.images && c.images.length > 0 && (
                        <div className="mt-3 flex gap-2">
                          {c.images.map((img: string, i: number) => (
                            <div key={i} className="h-16 w-16 overflow-hidden rounded-md border border-white/10">
                              <img src={img} alt={`Report ${i}`} className="h-full w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <Badge variant="outline" className="border-cyan-400/20 bg-cyan-400/5 text-cyan-400">{c.status}</Badge>
                    <div className="mt-2 flex flex-col gap-2">
                      {c.status === "Submitted" || c.status === "Verified" ? (
                        <Button size="sm" onClick={() => handleStatusUpdate(c.id, "Assigned")} className="bg-cyan-400 text-[#050816] hover:bg-cyan-300">
                          <ArrowRightCircle className="mr-1 h-3 w-3" /> Assign
                        </Button>
                      ) : c.status === "Assigned" ? (
                        <Button size="sm" onClick={() => handleStatusUpdate(c.id, "In Progress")} className="bg-blue-400 text-[#050816] hover:bg-blue-300">
                          Start Work
                        </Button>
                      ) : c.status === "In Progress" ? (
                        <Button size="sm" onClick={() => handleStatusUpdate(c.id, "Completed")} className="bg-emerald-400 text-[#050816] hover:bg-emerald-300">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Complete
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Custom Map Component using OpenStreetMap Static Tiles API
function OfficialMap({ complaints }: { complaints: Complaint[] }) {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation || typeof navigator.geolocation.getCurrentPosition !== 'function') {
      setCenter({ lat: 13.0827, lng: 80.2707 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => setCenter({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => setCenter({ lat: 13.0827, lng: 80.2707 })
    );
  }, []);

  if (!center) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const zoom = 12;
  const tileSize = 256;
  const n = Math.pow(2, zoom);
  const centerX = (center.lng + 180) / 360 * n * tileSize;
  const centerY = (1 - Math.log(Math.tan(center.lat * Math.PI / 180) + 1 / Math.cos(center.lat * Math.PI / 180)) / Math.PI) / 2 * n * tileSize;

  const mapWidth = 800;
  const mapHeight = 600;

  const startTileX = Math.floor((centerX - mapWidth / 2) / tileSize);
  const endTileX = Math.floor((centerX + mapWidth / 2) / tileSize);
  const startTileY = Math.floor((centerY - mapHeight / 2) / tileSize);
  const endTileY = Math.floor((centerY + mapHeight / 2) / tileSize);

  const tiles = [];
  for (let x = startTileX; x <= endTileX; x++) {
    for (let y = startTileY; y <= endTileY; y++) {
      const tileX = x * tileSize;
      const tileY = y * tileSize;
      const offsetX = tileX - (centerX - mapWidth / 2);
      const offsetY = tileY - (centerY - mapHeight / 2);
      const wrappedX = ((x % n) + n) % n;
      
      tiles.push(
        <img
          key={`${x}-${y}`}
          src={`https://a.tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`}
          style={{
            position: 'absolute',
            left: `${offsetX}px`,
            top: `${offsetY}px`,
            width: `${tileSize}px`,
            height: `${tileSize}px`,
            filter: 'invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.8) saturate(0.8)'
          }}
          alt="Map tile"
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-white md:text-3xl">Live City Map</h1>
        <p className="mt-1 text-sm text-slate-400">Real-time visualization of active complaints.</p>
      </div>
      <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <CardContent className="relative h-[600px] w-full overflow-hidden rounded-xl p-0">
          <div className="relative h-full w-full" style={{ width: '100%', height: '100%' }}>
            <div className="absolute inset-0" style={{ width: `${mapWidth}px`, height: `${mapHeight}px`, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
              {tiles}
              
              {complaints.map((c) => {
                const cN = Math.pow(2, zoom);
                const cX = (c.location.lng + 180) / 360 * cN * tileSize;
                const cY = (1 - Math.log(Math.tan(c.location.lat * Math.PI / 180) + 1 / Math.cos(c.location.lat * Math.PI / 180)) / Math.PI) / 2 * cN * tileSize;
                
                const markerX = cX - (centerX - mapWidth / 2);
                const markerY = cY - (centerY - mapHeight / 2);

                if (markerX < 0 || markerX > mapWidth || markerY < 0 || markerY > mapHeight) return null;

                const colorMap: Record<string, string> = {
                  "Low": "#eab308", "Medium": "#f97316", "High": "#ef4444", "Critical": "#dc2626",
                };
                const color = colorMap[c.severity || "Low"] || "#eab308";

                return (
                  <div key={c.id} className="absolute group" style={{ left: `${markerX}px`, top: `${markerY}px`, transform: 'translate(-50%, -50%)', zIndex: 500 }}>
                    <div className="relative flex items-center justify-center">
                      <div className="absolute h-8 w-8 rounded-full opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: color }}></div>
                      <div className="relative h-3 w-3 rounded-full ring-2 ring-white/20" style={{ backgroundColor: color }}></div>
                      <div className="absolute bottom-full mb-2 hidden group-hover:block z-[1000]">
                        <div className="rounded-lg border border-white/10 bg-[#050816] px-3 py-2 text-center shadow-xl">
                          <p className="text-xs font-medium text-white">{c.category}</p>
                          <p className="text-[10px] text-slate-400">Status: {c.status}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OfficialProfile() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-white md:text-3xl">Officer Profile</h1>
        <p className="mt-1 text-sm text-slate-400">Manage your official account.</p>
      </div>
      <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
            <Avatar className="h-20 w-20 ring-2 ring-cyan-400/20">
              <AvatarFallback className="bg-cyan-400/10 text-2xl font-bold text-cyan-400">{user?.name?.[0] || "O"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-sans text-xl font-bold text-white">{user?.name || "Officer"}</h2>
              <p className="mt-1 text-sm text-slate-400">{user?.email || "official@city.gov"}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                <Badge variant="outline" className="border-cyan-400/20 bg-cyan-400/5 text-cyan-400">
                  <ShieldCheck className="mr-1 h-3 w-3" /> Government Official
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
  return (
    <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-1 font-sans text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.02] ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}
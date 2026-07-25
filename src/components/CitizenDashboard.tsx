import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthContext";
import { useComplaints } from "@/components/ComplaintContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import {
  LayoutDashboard, FileText, Map as MapIcon, Bell, User, PlusCircle,
  CheckCircle2, XCircle, ShieldCheck, AlertTriangle, Activity, MapPin, UploadCloud, X, Loader2, Navigation, Crosshair
} from "lucide-react";

const navItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "submit", label: "Report Issue", icon: PlusCircle },
  { id: "history", label: "My Reports", icon: FileText },
  { id: "map", label: "Safety Map", icon: MapIcon },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "profile", label: "Profile", icon: User },
];

export function CitizenDashboard() {
  const { user, logout } = useAuth();
  const { complaints, addComplaint, verifyComplaint } = useComplaints();
  const [activeView, setActiveView] = useState("overview");

  return (
    <div className="flex min-h-screen bg-[#050816] text-slate-100">
      <aside className="hidden w-64 flex-col border-r border-white/5 bg-white/[0.02] p-4 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 ring-1 ring-cyan-400/20">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
          </div>
          <span className="font-sans text-lg font-bold tracking-tight text-white">Safe<span className="text-cyan-400">Net</span></span>
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
              <AvatarFallback className="bg-cyan-400/10 text-cyan-400">{user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.name || "Citizen"}</p>
              <p className="truncate text-xs text-slate-400">{user?.email || "user@domain.com"}</p>
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
            <span className="font-sans text-lg font-bold tracking-tight text-white">Safe<span className="text-cyan-400">Net</span></span>
          </div>
          <Avatar className="h-8 w-8 ring-1 ring-white/10">
            <AvatarFallback className="bg-cyan-400/10 text-cyan-400 text-xs">{user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </header>

        <div className="p-4 pb-20 md:p-8 md:pb-8">
          {activeView === "overview" && <OverviewView complaints={complaints} verifyComplaint={verifyComplaint} />}
          {activeView === "submit" && <SubmitComplaintView addComplaint={addComplaint} setActiveView={setActiveView} />}
          {activeView === "history" && <HistoryView complaints={complaints} />}
          {activeView === "map" && <MapView complaints={complaints} />}
          {activeView === "notifications" && <NotificationsView complaints={complaints} />}
          {activeView === "profile" && <ProfileView />}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-white/5 bg-[#050816]/90 backdrop-blur-lg md:hidden">
          {navItems.slice(0, 5).map((item) => (
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

function OverviewView({ complaints, verifyComplaint }: { complaints: any[], verifyComplaint: (id: string) => void }) {
  const { user, updateUserPoints } = useAuth();
  const myReports = complaints.filter(c => c.userId === user?.id).length;
  const resolved = complaints.filter(c => c.status === "Completed").length;
  const pending = complaints.filter(c => c.status !== "Completed").length;
  const pendingVerifications = complaints.filter(c => c.userId !== user?.id && c.verifications < 3 && c.status === "Submitted");

  const handleVerify = (id: string) => {
    if (!user) return;
    verifyComplaint(id);
    updateUserPoints(user.id, 10, 1);
    toast.success("Verification submitted! +10 Points", {
      description: "Thank you for helping keep your community safe."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-white md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Monitor your reports and local safety metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Reports" value={myReports} icon={FileText} color="text-cyan-400" />
        <StatCard title="Resolved" value={resolved} icon={CheckCircle2} color="text-emerald-400" />
        <StatCard title="Pending" value={pending} icon={AlertTriangle} color="text-amber-400" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-slate-400">Your latest submitted reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {complaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="mb-2 h-8 w-8 text-slate-500" />
                  <p className="text-sm text-slate-400">No reports yet. Submit a new complaint to see it here.</p>
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
                        <p className="text-xs text-slate-400">{c.location.address || "Unknown location"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-cyan-400/20 bg-cyan-400/5 text-cyan-400">{c.status}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Area Safety Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-cyan-400/20">
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 border-r-cyan-400/50" style={{ transform: 'rotate(45deg)' }}></div>
                <div className="text-center">
                  <span className="font-sans text-3xl font-bold text-cyan-400">100</span>
                  <span className="block text-xs text-slate-400">/ 100</span>
                </div>
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                <ShieldCheck className="h-4 w-4" /> Level: Secure
              </p>
              <p className="mt-1 text-xs text-slate-400">No issues reported nearby</p>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Community Verification</CardTitle>
              <CardDescription className="text-slate-400">Help verify nearby reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingVerifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-400" />
                  <p className="text-sm text-slate-400">No reports need verification right now.</p>
                </div>
              ) : (
                pendingVerifications.map((item) => (
                  <div key={item.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <p className="text-sm font-medium text-white">{item.category}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3 w-3" /> {item.location.address}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Progress value={(item.verifications / 3) * 100} className="h-1.5 flex-1 bg-white/5" />
                      <span className="text-xs text-slate-400">{item.verifications}/3</span>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleVerify(item.id)}
                      className="mt-3 w-full bg-cyan-400 text-[#050816] hover:bg-cyan-300"
                    >
                      Verify Report
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
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

function SubmitComplaintView({ addComplaint, setActiveView }: { addComplaint: (data: any) => void, setActiveView: (id: string) => void }) {
  const { user } = useAuth();
  const { location, loading, error, requestLocation } = useGeolocation();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    if (!description && images.length === 0) {
      toast.error("Please upload an image or enter a description first.");
      return;
    }
    const text = description.toLowerCase();
    let severity = "Low";
    let department = "Municipal Corporation";
    
    if (text.includes("fire") || text.includes("smoke")) {
      severity = "Critical"; department = "Fire Department";
    } else if (text.includes("pothole") || text.includes("road")) {
      severity = "Medium"; department = "Public Works";
    } else if (text.includes("light") || text.includes("electric")) {
      severity = "Medium"; department = "Electricity Board";
    } else if (text.includes("water") || text.includes("leak")) {
      severity = "High"; department = "Water Board";
    }

    setAiAnalysis({
      severity,
      confidence: Math.floor(Math.random() * 20) + 80,
      department,
      resolutionTime: Math.floor(Math.random() * 48) + 12,
    });
    toast.success("AI Analysis Complete");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !description || !category) {
      toast.error("Please fill all required fields and ensure location is detected.");
      return;
    }
    addComplaint({
      userId: user?.id || "unknown",
      category, 
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        source: location.source
      },
      description, images,
      voiceNote: null,
      severity: aiAnalysis?.severity || null,
      department: aiAnalysis?.department || null,
      confidence: aiAnalysis?.confidence || null,
      resolutionTime: aiAnalysis?.resolutionTime || null,
    });
    toast.success("Complaint Submitted Successfully! (+50 Points)");
    setCategory(""); setDescription(""); setAiAnalysis(null); setImages([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-white md:text-3xl">Report New Issue</h1>
        <p className="mt-1 text-sm text-slate-400">Submit a complaint with AI-powered analysis.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Complaint Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Category</label>
              <div className="flex flex-wrap gap-2">
                {["Pothole", "Streetlight", "Garbage", "Water Leak", "Traffic", "Fire", "Other"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      category === cat
                        ? "bg-cyan-400 text-[#050816]"
                        : "border border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Location</label>
              <div className="flex items-center gap-2">
                <input
                  value={loading ? "Detecting current location..." : location?.address || ""}
                  placeholder={error ? error : "Click the GPS icon to detect location"}
                  readOnly
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/50 ${
                    error ? "border-amber-400/30 bg-amber-400/5 text-amber-400 placeholder:text-amber-400/70" : "border-white/5 bg-white/[0.02] text-white placeholder:text-slate-500"
                  }`}
                />
                <Button type="button" onClick={requestLocation} disabled={loading} variant="outline" size="sm" className="border-cyan-400/20 bg-cyan-400/5 text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                </Button>
              </div>
              {error && <p className="text-xs text-amber-400/80">{error}</p>}
              {location && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="border-cyan-400/20 bg-cyan-400/5 text-cyan-400">
                    Source: {location.source}
                  </Badge>
                  <Button type="button" size="sm" variant="outline" onClick={() => setActiveView("map")} className="border-cyan-400/20 bg-cyan-400/5 text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300">
                    <MapIcon className="mr-2 h-4 w-4" /> Open Map
                  </Button>
                </div>
              )}
              {!location && (
                <Button type="button" size="sm" variant="outline" onClick={() => setActiveView("map")} className="mt-2 border-cyan-400/20 bg-cyan-400/5 text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300">
                  <MapIcon className="mr-2 h-4 w-4" /> Open Map
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="w-full rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Upload Images</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative rounded-lg border border-dashed p-6 text-center transition ${
                  isDragging ? "border-cyan-400 bg-cyan-400/5" : "border-white/10 bg-white/[0.01]"
                }`}
              >
                <UploadCloud className="mx-auto mb-2 h-8 w-8 text-slate-500" />
                <p className="text-sm text-slate-400">Drag & drop images here, or click to browse</p>
                <p className="mt-1 text-xs text-slate-500">Supported: JPG, PNG, WEBP</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {images.map((img, index) => (
                    <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border border-white/10">
                      <img src={img} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={handleAnalyze} variant="outline" className="border-cyan-400/20 bg-cyan-400/5 text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300">
                Analyze with AI
              </Button>
              <Button type="button" onClick={handleSubmit} className="bg-cyan-400 text-[#050816] hover:bg-cyan-300">
                Submit Complaint
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">AI Analysis</CardTitle>
            <CardDescription className="text-slate-400">Predicted severity and routing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiAnalysis ? (
              <>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-sm text-slate-400">Severity</span>
                  <Badge variant="outline" className="border-red-400/20 bg-red-400/5 text-red-400">{aiAnalysis.severity}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-sm text-slate-400">Confidence</span>
                  <span className="text-sm font-medium text-cyan-400">{aiAnalysis.confidence}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-sm text-slate-400">Department</span>
                  <span className="text-sm font-medium text-white">{aiAnalysis.department}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-sm text-slate-400">Est. Resolution</span>
                  <span className="text-sm font-medium text-white">{aiAnalysis.resolutionTime}h</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="mb-2 h-8 w-8 text-slate-500" />
                <p className="text-sm text-slate-400">Click "Analyze with AI" to predict severity and route the complaint.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HistoryView({ complaints }: { complaints: any[] }) {
  const { user } = useAuth();
  const myComplaints = complaints.filter(c => c.userId === user?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-white md:text-3xl">My Reports</h1>
        <p className="mt-1 text-sm text-slate-400">Track the status of your submitted complaints.</p>
      </div>
      
      <div className="space-y-4">
        {myComplaints.length === 0 ? (
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-3 h-10 w-10 text-slate-500" />
              <p className="text-sm text-slate-400">You haven't submitted any reports yet.</p>
            </CardContent>
          </Card>
        ) : (
          myComplaints.map((c) => (
            <Card key={c.id} className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{c.category}</h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" /> {c.location.address}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{c.description}</p>
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
                    {c.severity && <Badge variant="outline" className="border-red-400/20 bg-red-400/5 text-red-400">{c.severity}</Badge>}
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
function MapView({ complaints }: { complaints: any[] }) {
  const { location, loading, error, requestLocation, setManualLocation } = useGeolocation();
  const [zoom, setZoom] = useState(13);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  if (loading || !location) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-white md:text-3xl">Safety Map</h1>
          <p className="mt-1 text-sm text-slate-400">Interactive map of local safety issues around you. Click anywhere to recenter.</p>
        </div>
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
          <CardContent className="relative h-[600px] w-full overflow-hidden rounded-xl p-0">
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4 text-center">
              {error ? (
                <>
                  <AlertTriangle className="h-8 w-8 text-amber-400" />
                  <p className="text-sm text-amber-400">{error}</p>
                  <Button onClick={requestLocation} disabled={loading} variant="outline" size="sm" className="border-cyan-400/20 bg-cyan-400/5 text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300">
                    <Navigation className="mr-2 h-4 w-4" /> Request Permission Again
                  </Button>
                </>
              ) : (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                  <p className="text-sm text-slate-400">Loading map data...</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert Lat/Lng to Pixel Coordinates for OSM Slippy Map
  const tileSize = 256;
  const n = Math.pow(2, zoom);
  const centerX = (location.lng + 180) / 360 * n * tileSize;
  const centerY = (1 - Math.log(Math.tan(location.lat * Math.PI / 180) + 1 / Math.cos(location.lat * Math.PI / 180)) / Math.PI) / 2 * n * tileSize;

  const mapWidth = mapContainerRef.current?.clientWidth || 800;
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
      
      // OSM requires wrapping tile X coordinates
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
            filter: 'invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.8) saturate(0.8)' // Dark mode filter
          }}
          alt="Map tile"
        />
      );
    }
  }

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert Pixel coordinates back to Lat/Lng
    const lng = (x / tileSize) * (360 / n) - 180;
    const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y / tileSize) / n))) * 180 / Math.PI;
    
    setManualLocation(lat, lng);
    toast.success(`Location updated manually to ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-white md:text-3xl">Safety Map</h1>
        <p className="mt-1 text-sm text-slate-400">Interactive map of local safety issues around you. Click anywhere to recenter.</p>
      </div>
      <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <CardContent className="relative h-[600px] w-full overflow-hidden rounded-xl p-0">
          <div className="relative h-full w-full" style={{ width: '100%', height: '100%' }} ref={mapContainerRef}>
            <div 
              className="absolute inset-0 cursor-crosshair" 
              style={{ width: `${mapWidth}px`, height: `${mapHeight}px`, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              onClick={handleMapClick}
            >
              {tiles}
              
              {/* User Location Marker */}
              <div className="absolute pointer-events-none" style={{ left: `${mapWidth / 2}px`, top: `${mapHeight / 2}px`, transform: 'translate(-50%, -50%)', zIndex: 1000 }}>
                <div className="relative flex h-4 w-4 items-center justify-center">
                  <span className="absolute h-4 w-4 animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative h-3 w-3 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30"></span>
                </div>
              </div>

              {/* Complaint Markers */}
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
                  <div key={c.id} className="absolute group pointer-events-none" style={{ left: `${markerX}px`, top: `${markerY}px`, transform: 'translate(-50%, -50%)', zIndex: 500 }}>
                    <div className="relative flex items-center justify-center">
                      <div className="absolute h-8 w-8 rounded-full opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: color }}></div>
                      <div className="relative h-3 w-3 rounded-full ring-2 ring-white/20" style={{ backgroundColor: color }}></div>
                      <div className="absolute bottom-full mb-2 hidden group-hover:block z-[1000]">
                        <div className="rounded-lg border border-white/10 bg-[#050816] px-3 py-2 text-center shadow-xl">
                          <p className="text-xs font-medium text-white">{c.category}</p>
                          <p className="text-[10px] text-slate-400">Severity: {c.severity || "Pending"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {error && (
            <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-amber-400/20 bg-[#050816]/90 px-3 py-2 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <AlertTriangle className="h-3 w-3" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationsView({ complaints }: { complaints: any[] }) {
  const notifications = complaints.flatMap(c => 
    c.timeline.map((t: { status: string; timestamp: string }, i: number) => ({
      id: `${c.id}-${i}`,
      title: `Report Status Updated`,
      desc: `Your ${c.category} complaint is now ${t.status}.`,
      time: new Date(t.timestamp).toLocaleString(),
      type: t.status === "Completed" ? "success" : t.status === "Rejected" ? "warning" : "info"
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-white md:text-3xl">Alerts & Notifications</h1>
        <p className="mt-1 text-sm text-slate-400">Stay updated on local safety and your reports.</p>
      </div>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="mb-3 h-10 w-10 text-slate-500" />
              <p className="text-sm text-slate-400">No notifications yet.</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card key={n.id} className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
              <CardContent className="flex items-start gap-4 p-6">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  n.type === "success" ? "bg-emerald-400/10 text-emerald-400" :
                  n.type === "warning" ? "bg-amber-400/10 text-amber-400" :
                  "bg-cyan-400/10 text-cyan-400"
                }`}>
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">{n.title}</h3>
                    <span className="text-xs text-slate-500">{n.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{n.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function ProfileView() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-white md:text-3xl">My Profile</h1>
        <p className="mt-1 text-sm text-slate-400">Manage your account and reputation.</p>
      </div>
      <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
            <Avatar className="h-20 w-20 ring-2 ring-cyan-400/20">
              <AvatarFallback className="bg-cyan-400/10 text-2xl font-bold text-cyan-400">{user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-sans text-xl font-bold text-white">{user?.name || "Citizen"}</h2>
              <p className="mt-1 text-sm text-slate-400">{user?.email || "user@domain.com"}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                <Badge variant="outline" className="border-cyan-400/20 bg-cyan-400/5 text-cyan-400">
                  <ShieldCheck className="mr-1 h-3 w-3" /> Trust Score: {user?.points || 0}
                </Badge>
                <Badge variant="outline" className="border-emerald-400/20 bg-emerald-400/5 text-emerald-400">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> {user?.verifiedCount || 0} Verified
                </Badge>
                <Badge variant="outline" className="border-amber-400/20 bg-amber-400/5 text-amber-400">
                  <ShieldCheck className="mr-1 h-3 w-3" /> {(user?.points ?? 0) >= 100 ? "Gold Reporter" : "New Reporter"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
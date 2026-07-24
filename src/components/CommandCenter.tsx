import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useComplaints, Complaint } from "@/components/ComplaintContext";
import {
  LayoutDashboard,
  FilePlus,
  Radar,
  Activity,
  LogOut,
  Bell,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Send,
  Loader2,
  MapPin,
  Camera,
  Video,
  Mic,
  X,
  Cpu,
  Zap,
  Radio,
  Users,
} from "lucide-react";

type View = "overview" | "submit" | "map" | "analytics";

export function CommandCenter({ onExit }: { onExit: () => void }) {
  const [view, setView] = useState<View>("overview");
  const { complaints } = useComplaints();
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    if (complaints.length > 0) {
      setNotifications(complaints.length);
    }
  }, [complaints]);

  const navItems = [
    { id: "overview", label: "Command Center", icon: LayoutDashboard },
    { id: "submit", label: "New Incident", icon: FilePlus },
    { id: "map", label: "Threat Map", icon: Radar },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <div className="flex min-h-screen bg-[#050816] text-slate-100">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-white/5 bg-white/[0.02] p-4 backdrop-blur-xl md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
          </div>
          <span className="font-sans text-lg font-bold tracking-tight">Safe<span className="text-cyan-400">Net</span></span>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                view === item.id
                  ? "bg-cyan-400/10 text-cyan-400 ring-1 ring-cyan-400/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-300">System Status</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">AI Engine</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#22C55E]"></span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-slate-500">Data Sync</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#22C55E]"></span>
            </div>
          </div>
          <button onClick={onExit} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="h-4 w-4" /> Exit Center
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#050816]/80 px-6 py-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-4">
            <h1 className="font-sans text-xl font-bold capitalize tracking-tight">{view === "overview" ? "Command Center" : view}</h1>
            <Badge variant="outline" className="hidden border-cyan-400/30 text-cyan-400 sm:flex">
              <span className="mr-1 flex h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00E5FF]"></span>
              LIVE
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center rounded-xl border border-white/5 bg-white/[0.03] px-3 py-1.5 md:flex">
              <Search className="h-4 w-4 text-slate-500" />
              <input placeholder="Search incidents..." className="ml-2 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none" />
            </div>
            <button className="relative rounded-xl border border-white/5 bg-white/[0.03] p-2 text-slate-400 transition hover:text-cyan-400">
              <Bell className="h-4 w-4" />
              {notifications > 0 && <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF]"></span>}
            </button>
            <Avatar className="h-9 w-9 border border-white/10">
              <AvatarFallback className="bg-cyan-400/10 text-xs text-cyan-400">OP</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {view === "overview" && <OverviewView complaints={complaints} />}
                {view === "submit" && <SubmitComplaintView />}
                {view === "map" && <MapView complaints={complaints} />}
                {view === "analytics" && <AnalyticsView complaints={complaints} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function OverviewView({ complaints }: { complaints: Complaint[] }) {
  const resolved = complaints.filter(c => c.status === "Completed").length;
  const inProgress = complaints.filter(c => c.status === "In Progress" || c.status === "Assigned").length;
  const pending = complaints.filter(c => c.status === "Pending" || c.status === "Verified").length;

  const stats = [
    { label: "Total Incidents", value: complaints.length, icon: FilePlus, color: "text-cyan-400", bg: "bg-cyan-400/10", glow: "shadow-[0_0_15px_rgba(0,229,255,0.1)]" },
    { label: "Resolved", value: resolved, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", glow: "shadow-[0_0_15px_rgba(34,197,94,0.1)]" },
    { label: "In Progress", value: inProgress, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10", glow: "shadow-[0_0_15px_rgba(245,158,11,0.1)]" },
    { label: "Pending", value: pending, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10", glow: "shadow-[0_0_15px_rgba(239,68,68,0.1)]" },
  ];

  return (
    <div className="space-y-6">
      <GlassCard className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="font-sans text-2xl font-bold tracking-tight">Welcome, Operator</h2>
            <p className="mt-1 text-sm text-slate-400">
              {complaints.length > 0 
                ? `System is tracking ${complaints.length} active incidents. AI confidence is high.`
                : "System is monitoring all sectors. No active threats detected."
              }
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/30 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
              <Cpu className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="transition hover:scale-[1.03] hover:border-cyan-400/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">{stat.label}</p>
                  <p className="mt-1 font-sans text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ${stat.glow}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-sans text-lg font-semibold">Live Incident Feed</h3>
              <Badge variant="outline" className="border-cyan-400/30 text-cyan-400">Real-time</Badge>
            </div>
            <div className="space-y-3">
              {complaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FilePlus className="h-10 w-10 text-slate-700" />
                  <p className="mt-4 text-sm text-slate-500">No incidents tracked yet. Submit a report to begin.</p>
                </div>
              ) : (
                complaints.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/[0.04] hover:border-cyan-400/20">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{r.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{r.id} • {r.dept}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`border-white/10 ${r.severity === "Critical" ? "text-red-400" : r.severity === "High" ? "text-amber-400" : "text-cyan-400"}`}>
                        {r.severity}
                      </Badge>
                      <Badge variant="secondary" className={`bg-white/5 ${r.status === "Completed" ? "text-emerald-400" : r.status === "In Progress" ? "text-amber-400" : "text-slate-400"}`}>
                        {r.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-sans text-lg font-semibold">Community Verification</h3>
              <Users className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="space-y-4">
              {complaints.filter(c => c.status === "Pending").length > 0 ? (
                complaints.filter(c => c.status === "Pending").map(c => (
                  <div key={c.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm font-medium">{c.title}</span>
                    </div>
                    <p className="mb-3 text-xs text-slate-500">Can you verify this issue?</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-8 bg-cyan-400 text-[#050816] text-xs hover:bg-cyan-300">Verify</Button>
                      <Button size="sm" variant="outline" className="h-8 border-white/10 text-xs text-slate-400 hover:bg-white/5">Skip</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-8 w-8 text-slate-700" />
                  <p className="mt-3 text-xs text-slate-500">No pending verifications.</p>
                </div>
              )}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Area Safety Score</span>
                  <span className="font-sans text-sm font-bold text-cyan-400">
                    {complaints.length > 0 ? Math.max(0, 100 - complaints.length * 5) : 100}/100
                  </span>
                </div>
                <Progress value={complaints.length > 0 ? Math.max(0, 100 - complaints.length * 5) : 100} className="h-2 bg-white/5" />
                <p className="mt-2 text-xs text-slate-500">Level: {complaints.length > 5 ? "High Risk" : "Secure"}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function SubmitComplaintView() {
  const { addComplaint, complaints } = useComplaints();
  const [aiResult, setAiResult] = useState<null | Omit<Complaint, "id" | "date" | "status">>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [description, setDescription] = useState("");
  const [mediaAttached, setMediaAttached] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video" | "voice" | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => toast.error("Failed to get GPS location.")
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleAnalyze = () => {
    if (!description && !mediaAttached) {
      toast.error("Please provide a description or upload media.");
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      // Simulated AI Analysis based on text keywords
      const text = description.toLowerCase();
      let category = "General Issue";
      let severity: Complaint["severity"] = "Low";
      let dept = "Municipal Corporation";
      let recommendation = "Inspect the area and take necessary action.";
      
      if (text.includes("pothole") || text.includes("road")) {
        category = "Road Damage";
        severity = "High";
        dept = "Public Works Department";
        recommendation = "Repair road immediately. Deploy warning signs and consider installing speed breakers.";
      } else if (text.includes("garbage") || text.includes("trash")) {
        category = "Garbage";
        severity = "Medium";
        dept = "Municipal Corporation";
        recommendation = "Increase waste collection frequency. Install smart dustbins.";
      } else if (text.includes("fire")) {
        category = "Fire";
        severity = "Critical";
        dept = "Fire Department";
        recommendation = "Dispatch fire trucks immediately. Evacuate nearby areas.";
      } else if (text.includes("water")) {
        category = "Water Leakage";
        severity = "Medium";
        dept = "Water Board";
        recommendation = "Shut off main valve. Dispatch repair team to fix leakage.";
      }

      const priority = severity === "Critical" ? 95 : severity === "High" ? 80 : severity === "Medium" ? 50 : 20;
      const eta = severity === "Critical" ? "2 Hours" : severity === "High" ? "12 Hours" : severity === "Medium" ? "24 Hours" : "48 Hours";
      const confidence = 85 + Math.floor(Math.random() * 15);
      const summary = `AI detected ${category}. ${description || "No description provided."}`;

      setAiResult({
        title: description ? description.substring(0, 40) + (description.length > 40 ? "..." : "") : `${category} Report`,
        description,
        severity,
        dept,
        confidence,
        category,
        priority,
        eta,
        recommendation,
        location: location || { lat: 0, lng: 0 },
        mediaType,
      });
      setAnalyzing(false);
      toast.success("AI Analysis Complete!", {
        description: `Confidence: ${confidence}%`,
        icon: <Cpu className="h-4 w-4 text-cyan-400" />,
      });
    }, 2000);
  };

  const handleSubmit = () => {
    if (!aiResult) return;
    
    // Duplicate Detection
    const duplicate = complaints.find(c => 
      c.category === aiResult.category && 
      Math.abs(c.location.lat - aiResult.location.lat) < 0.01 && 
      Math.abs(c.location.lng - aiResult.location.lng) < 0.01
    );

    if (duplicate) {
      toast.warning("Duplicate Complaint Detected", {
        description: "Your report has been merged with an existing nearby incident.",
      });
    } else {
      const newComplaint: Complaint = {
        ...aiResult,
        id: `RPT-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status: "Pending",
      };
      addComplaint(newComplaint);
      toast.success("Complaint submitted successfully!", {
        description: "Routed to " + newComplaint.dept,
        icon: <Radio className="h-4 w-4 text-cyan-400" />,
      });
    }

    setAiResult(null);
    setDescription("");
    setMediaAttached(false);
    setMediaType(null);
  };

  const handleMedia = (type: "image" | "video" | "voice") => {
    setMediaAttached(true);
    setMediaType(type);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} attached successfully!`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <GlassCard>
          <h3 className="mb-4 font-sans text-lg font-semibold">Report a Safety Issue</h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <button onClick={() => handleMedia("image")} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.02]">
                {mediaAttached && mediaType === "image" ? <CheckCircle2 className="h-6 w-6 text-cyan-400" /> : <Camera className="h-6 w-6 text-slate-500" />}
                <span className="text-xs text-slate-400">{mediaAttached && mediaType === "image" ? "Image Attached" : "Upload Image"}</span>
              </button>
              <button onClick={() => handleMedia("video")} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.02]">
                {mediaAttached && mediaType === "video" ? <CheckCircle2 className="h-6 w-6 text-cyan-400" /> : <Video className="h-6 w-6 text-slate-500" />}
                <span className="text-xs text-slate-400">{mediaAttached && mediaType === "video" ? "Video Attached" : "Upload Video"}</span>
              </button>
              <button onClick={() => handleMedia("voice")} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.02]">
                {mediaAttached && mediaType === "voice" ? <CheckCircle2 className="h-6 w-6 text-cyan-400" /> : <Mic className="h-6 w-6 text-slate-500" />}
                <span className="text-xs text-slate-400">{mediaAttached && mediaType === "voice" ? "Voice Recorded" : "Record Voice"}</span>
              </button>
            </div>

            {mediaAttached && (
              <div className="flex items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3">
                <span className="text-xs text-cyan-400">Media ready for AI analysis</span>
                <button onClick={() => { setMediaAttached(false); setMediaType(null); }} className="text-slate-400 hover:text-red-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue..."
                className="mt-1.5 h-24 w-full resize-none rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-400/30 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">Location</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <MapPin className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-slate-300">
                  {location ? `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}` : "Fetching GPS..."}
                </span>
              </div>
            </div>

            <Button onClick={handleAnalyze} disabled={analyzing} className="w-full bg-cyan-400 text-[#050816] font-semibold hover:bg-cyan-300">
              {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing with AI...</> : <><Cpu className="mr-2 h-4 w-4" /> Analyze with AI</>}
            </Button>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-cyan-400" />
          <h3 className="font-sans text-lg font-semibold">AI Analysis</h3>
        </div>
        {analyzing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <p className="mt-4 text-sm text-slate-500">Running AI pipeline...</p>
          </div>
        ) : aiResult ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="rounded-xl bg-cyan-400/5 p-4 ring-1 ring-cyan-400/20">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-400">Category</span>
                <span className="text-xs font-semibold text-cyan-400">{aiResult.confidence}% Match</span>
              </div>
              <p className="font-semibold text-slate-100">{aiResult.category}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.02] p-3 border border-white/5">
                <span className="text-xs text-slate-500">Severity</span>
                <p className="font-semibold text-amber-400">{aiResult.severity}</p>
              </div>
              <div className="rounded-xl bg-white/[0.02] p-3 border border-white/5">
                <span className="text-xs text-slate-500">Department</span>
                <p className="text-sm font-semibold text-slate-200">{aiResult.dept}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.02] p-3 border border-white/5">
                <span className="text-xs text-slate-500">Priority Score</span>
                <p className="font-semibold text-cyan-400">{aiResult.priority}/100</p>
              </div>
              <div className="rounded-xl bg-white/[0.02] p-3 border border-white/5">
                <span className="text-xs text-slate-500">Est. Resolution</span>
                <p className="text-sm font-semibold text-slate-200">{aiResult.eta}</p>
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400">AI Recommendation</span>
              <p className="mt-1 text-sm text-slate-300">{aiResult.recommendation}</p>
            </div>
            <Button onClick={handleSubmit} className="w-full bg-cyan-400 text-[#050816] font-semibold hover:bg-cyan-300">
              <Send className="mr-2 h-4 w-4" /> Submit Complaint
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Cpu className="h-10 w-10 text-slate-700" />
            <p className="mt-4 text-sm text-slate-500">Upload media and click "Analyze with AI" to see results.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function MapView({ complaints }: { complaints: Complaint[] }) {
  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-sans text-lg font-semibold">Interactive Threat Map</h3>
        <Badge variant="outline" className="border-cyan-400/30 text-cyan-400">Live Feed</Badge>
      </div>
      <div className="relative h-96 overflow-hidden rounded-xl border border-white/5 bg-[#050816]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(0,229,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        
        {complaints.map((c, i) => {
          const left = `${20 + (i * 15) % 60}%`;
          const top = `${20 + (i * 25) % 60}%`;
          const color = c.severity === "Critical" ? "bg-red-500" : c.severity === "High" ? "bg-amber-500" : "bg-cyan-500";
          return (
            <motion.div
              key={c.id}
              className={`absolute h-4 w-4 rounded-full ${color} shadow-[0_0_15px_currentColor]`}
              style={{ left, top }}
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          );
        })}

        {complaints.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-slate-500">No incidents mapped. Submit a report to see live data.</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

function AnalyticsView({ complaints }: { complaints: Complaint[] }) {
  const resolved = complaints.filter(c => c.status === "Completed").length;
  const total = complaints.length || 1;
  const resolutionRate = Math.round((resolved / total) * 100);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassCard>
        <h3 className="mb-4 font-sans text-lg font-semibold">Incident Trends</h3>
        {complaints.length > 0 ? (
          <div className="flex h-64 items-end justify-between gap-2">
            {complaints.slice(0, 7).map((c, i) => (
              <div key={c.id} className="w-full rounded-t-lg bg-gradient-to-t from-cyan-400/20 to-cyan-400/80 transition hover:from-cyan-400/40 hover:to-cyan-400" style={{ height: `${c.priority}%` }} />
            ))}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-slate-500">No data available yet.</div>
        )}
      </GlassCard>
      <GlassCard>
        <h3 className="mb-4 font-sans text-lg font-semibold">Resolution Performance</h3>
        {complaints.length > 0 ? (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-300">Resolution Rate</span>
                <span className="text-sm font-medium text-cyan-400">{resolutionRate}%</span>
              </div>
              <Progress value={resolutionRate} className="h-2 bg-white/5" />
            </div>
            {Array.from(new Set(complaints.map(c => c.dept))).map((dept) => {
              const deptComplaints = complaints.filter(c => c.dept === dept);
              const deptResolved = deptComplaints.filter(c => c.status === "Completed").length;
              const score = Math.round((deptResolved / deptComplaints.length) * 100);
              return (
                <div key={dept}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-300">{dept}</span>
                    <span className="text-sm font-medium text-cyan-400">{score}%</span>
                  </div>
                  <Progress value={score} className="h-2 bg-white/5" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-slate-500">No data available yet.</div>
        )}
      </GlassCard>
    </div>
  );
}
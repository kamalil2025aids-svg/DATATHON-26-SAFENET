import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  LayoutDashboard,
  FilePlus,
  History,
  Map,
  Settings,
  LogOut,
  Bell,
  Search,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  ChevronRight,
  Send,
  Loader2,
  MapPin,
  Camera,
  Video,
  Mic,
  X,
} from "lucide-react";

type View = "overview" | "submit" | "history" | "map" | "analytics";
type Complaint = {
  id: string;
  title: string;
  status: "Pending" | "Verified" | "Assigned" | "In Progress" | "Completed";
  date: string;
  severity: "Low" | "Medium" | "High";
  dept: string;
};

export default function Dashboard({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>("overview");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState(2);

  // Simulate real-time updates for existing complaints
  useEffect(() => {
    if (complaints.length === 0) return;
    
    const interval = setInterval(() => {
      setComplaints((prev) => {
        const pending = prev.filter(c => c.status !== "Completed");
        if (pending.length === 0) return prev;

        // Randomly update the status of one pending complaint
        const idx = Math.floor(Math.random() * pending.length);
        const target = pending[idx];
        const statuses: Complaint["status"][] = ["Verified", "Assigned", "In Progress", "Completed"];
        const currentIdx = statuses.indexOf(target.status);
        const nextStatus = statuses[Math.min(currentIdx + 1, statuses.length - 1)];

        const updated = prev.map(c => c.id === target.id ? { ...c, status: nextStatus } : c);
        
        if (nextStatus !== target.status) {
          toast.success(`Complaint ${target.id} updated to: ${nextStatus}`);
          setNotifications(n => n + 1);
        }
        return updated;
      });
    }, 8000); // Check every 8 seconds

    return () => clearInterval(interval);
  }, [complaints.length > 0]);

  const addComplaint = (c: Complaint) => {
    setComplaints(prev => [c, ...prev]);
    toast.success("Complaint submitted successfully! AI is analyzing...");
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "submit", label: "New Complaint", icon: FilePlus },
    { id: "history", label: "History", icon: History },
    { id: "map", label: "Safety Map", icon: Map },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-slate-100">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-white/5 bg-white/[0.02] p-4 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 ring-1 ring-emerald-400/30">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="font-serif text-lg font-bold">Safe<span className="text-emerald-400">Net</span></span>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                view === item.id
                  ? "bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200">
            <Settings className="h-4 w-4" /> Settings
          </button>
          <button onClick={onBack} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#0B0F19]/80 px-6 py-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-xl font-bold capitalize">{view}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center rounded-xl border border-white/5 bg-white/[0.03] px-3 py-1.5 md:flex">
              <Search className="h-4 w-4 text-slate-500" />
              <input placeholder="Search..." className="ml-2 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none" />
            </div>
            <button className="relative rounded-xl border border-white/5 bg-white/[0.03] p-2 text-slate-400 hover:text-emerald-400">
              <Bell className="h-4 w-4" />
              {notifications > 0 && <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-emerald-400"></span>}
            </button>
            <Avatar className="h-9 w-9 border border-white/10">
              <AvatarFallback className="bg-emerald-400/10 text-xs text-emerald-400">JD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content Area */}
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
                {view === "submit" && <SubmitComplaintView addComplaint={addComplaint} />}
                {view === "history" && <HistoryView complaints={complaints} />}
                {view === "map" && <MapView />}
                {view === "analytics" && <AnalyticsView complaints={complaints} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

function OverviewView({ complaints }: { complaints: Complaint[] }) {
  const resolved = complaints.filter(c => c.status === "Completed").length;
  const inProgress = complaints.filter(c => c.status === "In Progress" || c.status === "Assigned").length;
  const pending = complaints.filter(c => c.status === "Pending" || c.status === "Verified").length;

  const stats = [
    { label: "Total Reports", value: complaints.length, icon: FilePlus, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Resolved", value: resolved, icon: CheckCircle2, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { label: "In Progress", value: inProgress, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Pending", value: pending, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="overflow-hidden border-white/5 bg-gradient-to-r from-emerald-500/10 to-transparent">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h2 className="font-serif text-2xl font-bold">Welcome back, John!</h2>
            <p className="mt-1 text-sm text-slate-400">
              {complaints.length > 0 
                ? `You have ${pending} pending and ${inProgress} in progress.`
                : "Your area safety score is 82/100. Start reporting issues to improve your community."
              }
            </p>
          </div>
          <ShieldCheck className="h-12 w-12 text-emerald-400/30" />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-white/5 bg-white/[0.03] backdrop-blur-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="mt-1 font-serif text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Reports */}
        <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between py-5">
            <CardTitle className="text-base font-semibold">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {complaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FilePlus className="h-10 w-10 text-slate-700" />
                <p className="mt-4 text-sm text-slate-500">No complaints filed yet.</p>
              </div>
            ) : (
              complaints.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{r.id} • {r.dept}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`border-white/10 ${r.severity === "High" ? "text-red-400" : r.severity === "Medium" ? "text-amber-400" : "text-emerald-400"}`}>
                      {r.severity}
                    </Badge>
                    <Badge variant="secondary" className={`bg-white/5 ${r.status === "Completed" ? "text-emerald-400" : r.status === "In Progress" ? "text-amber-400" : "text-slate-400"}`}>
                      {r.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Community Verification */}
        <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl">
          <CardHeader className="py-5">
            <CardTitle className="text-base font-semibold">Community Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium">Water Leakage nearby</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">Can you verify this issue?</p>
              <div className="flex gap-2">
                <Button size="sm" className="h-8 bg-emerald-400 text-[#0B0F19] hover:bg-emerald-300 text-xs">Verify</Button>
                <Button size="sm" variant="outline" className="h-8 border-white/10 text-xs text-slate-400">Skip</Button>
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Your Trust Score</span>
                <span className="text-sm font-bold text-emerald-400">85</span>
              </div>
              <Progress value={85} className="h-2 bg-white/5" />
              <p className="mt-2 text-xs text-slate-500">Level: Community Guardian</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SubmitComplaintView({ addComplaint }: { addComplaint: (c: Complaint) => void }) {
  const [aiResult, setAiResult] = useState<null | { category: string; severity: Complaint["severity"]; department: string; confidence: number; recommendation: string; summary: string }>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [description, setDescription] = useState("");
  const [mediaAttached, setMediaAttached] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video" | "voice" | null>(null);

  const handleAnalyze = () => {
    if (!description && !mediaAttached) {
      toast.error("Please provide a description or upload media.");
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      setAiResult({
        category: "Road Damage",
        severity: "High",
        department: "Public Works Department",
        confidence: 98,
        recommendation: "Repair road immediately. Deploy warning signs and consider installing speed breakers.",
        summary: "Severe pothole detected on main road causing traffic disruption and vehicle damage.",
      });
      setAnalyzing(false);
      toast.success("AI Analysis Complete!");
    }, 2000);
  };

  const handleSubmit = () => {
    if (!aiResult) return;
    const newComplaint: Complaint = {
      id: `RPT-${Math.floor(1000 + Math.random() * 9000)}`,
      title: description || aiResult.summary.substring(0, 30) + "...",
      status: "Pending",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      severity: aiResult.severity,
      dept: aiResult.department,
    };
    addComplaint(newComplaint);
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
        <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl">
          <CardHeader className="py-5">
            <CardTitle className="text-base font-semibold">Report a Safety Issue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Area */}
            <div className="grid gap-4 sm:grid-cols-3">
              <button onClick={() => handleMedia("image")} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.02]">
                {mediaAttached && mediaType === "image" ? <CheckCircle2 className="h-6 w-6 text-emerald-400" /> : <Camera className="h-6 w-6 text-slate-500" />}
                <span className="text-xs text-slate-400">{mediaAttached && mediaType === "image" ? "Image Attached" : "Upload Image"}</span>
              </button>
              <button onClick={() => handleMedia("video")} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.02]">
                {mediaAttached && mediaType === "video" ? <CheckCircle2 className="h-6 w-6 text-emerald-400" /> : <Video className="h-6 w-6 text-slate-500" />}
                <span className="text-xs text-slate-400">{mediaAttached && mediaType === "video" ? "Video Attached" : "Upload Video"}</span>
              </button>
              <button onClick={() => handleMedia("voice")} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.02]">
                {mediaAttached && mediaType === "voice" ? <CheckCircle2 className="h-6 w-6 text-emerald-400" /> : <Mic className="h-6 w-6 text-slate-500" />}
                <span className="text-xs text-slate-400">{mediaAttached && mediaType === "voice" ? "Voice Recorded" : "Record Voice"}</span>
              </button>
            </div>

            {mediaAttached && (
              <div className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3">
                <span className="text-xs text-emerald-400">Media ready for AI analysis</span>
                <button onClick={() => { setMediaAttached(false); setMediaType(null); }} className="text-slate-400 hover:text-red-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-xs text-slate-400">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue..."
                className="mt-1.5 h-24 w-full resize-none rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-emerald-400/30 focus:outline-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-xs text-slate-400">Location</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-slate-300">Auto-detected: 12.9716° N, 77.5946° E</span>
              </div>
            </div>

            <Button onClick={handleAnalyze} disabled={analyzing} className="w-full bg-emerald-400 text-[#0B0F19] font-semibold hover:bg-emerald-300">
              {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing with AI...</> : <><Activity className="mr-2 h-4 w-4" /> Analyze with AI</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Panel */}
      <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl">
        <CardHeader className="py-5">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Activity className="h-4 w-4 text-emerald-400" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyzing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              <p className="mt-4 text-sm text-slate-500">Running AI pipeline...</p>
            </div>
          ) : aiResult ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="rounded-xl bg-emerald-400/5 p-4 ring-1 ring-emerald-400/20">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-400">Category</span>
                  <span className="text-xs font-semibold text-emerald-400">{aiResult.confidence}% Match</span>
                </div>
                <p className="font-semibold">{aiResult.category}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.02] p-3 border border-white/5">
                  <span className="text-xs text-slate-500">Severity</span>
                  <p className="font-semibold text-red-400">{aiResult.severity}</p>
                </div>
                <div className="rounded-xl bg-white/[0.02] p-3 border border-white/5">
                  <span className="text-xs text-slate-500">Department</span>
                  <p className="text-sm font-semibold">{aiResult.department}</p>
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400">AI Summary</span>
                <p className="mt-1 text-sm text-slate-300">{aiResult.summary}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Recommendation</span>
                <p className="mt-1 text-sm text-slate-300">{aiResult.recommendation}</p>
              </div>
              <Button onClick={handleSubmit} className="w-full bg-emerald-400 text-[#0B0F19] font-semibold hover:bg-emerald-300">
                <Send className="mr-2 h-4 w-4" /> Submit Complaint
              </Button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldCheck className="h-10 w-10 text-slate-700" />
              <p className="mt-4 text-sm text-slate-500">Upload media and click "Analyze with AI" to see results.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HistoryView({ complaints }: { complaints: Complaint[] }) {
  return (
    <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl">
      <CardHeader className="py-5">
        <CardTitle className="text-base font-semibold">Complaint History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="h-10 w-10 text-slate-700" />
            <p className="mt-4 text-sm text-slate-500">No complaints filed yet.</p>
          </div>
        ) : (
          complaints.map((h) => (
            <div key={h.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${h.status === "Completed" ? "bg-emerald-400/10" : "bg-amber-400/10"}`}>
                  {h.status === "Completed" ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Clock className="h-5 w-5 text-amber-400" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{h.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{h.id} • {h.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={`border-white/10 ${h.severity === "High" ? "text-red-400" : h.severity === "Medium" ? "text-amber-400" : "text-emerald-400"}`}>{h.severity}</Badge>
                <Badge variant="secondary" className={`bg-white/5 ${h.status === "Completed" ? "text-emerald-400" : "text-slate-400"}`}>{h.status}</Badge>
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function MapView() {
  return (
    <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl">
      <CardHeader className="py-5">
        <CardTitle className="text-base font-semibold">Interactive Safety Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-96 overflow-hidden rounded-xl border border-white/5 bg-[#0B0F19]">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute left-1/4 top-1/3 h-32 w-32 rounded-full bg-red-500/30 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-24 w-24 rounded-full bg-amber-500/30 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-20 w-20 rounded-full bg-emerald-500/30 blur-3xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-slate-500">Live Heatmap Visualization</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsView({ complaints }: { complaints: Complaint[] }) {
  const resolved = complaints.filter(c => c.status === "Completed").length;
  const total = complaints.length || 1;
  const resolutionRate = Math.round((resolved / total) * 100);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl">
        <CardHeader className="py-5">
          <CardTitle className="text-base font-semibold">Complaint Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-end justify-between gap-2">
            {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
              <div key={i} className="w-full rounded-t-lg bg-gradient-to-t from-emerald-400/20 to-emerald-400/80" style={{ height: `${h}%` }} />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl">
        <CardHeader className="py-5">
          <CardTitle className="text-base font-semibold">Resolution Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-slate-300">Resolution Rate</span>
              <span className="text-sm font-medium text-emerald-400">{resolutionRate}%</span>
            </div>
            <Progress value={resolutionRate} className="h-2 bg-white/5" />
          </div>
          {[
            { dept: "Public Works", score: 85 },
            { dept: "Municipal", score: 72 },
            { dept: "Electricity", score: 90 },
            { dept: "Water Board", score: 65 },
          ].map((d) => (
            <div key={d.dept}>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-300">{d.dept}</span>
                <span className="text-sm font-medium text-emerald-400">{d.score}%</span>
              </div>
              <Progress value={d.score} className="h-2 bg-white/5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
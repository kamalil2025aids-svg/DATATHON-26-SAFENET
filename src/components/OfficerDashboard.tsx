import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthContext";
import { useComplaints, Complaint } from "@/components/ComplaintContext";
import {
  LayoutDashboard,
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
  X,
  Cpu,
  Zap,
  Radio,
  FileText,
  MapPin,
} from "lucide-react";

type View = "overview" | "pending" | "resolved" | "map" | "analytics";

export function OfficerDashboard() {
  const { user, logout } = useAuth();
  const { complaints } = useComplaints();
  const [view, setView] = useState<View>("overview");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const deptComplaints = user?.department 
    ? complaints.filter(c => c.dept === user.department)
    : complaints;

  const pending = deptComplaints.filter(c => c.status === "Pending" || c.status === "Verified" || c.status === "Assigned");
  const resolved = deptComplaints.filter(c => c.status === "Completed" || c.status === "Rejected");

  const navItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "pending", label: "Pending", icon: Clock },
    { id: "resolved", label: "Resolved", icon: CheckCircle2 },
    { id: "map", label: "Live Map", icon: Radar },
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

        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <p className="text-xs text-slate-500">Department</p>
          <p className="text-sm font-semibold text-cyan-400">{user?.department || "All Departments"}</p>
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
              {item.id === "pending" && pending.length > 0 && (
                <Badge className="ml-auto bg-cyan-400/20 text-cyan-400">{pending.length}</Badge>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#050816]/80 px-6 py-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-4">
            <h1 className="font-sans text-xl font-bold capitalize tracking-tight">{view === "overview" ? "Officer Dashboard" : view}</h1>
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
              {pending.length > 0 && <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF]"></span>}
            </button>
            <Avatar className="h-9 w-9 border border-white/10">
              <AvatarFallback className="bg-cyan-400/10 text-xs text-cyan-400">
                {user?.name?.charAt(0) || "O"}
              </AvatarFallback>
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
                {view === "overview" && <OfficerOverview complaints={deptComplaints} pending={pending} resolved={resolved} />}
                {view === "pending" && <ComplaintList complaints={pending} onSelect={setSelectedComplaint} />}
                {view === "resolved" && <ComplaintList complaints={resolved} onSelect={setSelectedComplaint} />}
                {view === "map" && <OfficerMapView complaints={deptComplaints} />}
                {view === "analytics" && <AnalyticsView complaints={deptComplaints} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </main>

      {selectedComplaint && (
        <ComplaintDetailModal complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} />
      )}
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

function OfficerOverview({ complaints, pending, resolved }: { complaints: Complaint[], pending: Complaint[], resolved: Complaint[] }) {
  const inProgress = complaints.filter(c => c.status === "In Progress" || c.status === "Assigned").length;

  const stats = [
    { label: "Total Assigned", value: complaints.length, icon: FileText, color: "text-cyan-400", bg: "bg-cyan-400/10", glow: "shadow-[0_0_15px_rgba(0,229,255,0.1)]" },
    { label: "Pending", value: pending.length, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10", glow: "shadow-[0_0_15px_rgba(245,158,11,0.1)]" },
    { label: "In Progress", value: inProgress, icon: Activity, color: "text-sky-400", bg: "bg-sky-400/10", glow: "shadow-[0_0_15px_rgba(56,189,248,0.1)]" },
    { label: "Resolved", value: resolved.length, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", glow: "shadow-[0_0_15px_rgba(34,197,94,0.1)]" },
  ];

  return (
    <div className="space-y-6">
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

      <GlassCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-sans text-lg font-semibold">AI Recommendations & Escalations</h3>
          <Badge variant="outline" className="border-cyan-400/30 text-cyan-400">AI Powered</Badge>
        </div>
        <div className="space-y-3">
          {pending.length > 0 ? (
            pending.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.severity === "Critical" ? "bg-red-500/10" : "bg-amber-500/10"}`}>
                    <AlertTriangle className={`h-4 w-4 ${c.severity === "Critical" ? "text-red-400" : "text-amber-400"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{c.title}</p>
                    <p className="text-xs text-slate-500">Priority: {c.priority}/100 • ETA: {c.eta}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">AI Rec:</p>
                  <p className="text-xs text-cyan-400 max-w-xs truncate">{c.recommendation}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-slate-700" />
              <p className="mt-3 text-xs text-slate-500">No pending escalations.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

function ComplaintList({ complaints, onSelect }: { complaints: Complaint[], onSelect: (c: Complaint) => void }) {
  return (
    <GlassCard>
      <div className="space-y-3">
        {complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-10 w-10 text-slate-700" />
            <p className="mt-4 text-sm text-slate-500">No complaints in this category.</p>
          </div>
        ) : (
          complaints.map((c) => (
            <div 
              key={c.id} 
              onClick={() => onSelect(c)}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/[0.04] hover:border-cyan-400/20"
            >
              <div>
                <p className="text-sm font-medium text-slate-200">{c.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{c.id} • {c.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={`border-white/10 ${c.severity === "Critical" ? "text-red-400" : c.severity === "High" ? "text-amber-400" : "text-cyan-400"}`}>
                  {c.severity}
                </Badge>
                <Badge variant="secondary" className={`bg-white/5 ${c.status === "Completed" ? "text-emerald-400" : c.status === "In Progress" ? "text-amber-400" : "text-slate-400"}`}>
                  {c.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}

function ComplaintDetailModal({ complaint, onClose }: { complaint: Complaint, onClose: () => void }) {
  const { updateComplaintStatus } = useComplaints();
  const [notes, setNotes] = useState(complaint.officerNotes || "");
  const [rejectionReason, setRejectionReason] = useState("");

  const handleAccept = () => {
    updateComplaintStatus(complaint.id, "In Progress", notes);
    toast.success("Complaint Accepted & In Progress");
    onClose();
  };

  const handleComplete = () => {
    updateComplaintStatus(complaint.id, "Completed", notes);
    toast.success("Complaint Marked as Completed");
    onClose();
  };

  const handleReject = () => {
    if (!rejectionReason) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    updateComplaintStatus(complaint.id, "Rejected", notes, rejectionReason);
    toast.success("Complaint Rejected");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl rounded-[20px] border border-white/[0.08] bg-[#0B0F19] p-6 backdrop-blur-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-sans text-xl font-bold">Complaint Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/[0.02] p-3 border border-white/5">
              <span className="text-xs text-slate-500">Incident ID</span>
              <p className="text-sm font-semibold text-slate-200">{complaint.id}</p>
            </div>
            <div className="rounded-xl bg-white/[0.02] p-3 border border-white/5">
              <span className="text-xs text-slate-500">Category</span>
              <p className="text-sm font-semibold text-cyan-400">{complaint.category}</p>
            </div>
            <div className="rounded-xl bg-white/[0.02] p-3 border border-white/5">
              <span className="text-xs text-slate-500">Severity</span>
              <p className={`text-sm font-semibold ${complaint.severity === "Critical" ? "text-red-400" : "text-amber-400"}`}>{complaint.severity}</p>
            </div>
            <div className="rounded-xl bg-white/[0.02] p-3 border border-white/5">
              <span className="text-xs text-slate-500">Priority</span>
              <p className="text-sm font-semibold text-cyan-400">{complaint.priority}/100</p>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400">Description</span>
            <p className="mt-1 text-sm text-slate-300">{complaint.description || "No description provided."}</p>
          </div>

          <div className="rounded-xl bg-cyan-400/5 p-4 ring-1 ring-cyan-400/20">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400">AI Recommendation</span>
            </div>
            <p className="text-sm text-slate-300">{complaint.recommendation}</p>
          </div>

          <div>
            <span className="text-xs text-slate-400">Location</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-slate-300">Lat: {complaint.location.lat.toFixed(4)}, Lng: {complaint.location.lng.toFixed(4)}</span>
            </div>
          </div>

          {complaint.status !== "Completed" && complaint.status !== "Rejected" && (
            <>
              <div>
                <span className="text-xs text-slate-400">Officer Notes / Completion Details</span>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about the resolution..."
                  className="mt-1.5 bg-white/[0.02] border-white/5"
                />
              </div>

              {complaint.status === "Pending" && (
                <div>
                  <span className="text-xs text-slate-400">Rejection Reason (if rejecting)</span>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide reason for rejection..."
                    className="mt-1.5 bg-white/[0.02] border-white/5"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {complaint.status === "Pending" && (
                  <>
                    <Button onClick={handleAccept} className="flex-1 bg-cyan-400 text-[#050816] hover:bg-cyan-300">
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Accept & Start
                    </Button>
                    <Button onClick={handleReject} variant="outline" className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500/10">
                      <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </>
                )}
                {complaint.status === "In Progress" && (
                  <Button onClick={handleComplete} className="flex-1 bg-emerald-400 text-[#050816] hover:bg-emerald-300">
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Completed
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function OfficerMapView({ complaints }: { complaints: Complaint[] }) {
  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-sans text-lg font-semibold">Department Live Map</h3>
        <Badge variant="outline" className="border-cyan-400/30 text-cyan-400">Live Feed</Badge>
      </div>
      <div className="relative h-96 overflow-hidden rounded-xl border border-white/5 bg-[#050816]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(0,229,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        
        {complaints.map((c, i) => {
          const left = `${20 + (i * 15) % 60}%`;
          const top = `${20 + (i * 25) % 60}%`;
          const color = c.status === "Completed" ? "bg-emerald-500" : c.severity === "Critical" ? "bg-red-500" : c.severity === "High" ? "bg-amber-500" : "bg-cyan-500";
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
            <p className="text-sm text-slate-500">No incidents mapped for your department.</p>
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
            {Array.from(new Set(complaints.map(c => c.category))).map((cat) => {
              const catComplaints = complaints.filter(c => c.category === cat);
              const catResolved = catComplaints.filter(c => c.status === "Completed").length;
              const score = Math.round((catResolved / catComplaints.length) * 100);
              return (
                <div key={cat}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-300">{cat}</span>
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
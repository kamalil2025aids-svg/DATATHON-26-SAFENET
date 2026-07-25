import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Complaint {
  id: string;
  userId: string;
  category: string;
  title: string;
  location: { lat: number; lng: number; address: string; source?: string };
  description: string;
  images: string[];
  voiceNote: string | null;
  status: "Submitted" | "Verified" | "Assigned" | "In Progress" | "Completed" | "Rejected" | "Pending";
  severity: "Low" | "Medium" | "High" | "Critical" | null;
  department: string | null;
  dept: string | null;
  confidence: number | null;
  resolutionTime: number | null;
  createdAt: string;
  date: string;
  verifications: number;
  priority: number;
  eta: string;
  recommendation: string;
  officerNotes: string;
  timeline: { status: string; timestamp: string }[];
}

interface ComplaintContextType {
  complaints: Complaint[];
  addComplaint: (data: Omit<Complaint, "id" | "status" | "createdAt" | "date" | "verifications" | "timeline" | "priority" | "eta" | "recommendation" | "officerNotes" | "title" | "dept">) => void;
  verifyComplaint: (id: string) => void;
  updateComplaintStatus: (id: string, status: Complaint["status"], notes?: string, rejectionReason?: string) => void;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export function ComplaintProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem("safenet_complaints");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist complaints to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("safenet_complaints", JSON.stringify(complaints));
  }, [complaints]);

  const addComplaint = (data: Omit<Complaint, "id" | "status" | "createdAt" | "date" | "verifications" | "timeline" | "priority" | "eta" | "recommendation" | "officerNotes" | "title" | "dept">) => {
    setComplaints(prev => [
      {
        ...data,
        id: `RPT-${Date.now()}`,
        title: data.category,
        dept: data.department || "",
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        status: "Submitted" as Complaint["status"],
        verifications: 0,
        priority: Math.floor(Math.random() * 50) + 50,
        eta: "2-4 hours",
        recommendation: "AI analysis pending. Initial review recommended.",
        officerNotes: "",
        timeline: [{ status: "Submitted", timestamp: new Date().toISOString() }]
      },
      ...prev
    ]);
  };

  const verifyComplaint = (id: string) => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          const newCount = c.verifications + 1;
          let newStatus = c.status;
          if (newCount >= 3 && c.status === "Submitted") {
            newStatus = "Verified";
          }
          return {
            ...c,
            verifications: newCount,
            status: newStatus,
            timeline: [...c.timeline, { status: newStatus, timestamp: new Date().toISOString() }]
          };
        }
        return c;
      })
    );
  };

  const updateComplaintStatus = (id: string, status: Complaint["status"], notes?: string, rejectionReason?: string) => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status,
            officerNotes: notes || c.officerNotes,
            timeline: [...c.timeline, { status, timestamp: new Date().toISOString() }]
          };
        }
        return c;
      })
    );
  };

  return (
    <ComplaintContext.Provider value={{ complaints, addComplaint, verifyComplaint, updateComplaintStatus }}>
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  const ctx = useContext(ComplaintContext);
  if (!ctx) throw new Error("useComplaints must be used within ComplaintProvider");
  return ctx;
}
import { createContext, useContext, useState, ReactNode } from "react";

export interface Complaint {
  id: string;
  userId: string;
  category: string;
  location: { lat: number; lng: number; address: string };
  description: string;
  images: string[];
  voiceNote: string | null;
  status: "Submitted" | "Verified" | "Assigned" | "In Progress" | "Completed" | "Rejected";
  severity: "Low" | "Medium" | "High" | "Critical" | null;
  department: string | null;
  confidence: number | null;
  resolutionTime: number | null;
  createdAt: string;
  verifications: number;
  timeline: { status: string; timestamp: string }[];
}

interface ComplaintContextType {
  complaints: Complaint[];
  addComplaint: (data: Omit<Complaint, "id" | "userId" | "status" | "createdAt" | "verifications" | "timeline">) => void;
  verifyComplaint: (id: string) => void;
  updateComplaintStatus: (id: string, status: Complaint["status"]) => void;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export function ComplaintProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const addComplaint = (data: Omit<Complaint, "id" | "userId" | "status" | "createdAt" | "verifications" | "timeline">) => {
    setComplaints(prev => [
      {
        ...data,
        id: crypto.randomUUID(),
        userId: "current",
        status: "Submitted",
        createdAt: new Date().toISOString(),
        verifications: 0,
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

  const updateComplaintStatus = (id: string, status: Complaint["status"]) => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status,
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
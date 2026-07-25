import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "citizen" | "official";
  points: number;
  verifiedCount: number;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: "citizen" | "official") => void;
  logout: () => void;
  register: (name: string, email: string, role: "citizen" | "official") => void;
  updateUserPoints: (userId: string, points: number, verified: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("safenet_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persist user data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("safenet_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("safenet_user");
    }
  }, [user]);

  const login = (email: string, role: "citizen" | "official") => {
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    setUser({
      id: crypto.randomUUID(),
      name,
      email,
      role,
      points: 0,
      verifiedCount: 0,
      department: role === "official" ? "Municipal Corporation" : undefined
    });
  };

  const register = (name: string, email: string, role: "citizen" | "official") => {
    setUser({
      id: crypto.randomUUID(),
      name,
      email,
      role,
      points: 50,
      verifiedCount: 0,
      department: role === "official" ? "Municipal Corporation" : undefined
    });
  };

  const logout = () => setUser(null);

  const updateUserPoints = (userId: string, points: number, verified: number) => {
    setUser(prev => prev ? { ...prev, points: prev.points + points, verifiedCount: prev.verifiedCount + verified } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUserPoints }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
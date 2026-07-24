import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "citizen" | "official";
  points: number;
  verifiedCount: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: "citizen" | "official") => void;
  logout: () => void;
  updateUserPoints: (userId: string, points: number, verified: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, role: "citizen" | "official") => {
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    setUser({
      id: crypto.randomUUID(),
      name,
      email,
      role,
      points: 0,
      verifiedCount: 0
    });
  };

  const logout = () => setUser(null);

  const updateUserPoints = (userId: string, points: number, verified: number) => {
    setUser(prev => prev ? { ...prev, points: prev.points + points, verifiedCount: prev.verifiedCount + verified } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserPoints }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
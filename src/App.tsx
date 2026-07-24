import { useState } from "react";
import { AuthProvider, useAuth } from "@/components/AuthContext";
import { ComplaintProvider } from "@/components/ComplaintContext";
import { CitizenDashboard } from "@/components/CitizenDashboard";
import { OfficialDashboard } from "@/components/OfficialDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, LogIn } from "lucide-react";

function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"citizen" | "official">("citizen");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email, role);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050816] p-4">
      <Card className="w-full max-w-md border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/20">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
          </div>
          <CardTitle className="font-sans text-2xl font-bold tracking-tight text-white">
            Safe<span className="text-cyan-400">Net</span>
          </CardTitle>
          <CardDescription className="text-slate-400">
            AI Smart City Safety Intelligence Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="citizen@city.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-white/5 bg-white/[0.02] text-white placeholder:text-slate-500 focus:ring-cyan-400/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Role</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={() => setRole("citizen")}
                  variant={role === "citizen" ? "default" : "outline"}
                  className={role === "citizen" ? "bg-cyan-400 text-[#050816] hover:bg-cyan-300" : "border-white/10 bg-transparent text-slate-300 hover:bg-white/5"}
                >
                  Citizen
                </Button>
                <Button
                  type="button"
                  onClick={() => setRole("official")}
                  variant={role === "official" ? "default" : "outline"}
                  className={role === "official" ? "bg-cyan-400 text-[#050816] hover:bg-cyan-300" : "border-white/10 bg-transparent text-slate-300 hover:bg-white/5"}
                >
                  Official
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-cyan-400 text-[#050816] hover:bg-cyan-300">
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();
  
  if (!user) return <LoginScreen />;
  
  if (user.role === "official") return <OfficialDashboard />;
  return <CitizenDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <ComplaintProvider>
        <AppContent />
      </ComplaintProvider>
    </AuthProvider>
  );
}
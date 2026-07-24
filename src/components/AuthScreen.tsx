import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthContext";
import { ShieldCheck, Mail, Lock, User as UserIcon } from "lucide-react";

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"citizen" | "officer">("citizen");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      login(email, role);
    } else {
      register(name, email, role);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]"></div>
      <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/20">
              <ShieldCheck className="h-6 w-6 text-cyan-400" />
            </div>
            <CardTitle className="font-sans text-2xl font-bold tracking-tight">Safe<span className="text-cyan-400">Net</span></CardTitle>
            <CardDescription>AI Smart City Safety Intelligence Platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`rounded-md py-2 text-sm font-medium transition ${
                    mode === "login" ? "bg-cyan-400/10 text-cyan-400" : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`rounded-md py-2 text-sm font-medium transition ${
                    mode === "register" ? "bg-cyan-400/10 text-cyan-400" : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  Register
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("citizen")}
                  className={`rounded-lg border py-2 text-xs font-medium transition ${
                    role === "citizen" ? "border-cyan-400/20 bg-cyan-400/5 text-cyan-400" : "border-white/5 text-slate-400 hover:bg-white/5"
                  }`}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => setRole("officer")}
                  className={`rounded-lg border py-2 text-xs font-medium transition ${
                    role === "officer" ? "border-cyan-400/20 bg-cyan-400/5 text-cyan-400" : "border-white/5 text-slate-400 hover:bg-white/5"
                  }`}
                >
                  Government Official
                </button>
              </div>

              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="border-white/5 bg-white/[0.02] pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="border-white/5 bg-white/[0.02] pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border-white/5 bg-white/[0.02] pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-cyan-400 text-[#050816] hover:bg-cyan-300">
                {mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
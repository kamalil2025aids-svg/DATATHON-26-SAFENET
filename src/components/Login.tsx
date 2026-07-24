import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Users,
  Building2,
  UserCog,
} from "lucide-react";

type Role = "citizen" | "officer" | "admin";

const roles: { id: Role; label: string; icon: typeof Users; desc: string }[] = [
  { id: "citizen", label: "Citizen", icon: Users, desc: "Report issues in your area" },
  { id: "officer", label: "Officer", icon: Building2, desc: "Government department staff" },
  { id: "admin", label: "Admin", icon: UserCog, desc: "System administrator access" },
];

export default function Login({ onBack, onLogin }: { onBack: () => void; onLogin: () => void }) {
  const [role, setRole] = useState<Role>("citizen");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B0F19] px-4 py-10">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 -right-40 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <button
            onClick={onBack}
            className="absolute -top-2 left-0 flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 ring-1 ring-emerald-400/30">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>
          <h1 className="font-serif text-2xl font-bold">
            Safe<span className="text-emerald-400">Net</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">Smart City Safety Intelligence</p>
        </div>

        {/* Role Tabs */}
        <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl border border-white/5 bg-white/[0.03] p-1.5">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`relative flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-medium transition ${
                role === r.id ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {role === r.id && (
                <motion.div
                  layoutId="roleTab"
                  className="absolute inset-0 rounded-xl bg-emerald-400/10 ring-1 ring-emerald-400/20"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
              <r.icon className="relative h-4 w-4" />
              <span className="relative">{r.label}</span>
            </button>
          ))}
        </div>

        {/* Form Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold">
                    {roles.find((r) => r.id === role)?.label} Login
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {roles.find((r) => r.id === role)?.desc}
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-xs font-medium text-slate-400">
                      Email Address
                    </Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="border-white/5 bg-white/[0.02] pl-9 focus:border-emerald-400/30"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-medium text-slate-400">
                        Password
                      </Label>
                      <button
                        type="button"
                        className="text-xs text-emerald-400/80 transition hover:text-emerald-400"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="border-white/5 bg-white/[0.02] pl-9 pr-9 focus:border-emerald-400/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 transition hover:text-slate-400"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-400 text-[#0B0F19] font-semibold hover:bg-emerald-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      `Sign in as ${roles.find((r) => r.id === role)?.label}`
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-xs text-slate-600">or</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                {/* Google Login */}
                <Button
                  variant="outline"
                  className="w-full border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  onClick={handleLogin}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </Button>

                <p className="mt-5 text-center text-xs text-slate-500">
                  Don't have an account?{" "}
                  <button className="font-medium text-emerald-400 transition hover:text-emerald-300">
                    Register here
                  </button>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
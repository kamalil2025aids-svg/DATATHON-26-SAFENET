import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  Cpu,
  Radar,
  Activity,
  ArrowRight,
  Brain,
  MapPin,
  Zap,
} from "lucide-react";

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  const stats = [
    { label: "Active Sensors", value: "12,450", icon: Radar },
    { label: "AI Predictions", value: "98.2%", icon: Brain },
    { label: "Avg Response", value: "4.2m", icon: Zap },
    { label: "Areas Secured", value: "1,204", icon: ShieldCheck },
  ];

  const features = [
    {
      title: "AI Threat Detection",
      desc: "Real-time computer vision analysis of city cameras to detect anomalies, accidents, and hazards instantly.",
      icon: Cpu,
      color: "text-cyan-400",
    },
    {
      title: "Predictive Heatmaps",
      desc: "Machine learning models forecast accident zones, flood risks, and crime hotspots before they happen.",
      icon: MapPin,
      color: "text-violet-400",
    },
    {
      title: "Smart Routing",
      desc: "Auto-assigns incidents to the correct government department with priority scoring and escalation protocols.",
      icon: Activity,
      color: "text-sky-400",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 z-0 h-screen bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <motion.div 
        className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-cyan-500/20 blur-[120px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute top-40 right-1/4 h-96 w-96 rounded-full bg-violet-500/20 blur-[120px]"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
      />

      <div className="relative z-10">
        <header className="flex items-center justify-between p-6 md:px-12">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/30">
              <ShieldCheck className="h-6 w-6 text-cyan-400" />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight">Safe<span className="text-cyan-400">Net</span></span>
          </div>
          <Button 
            onClick={onEnter}
            className="group bg-cyan-400/10 text-cyan-400 ring-1 ring-cyan-400/30 hover:bg-cyan-400/20 hover:ring-cyan-400/50"
          >
            Access Command Center
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
          </Button>
        </header>

        <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300 backdrop-blur-xl"
          >
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#00E5FF]" />
            Next-Gen AI Smart City Operations Center
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-7xl"
          >
            Intelligent Safety.<br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              Unified Command.
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-slate-400"
          >
            SafeNet integrates AI-powered threat detection, predictive heatmaps, and real-time response routing into a single, futuristic command center.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 grid w-full max-w-4xl grid-cols-2 gap-4 md:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-xl">
                <stat.icon className="mx-auto mb-2 h-5 w-5 text-cyan-400" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24 md:px-12">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Core AI Capabilities</h2>
            <p className="mt-2 text-slate-400">Powered by advanced machine learning and computer vision.</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="group h-full border-white/5 bg-white/[0.02] backdrop-blur-xl transition-all hover:scale-[1.02] hover:border-cyan-400/20 hover:bg-cyan-400/[0.02]">
                  <CardContent className="p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 transition group-hover:ring-cyan-400/30">
                      <feat.icon className={`h-6 w-6 ${feat.color}`} />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{feat.title}</h3>
                    <p className="text-sm text-slate-400">{feat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/5 py-8 text-center text-sm text-slate-500">
          <p>SafeNet AI Operations Center &copy; 2024. Securing the cities of tomorrow.</p>
        </footer>
      </div>
    </div>
  );
}
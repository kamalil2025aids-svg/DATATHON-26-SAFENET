import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export function SplashScreen() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050816]">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
      
      <motion.div 
        className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-[120px]"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 200, damping: 15 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-400/30 shadow-[0_0_30px_rgba(0,229,255,0.3)]"
        >
          <ShieldCheck className="h-12 w-12 text-cyan-400" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-sans text-4xl font-bold tracking-tight md:text-5xl"
        >
          Safe<span className="text-cyan-400">Net</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-3 text-sm text-slate-400 md:text-base"
        >
          AI-Powered Smart City Safety Platform
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-8 h-1 w-48 origin-left rounded-full bg-gradient-to-r from-cyan-400 to-transparent"
        />
      </div>
    </div>
  );
}
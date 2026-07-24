import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Camera,
  Mic,
  MapPin,
  Brain,
  CheckCircle2,
  Loader2,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Building2,
  X,
} from "lucide-react";

type AIResult = {
  category: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  department: string;
  estimatedTime: string;
  priority: number;
  summary: string;
  keywords: string[];
  recommendations: string[];
};

const mockAIResult: AIResult = {
  category: "Road Damage — Pothole",
  severity: "High",
  confidence: 94,
  department: "Municipal Corporation",
  estimatedTime: "18-24 hours",
  priority: 82,
  summary:
    "Large pothole detected on main road causing traffic hazard. Immediate repair recommended to prevent vehicle damage and accidents.",
  keywords: ["pothole", "road damage", "traffic hazard", "main road"],
  recommendations: [
    "Deploy warning signs immediately",
    "Schedule road repair crew",
    "Install temporary speed breaker",
    "Monitor for duplicate complaints",
  ],
};

export default function ComplaintForm() {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setAiResult(null);
    setTimeout(() => {
      setAnalyzing(false);
      setAiResult(mockAIResult);
    }, 2200);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDescription("");
      setLocation("");
      setAiResult(null);
      setMediaPreview(null);
    }, 3500);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const severityStyles: Record<string, string> = {
    Low: "border-emerald-500/20 bg-emerald-500/15 text-emerald-400",
    Medium: "border-amber-500/20 bg-amber-500/15 text-amber-400",
    High: "border-orange-500/20 bg-orange-500/15 text-orange-400",
    Critical: "border-rose-500/20 bg-rose-500/15 text-rose-400",
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Form */}
      <div className="lg:col-span-3">
        <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm">
          <CardContent className="p-6">
            {/* Media upload */}
            <Label className="text-sm font-medium">Evidence</Label>
            <p className="mb-3 text-xs text-slate-500">
              Upload photo/video, record voice, or describe the issue.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <label className="group cursor-pointer">
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFile}
                />
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-6 transition hover:border-emerald-400/30 hover:bg-emerald-400/5">
                  <Camera className="h-5 w-5 text-slate-500 transition group-hover:text-emerald-400" />
                  <span className="text-xs text-slate-500">Photo/Video</span>
                </div>
              </label>

              <button
                onClick={() => setRecording(!recording)}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border py-6 transition ${
                  recording
                    ? "border-rose-500/30 bg-rose-500/10"
                    : "border-dashed border-white/10 bg-white/[0.02] hover:border-emerald-400/30 hover:bg-emerald-400/5"
                }`}
              >
                <Mic
                  className={`h-5 w-5 ${
                    recording
                      ? "animate-pulse text-rose-400"
                      : "text-slate-500"
                  }`}
                />
                <span className="text-xs text-slate-500">
                  {recording ? "Recording..." : "Voice"}
                </span>
              </button>

              <label className="group cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFile}
                />
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-6 transition hover:border-emerald-400/30 hover:bg-emerald-400/5">
                  <Upload className="h-5 w-5 text-slate-500 transition group-hover:text-emerald-400" />
                  <span className="text-xs text-slate-500">Upload</span>
                </div>
              </label>
            </div>

            {/* Preview */}
            <AnimatePresence>
              {mediaPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="relative rounded-xl border border-white/10 overflow-hidden">
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="h-44 w-full object-cover"
                    />
                    <button
                      onClick={() => setMediaPreview(null)}
                      className="absolute right-2 top-2 rounded-lg bg-[#0B0F19]/80 p-1.5 backdrop-blur-sm transition hover:bg-rose-500/20"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                    <div className="absolute bottom-2 left-2 rounded-lg bg-[#0B0F19]/80 px-2.5 py-1 text-xs text-emerald-400 backdrop-blur-sm">
                      <CheckCircle2 className="mr-1 inline h-3 w-3" />
                      Media attached
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Description */}
            <div className="mt-5">
              <Label htmlFor="desc" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the safety issue in your own words..."
                className="mt-2 min-h-[100px] resize-none border-white/5 bg-white/[0.02] focus:border-emerald-400/30"
              />
            </div>

            {/* Location */}
            <div className="mt-5">
              <Label htmlFor="loc" className="text-sm font-medium">
                Location
              </Label>
              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="loc"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter address or landmark"
                    className="border-white/5 bg-white/[0.02] pl-9 focus:border-emerald-400/30"
                  />
                </div>
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                >
                  <MapPin className="mr-1.5 h-4 w-4 text-emerald-400" />
                  GPS
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                variant="outline"
                className="flex-1 border-emerald-400/20 bg-emerald-400/5 text-emerald-400 hover:bg-emerald-400/10"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    AI Analyze
                  </>
                )}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!aiResult || submitted}
                className="flex-1 bg-emerald-400 text-[#0B0F19] font-semibold hover:bg-emerald-300 disabled:opacity-40"
              >
                {submitted ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Submitted!
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Panel */}
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {analyzing && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border-emerald-400/20 bg-gradient-to-br from-emerald-400/5 to-transparent backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <div className="relative">
                    <Brain className="h-12 w-12 text-emerald-400" />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                  <p className="mt-4 text-sm font-medium text-emerald-400">
                    AI is analyzing your report...
                  </p>
                  <div className="mt-4 w-full max-w-xs space-y-2">
                    {[
                      "Detecting issue category",
                      "Predicting severity",
                      "Routing to department",
                      "Generating recommendations",
                    ].map((step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.5 }}
                        className="flex items-center gap-2 text-xs text-slate-400"
                      >
                        <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                        {step}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {aiResult && !analyzing && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border-emerald-400/20 bg-gradient-to-br from-emerald-400/5 to-transparent backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/15 ring-1 ring-emerald-400/30">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-sm font-semibold">
                      AI Analysis Complete
                    </span>
                  </div>

                  {/* Category + Severity */}
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Detected Category</p>
                      <p className="text-sm font-semibold text-emerald-400">
                        {aiResult.category}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`border text-xs ${severityStyles[aiResult.severity]}`}
                    >
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      {aiResult.severity}
                    </Badge>
                  </div>

                  {/* Confidence */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">AI Confidence</span>
                      <span className="font-semibold text-emerald-400">
                        {aiResult.confidence}%
                      </span>
                    </div>
                    <Progress
                      value={aiResult.confidence}
                      className="mt-1.5 h-1.5"
                    />
                  </div>

                  {/* Priority */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Priority Score</span>
                      <span className="font-semibold text-amber-400">
                        {aiResult.priority}/100
                      </span>
                    </div>
                    <Progress
                      value={aiResult.priority}
                      className="mt-1.5 h-1.5"
                    />
                  </div>

                  {/* Summary */}
                  <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <p className="text-xs font-medium text-slate-400">
                      AI Summary
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">
                      {aiResult.summary}
                    </p>
                  </div>

                  {/* Department + Time */}
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Building2 className="h-3 w-3" />
                        Routed To
                      </div>
                      <p className="mt-1 text-xs font-semibold text-cyan-400">
                        {aiResult.department}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Loader2 className="h-3 w-3" />
                        Est. Resolution
                      </div>
                      <p className="mt-1 text-xs font-semibold text-violet-400">
                        {aiResult.estimatedTime}
                      </p>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="mt-4">
                    <p className="text-xs font-medium text-slate-400">
                      Extracted Keywords
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {aiResult.keywords.map((k) => (
                        <span
                          key={k}
                          className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-400"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mt-4">
                    <div className="flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                      <p className="text-xs font-medium text-slate-400">
                        AI Recommendations
                      </p>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {aiResult.recommendations.map((r, i) => (
                        <motion.div
                          key={r}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-2 text-xs text-slate-300"
                        >
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                          {r}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!aiResult && !analyzing && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                    <Brain className="h-7 w-7 text-slate-600" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-400">
                    AI Analysis Ready
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-slate-600">
                    Add evidence and a description, then click{" "}
                    <span className="text-emerald-400">AI Analyze</span> to
                    detect the issue, predict severity, and auto-route to the
                    right department.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
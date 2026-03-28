import { Mic, MicOff, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { VoiceState } from "./types";

interface VoiceInputProps {
  state: VoiceState;
  transcript: string;
  onStart: () => void;
  onStop: () => void;
  labels: { listening: string; processing: string; understood: string; speakNow: string; stop: string; voiceInput: string };
}

export function VoiceInput({ state, transcript, onStart, onStop, labels }: VoiceInputProps) {
  const stateConfig = {
    idle: { icon: Mic, color: "bg-primary", ring: "", label: labels.speakNow },
    listening: { icon: MicOff, color: "bg-destructive", ring: "ring-4 ring-destructive/30 animate-pulse-ring", label: labels.listening },
    processing: { icon: Loader2, color: "bg-accent", ring: "", label: labels.processing },
    understood: { icon: CheckCircle2, color: "bg-success", ring: "", label: labels.understood },
  };

  const cfg = stateConfig[state];
  const Icon = cfg.icon;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Mic button */}
      <button
        onClick={state === "listening" ? onStop : onStart}
        disabled={state === "processing"}
        className={`relative w-20 h-20 rounded-full ${cfg.color} ${cfg.ring} text-primary-foreground flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50`}
        aria-label={state === "listening" ? labels.stop : labels.voiceInput}
      >
        <Icon className={`w-8 h-8 ${state === "processing" ? "animate-spin" : ""}`} />
      </button>

      {/* State label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={state}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-sm font-medium text-muted-foreground"
        >
          {cfg.label}
        </motion.p>
      </AnimatePresence>

      {/* Live transcript bubble */}
      <AnimatePresence>
        {transcript && state !== "idle" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-card border border-border rounded-xl p-4 shadow-card"
          >
            <p className="text-xs text-muted-foreground mb-1 font-medium">
              {state === "listening" ? "🎙️" : "✓"} {cfg.label}
            </p>
            <p className="text-foreground leading-relaxed">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

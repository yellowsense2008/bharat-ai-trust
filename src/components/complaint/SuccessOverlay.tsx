import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Search, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEasyMode } from "@/contexts/EasyModeContext";

interface SuccessOverlayProps {
  visible: boolean;
  complaint: {
    category: string;
    subcategory: string;
    amount: string;
    description: string;
  } | null;
  onFileAnother: () => void;
}

function Confetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.2 + Math.random() * 1.2,
        size: 4 + Math.random() * 6,
        color: [
          "hsl(var(--success))",
          "hsl(var(--primary))",
          "hsl(var(--accent))",
          "hsl(160 84% 60%)",
          "hsl(30 100% 70%)",
          "hsl(220 82% 50%)",
        ][i % 6],
        rotation: Math.random() * 360,
        drift: (Math.random() - 0.5) * 60,
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}%`, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            y: "110%",
            x: `calc(${p.x}% + ${p.drift}px)`,
            opacity: [1, 1, 0],
            rotate: p.rotation + 360,
            scale: [1, 0.8, 0.4],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: p.size > 7 ? "2px" : "50%",
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}

function AnimatedCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.3 }}
      className="relative w-20 h-20 mx-auto mb-5"
    >
      {/* Outer ring pulse */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.8, 1.4, 1.2], opacity: [0, 0.3, 0] }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        className="absolute inset-0 rounded-full bg-success/20"
      />
      {/* Circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.2 }}
        className="absolute inset-0 rounded-full bg-success flex items-center justify-center shadow-lg"
        style={{ boxShadow: "0 8px 32px hsl(160 84% 39% / 0.35)" }}
      >
        {/* SVG Checkmark with draw animation */}
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-white">
          <motion.path
            d="M10 18L16 24L26 12"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

export function SuccessOverlay({ visible, complaint, onFileAnother }: SuccessOverlayProps) {
  const navigate = useNavigate();
  const { language } = useEasyMode();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setShowContent(true), 400);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [visible]);

  const isHi = language === "hi";

  return (
    <AnimatePresence>
      {visible && showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Confetti */}
          <Confetti />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.1 }}
            className="relative z-20 w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
          >
            <div className="p-8 text-center">
              <AnimatedCheckmark />

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-xl font-bold text-foreground mb-2"
              >
                {isHi ? "शिकायत सफलतापूर्वक दर्ज!" : "Complaint Submitted Successfully"}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-sm text-muted-foreground mb-6"
              >
                {isHi
                  ? "आपकी शिकायत दर्ज हो गई है। हम आपको अपडेट करते रहेंगे।"
                  : "Your complaint has been registered. We will keep you updated."}
              </motion.p>

              {/* Complaint summary */}
              {complaint && (complaint.category || complaint.description) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-muted/50 rounded-xl p-4 mb-6 text-left space-y-2"
                >
                  {complaint.category && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[70px]">
                        {isHi ? "श्रेणी" : "Category"}
                      </span>
                      <span className="text-sm font-medium text-foreground">{complaint.category}</span>
                    </div>
                  )}
                  {complaint.description && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[70px] pt-0.5">
                        {isHi ? "विवरण" : "Details"}
                      </span>
                      <span className="text-sm text-foreground line-clamp-2">{complaint.description}</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={() => navigate("/track")}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring shadow-md"
                >
                  <Search className="w-4 h-4" />
                  {isHi ? "शिकायत ट्रैक करें" : "Track Complaint"}
                </button>
                <button
                  onClick={onFileAnother}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-muted text-foreground font-semibold transition-all hover:bg-muted/80 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <PlusCircle className="w-4 h-4" />
                  {isHi ? "नई शिकायत दर्ज करें" : "File Another Complaint"}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

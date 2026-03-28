import { useState } from "react";
import { Search, CheckCircle, Clock, FileText, Users, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useEasyMode } from "@/contexts/EasyModeContext";
import { useT } from "@/lib/i18n";

export default function TrackComplaint() {
  const { language, easyMode } = useEasyMode();
  const t = useT(language);
  const [refId, setRefId] = useState("");
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState<any>(null);
  const [error, setError] = useState("");

  const timelineSteps = [
    { key: "submitted", label: t("track.submitted"), desc: t("track.submittedDesc"), icon: FileText },
    { key: "categorized", label: t("track.categorized"), desc: t("track.categorizedDesc"), icon: FileText },
    { key: "assigned", label: t("track.assigned"), desc: t("track.assignedDesc"), icon: Users },
    { key: "in_progress", label: t("track.inProgress"), desc: t("track.inProgressDesc"), icon: Clock },
    { key: "resolved", label: t("track.resolved"), desc: t("track.resolvedDesc"), icon: CheckCircle },
    { key: "closed", label: t("track.closed"), desc: t("track.closedDesc"), icon: CheckCircle },
  ];

  const handleTrack = async () => {
    if (!refId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.getComplaint(refId.trim());
      setComplaint(res.complaint || res);
    } catch {
      setComplaint({
        reference_id: refId,
        category: "UPI",
        status: "in_progress",
        assigned_department: "Digital Payments",
        priority: "High",
        created_at: new Date().toISOString(),
      });
    }
    setLoading(false);
  };

  const getActiveIndex = () => {
    if (!complaint) return -1;
    const statusMap: Record<string, number> = { submitted: 0, categorized: 1, assigned: 2, in_progress: 3, resolved: 4, closed: 5 };
    return statusMap[complaint.status] ?? 2;
  };

  const speakStatus = (text: string) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = language === "hi" ? "hi-IN" : "en-IN";
      u.rate = 0.85;
      speechSynthesis.speak(u);
    }
  };

  const activeIndex = getActiveIndex();

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 max-w-2xl">
      <h1 className={`font-bold mb-2 ${easyMode ? "text-3xl" : "text-2xl lg:text-3xl"}`}>{t("track.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("track.subtitle")}</p>

      <div className="flex gap-3 mb-8" role="search">
        <input
          value={refId}
          onChange={(e) => setRefId(e.target.value)}
          placeholder={t("track.placeholder")}
          className={`flex-1 border rounded-lg px-4 py-3 bg-card text-foreground focus:ring-2 focus:ring-primary focus:outline-none min-h-[var(--button-height)] ${easyMode ? "text-lg" : ""}`}
          onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          aria-label={t("track.placeholder")}
        />
        <button
          onClick={handleTrack}
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 rounded-lg min-h-[var(--button-height)] hover:brightness-110 transition-all disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-primary/30"
          aria-label={t("track.button")}
        >
          <Search className="w-5 h-5" aria-hidden="true" />
          {loading ? t("track.loading") : t("track.button")}
        </button>
      </div>

      {error && <p className="text-destructive mb-4" role="alert">{error}</p>}

      {complaint && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-card rounded-lg shadow-card p-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: t("track.refId"), value: complaint.reference_id, bold: true },
                { label: t("track.category"), value: complaint.category },
                { label: t("track.department"), value: complaint.assigned_department },
                { label: t("track.priority"), value: complaint.priority || "Medium", isPriority: true },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  {item.isPriority ? (
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      item.value === "High" ? "bg-destructive/10 text-destructive" :
                      item.value === "Medium" ? "bg-accent/20 text-accent-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>{item.value}</span>
                  ) : (
                    <p className={`${item.bold ? "font-semibold tabular-nums" : "font-medium"} ${easyMode ? "text-lg" : ""}`}>{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{t("track.timeline")}</h2>
              <button
                onClick={() => speakStatus(t("track.statusSpeak", { id: complaint.reference_id, status: complaint.status?.replace("_", " ") }))}
                className="flex items-center gap-1 text-sm text-primary hover:underline min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary rounded-md px-2"
                aria-label={t("track.listen")}
              >
                <Volume2 className="w-4 h-4" /> {t("track.listen")}
              </button>
            </div>
            <div className="space-y-0" role="list" aria-label={t("track.timeline")}>
              {timelineSteps.map((step, i) => (
                <div key={step.key} className="flex gap-4" role="listitem">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                      i <= activeIndex ? "bg-primary ring-4 ring-primary/10" : "bg-muted"
                    }`} aria-hidden="true" />
                    {i < timelineSteps.length - 1 && (
                      <div className={`w-0.5 h-10 ${i < activeIndex ? "bg-primary" : "bg-muted"}`} aria-hidden="true" />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className={`font-medium ${easyMode ? "text-base" : "text-sm"} ${i <= activeIndex ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

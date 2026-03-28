import { Eye, Mic, Volume2, Accessibility, CheckCircle } from "lucide-react";
import { useEasyMode } from "@/contexts/EasyModeContext";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n";

export default function AccessibilityCenter() {
  const { easyMode, toggleEasyMode, language } = useEasyMode();
  const t = useT(language);

  const features = [
    {
      icon: Eye, title: t("a11y.easyMode"), desc: t("a11y.easyModeDesc"),
      action: (
        <button
          onClick={toggleEasyMode}
          className={`px-6 py-3 rounded-lg font-semibold min-h-[var(--button-height)] transition-all focus:outline-none focus:ring-4 focus:ring-primary/30 ${
            easyMode ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          {easyMode ? t("a11y.easyModeEnabled") : t("a11y.enableEasyMode")}
        </button>
      ),
    },
    {
      icon: Accessibility, title: t("a11y.screenReader"), desc: t("a11y.screenReaderDesc"),
      action: <div className="flex items-center gap-2 text-success"><CheckCircle className="w-5 h-5" /><span className="text-sm font-medium">{t("a11y.active")}</span></div>,
    },
    {
      icon: Volume2, title: t("a11y.tts"), desc: t("a11y.ttsDesc"),
      action: (
        <button
          onClick={() => {
            const u = new SpeechSynthesisUtterance("Text-to-speech is working.");
            u.lang = "en-IN"; u.rate = 0.85;
            speechSynthesis.speak(u);
          }}
          className="px-6 py-3 rounded-lg font-semibold min-h-[var(--button-height)] bg-primary/10 text-primary hover:bg-primary/20 transition-all focus:outline-none focus:ring-4 focus:ring-primary/30"
        >
          {t("a11y.testTts")}
        </button>
      ),
    },
    {
      icon: Mic, title: t("a11y.voice"), desc: t("a11y.voiceDesc"),
      action: <div className="flex items-center gap-2 text-success"><CheckCircle className="w-5 h-5" /><span className="text-sm font-medium">{t("a11y.available")}</span></div>,
    },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 max-w-3xl">
      <h1 className={`font-bold mb-2 ${easyMode ? "text-3xl" : "text-2xl lg:text-3xl"}`}>{t("a11y.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("a11y.subtitle")}</p>
      <div className="space-y-4">
        {features.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-card rounded-lg shadow-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${easyMode ? "text-lg" : ""}`}>{f.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{f.desc}</p>
                {f.action}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

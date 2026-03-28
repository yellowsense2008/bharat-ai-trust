import { HelpCircle, Volume2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useEasyMode } from "@/contexts/EasyModeContext";
import { useT } from "@/lib/i18n";

export default function HelpFab() {
  const [open, setOpen] = useState(false);
  const { easyMode, language } = useEasyMode();
  const t = useT(language);

  const speakScreen = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const text = document.querySelector("main")?.textContent?.slice(0, 500) || "";
      const u = new SpeechSynthesisUtterance(text);
      u.lang = language === "hi" ? "hi-IN" : language === "ta" ? "ta-IN" : language === "te" ? "te-IN" : language === "kn" ? "kn-IN" : language === "bn" ? "bn-IN" : "en-IN";
      u.rate = 0.85;
      speechSynthesis.speak(u);
    }
  };

  if (!easyMode) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="bg-card rounded-xl shadow-card border border-border p-4 mb-2 w-56 animate-in slide-in-from-bottom-2">
          <button
            onClick={speakScreen}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-muted transition-colors text-left min-h-[48px]"
            aria-label={t("fab.speakScreen")}
          >
            <Volume2 className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm font-medium">{t("fab.speakScreen")}</span>
          </button>
          <Link
            to="/app/help"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-muted transition-colors text-left min-h-[48px]"
          >
            <HelpCircle className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm font-medium">{t("help.title")}</span>
          </Link>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:brightness-110 transition-all focus:outline-none focus:ring-4 focus:ring-accent/30"
        aria-label={t("fab.needHelp")}
      >
        <HelpCircle className="w-7 h-7" />
      </button>
    </div>
  );
}

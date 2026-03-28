import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Smartphone, Wallet, Building2, Landmark, PhoneCall,
  Send, CheckCircle, ArrowLeft, Volume2, AlertCircle, RefreshCw, Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useEasyMode } from "@/contexts/EasyModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { VoiceInput } from "@/components/complaint/VoiceInput";
import { TrustBadge } from "@/components/complaint/TrustBadge";
import { useVoiceRecognition } from "@/components/complaint/useVoiceRecognition";
import { CATEGORIES, SUBCATEGORIES } from "@/components/complaint/types";
import { useT, type Language } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { LANGUAGES } from "@/lib/i18n";

type WizardStep = "category" | "subcategory" | "details" | "confirm" | "success" | "error";

interface ComplaintData {
  category: string;
  categoryLabel: string;
  subcategory: string;
  subcategoryId: string;
  description: string;
  whenOccurred?: string;
  amountInvolved?: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  payments: Wallet, upi: Smartphone, card: CreditCard,
  loan: Landmark, account: Building2, mobile_banking: PhoneCall,
};

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
};

export default function FileComplaint() {
  const { easyMode, language, setLanguage } = useEasyMode();
  const { isAuthenticated } = useAuth();
  const t = useT(language);
  const [step, setStep] = useState<WizardStep>("category");
  const [data, setData] = useState<ComplaintData>({
    category: "", categoryLabel: "", subcategory: "", subcategoryId: "", description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ referenceId: string; department: string; time: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const { toast } = useToast();
  const voiceLang = language === "hi" ? "hi" : "en";
  const voice = useVoiceRecognition(voiceLang as "en" | "hi");

  const stepIndex = ["category", "subcategory", "details", "confirm"].indexOf(step);
  const totalSteps = 4;

  const speak = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = language === "hi" ? "hi-IN" : language === "ta" ? "ta-IN" : language === "te" ? "te-IN" : language === "kn" ? "kn-IN" : language === "bn" ? "bn-IN" : "en-IN";
      u.rate = 0.85;
      speechSynthesis.speak(u);
    }
  }, [language]);

  const handleSelectCategory = (catId: string) => {
    setData(d => ({ ...d, category: catId, categoryLabel: t(`cat.${catId}`) }));
    setStep("subcategory");
  };

  const handleSelectSubcategory = (subId: string) => {
    setData(d => ({ ...d, subcategoryId: subId, subcategory: t(`sub.${subId}`), description: t(`sub.${subId}`) }));
    setStep("details");
  };

  const handleSubmit = async () => {
    if (!data.description.trim()) {
      toast({ title: t("wizard.askDescription"), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await api.createComplaint({
        category: data.category,
        subcategory: data.subcategoryId,
        description: data.description,
        title: data.subcategory || data.categoryLabel,
      });
      setResult({
        referenceId: res.complaint?.reference_id || res.reference_id || "BT-" + Date.now().toString(36).toUpperCase(),
        department: res.complaint?.assigned_department || data.categoryLabel + " Department",
        time: res.complaint?.expected_resolution || "48 hours",
      });
      setStep("success");
    } catch (err: any) {
      const msg = err?.message || "Unknown error";
      if (msg.includes("401")) {
        toast({ title: t("auth.sessionExpired"), variant: "destructive" });
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
        return;
      }
      if (msg.includes("500")) {
        setErrorMsg(t("wizard.highLoad"));
      } else {
        setErrorMsg(msg);
      }
      setStep("error");
    }
    setSubmitting(false);
  };

  const reset = () => {
    setStep("category");
    setData({ category: "", categoryLabel: "", subcategory: "", subcategoryId: "", description: "" });
    setResult(null);
    setErrorMsg("");
    voice.reset();
  };

  const QuestionLabel = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2 mb-5" role="heading" aria-level={2}>
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0" aria-hidden="true">
        <span className="text-primary-foreground text-sm font-bold">?</span>
      </div>
      <h2 className={`font-semibold ${easyMode ? "text-xl" : "text-lg"}`}>{text}</h2>
      {easyMode && (
        <button onClick={() => speak(text)} className="ml-auto p-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary" aria-label={t("fab.speakScreen")}>
          <Volume2 className="w-5 h-5 text-muted-foreground" />
        </button>
      )}
    </div>
  );

  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 hover:text-foreground transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary rounded-md px-2">
      <ArrowLeft className="w-4 h-4" /> {t("wizard.back")}
    </button>
  );

  const timeOptions = [t("wizard.today"), t("wizard.yesterday"), t("wizard.thisWeek"), t("wizard.thisMonth")];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 max-w-2xl">
      {/* Auth guard */}
      {!isAuthenticated && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">{t("auth.loginRequired")}</h2>
          <p className="text-muted-foreground text-sm mb-6">{t("auth.loginToFile")}</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold min-h-[48px] hover:brightness-110 transition-all focus:outline-none focus:ring-4 focus:ring-primary/30"
          >
            {t("auth.loginButton")}
          </Link>
        </div>
      )}
      {isAuthenticated && step !== "success" && step !== "error" && (
        <>
          {/* Wizard header with language selector and progress */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className={`font-bold ${easyMode ? "text-3xl" : "text-2xl lg:text-3xl"}`}>{t("wizard.title")}</h1>
                <p className="text-muted-foreground text-sm mt-1">{t("wizard.subtitle")}</p>
              </div>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1 shrink-0">
                <Globe className="w-4 h-4 text-muted-foreground ml-2" aria-hidden="true" />
                {LANGUAGES.slice(0, 3).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as Language)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[36px] focus:outline-none focus:ring-2 focus:ring-primary ${
                      language === lang.code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label={lang.label}
                  >
                    {lang.nativeLabel.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-3" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
              <span className="text-xs font-medium text-muted-foreground">{t("wizard.stepOf", { current: stepIndex + 1, total: totalSteps })}</span>
              <div className="flex items-center gap-1.5 flex-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                      i < stepIndex ? "bg-success" : i === stepIndex ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="mb-8">
            <TrustBadge secureBadge={t("wizard.secureBadge")} privacyNote={t("wizard.privacyNote")} resolutionPreview={t("wizard.resolutionPreview")} />
          </div>
        </>
      )}

      {isAuthenticated && <AnimatePresence mode="wait">
        {/* STEP 1: Category */}
        {step === "category" && (
          <motion.div key="cat" {...slide}>
            <div className="bg-muted/50 rounded-xl p-6 mb-8 border border-border">
              <p className="text-center text-sm text-muted-foreground mb-4">{t("wizard.voicePrompt")}</p>
              <VoiceInput
                state={voice.voiceState}
                transcript={voice.transcript}
                onStart={() => voice.start((text) => {
                  const lower = text.toLowerCase();
                  const match = CATEGORIES.find(c => lower.includes(c.label.toLowerCase()) || lower.includes(c.labelHi));
                  if (match) handleSelectCategory(match.id);
                  else setData(d => ({ ...d, description: text }));
                })}
                onStop={() => voice.stop()}
                labels={{ listening: t("wizard.listening"), processing: t("wizard.processing"), understood: t("wizard.understood"), speakNow: t("wizard.speakNow"), stop: t("wizard.stop"), voiceInput: t("wizard.voiceInput") }}
              />
              <p className="text-center text-xs text-muted-foreground mt-4">{t("wizard.orType")}</p>
            </div>

            <QuestionLabel text={t("wizard.askCategory")} />
            <div className={`grid ${easyMode ? "grid-cols-1 gap-4" : "grid-cols-2 gap-3"}`} role="group" aria-label={t("wizard.askCategory")}>
              {CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id];
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`flex items-center gap-4 bg-card rounded-xl shadow-card hover:ring-2 hover:ring-primary transition-all text-left focus:outline-none focus:ring-2 focus:ring-primary ${
                      easyMode ? "p-6 min-h-[80px]" : "p-5 min-h-[var(--button-height)]"
                    }`}
                    aria-label={t(`cat.${cat.id}`)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0" aria-hidden="true">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className={`font-semibold ${easyMode ? "text-lg" : ""}`}>
                      {t(`cat.${cat.id}`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 2: Subcategory */}
        {step === "subcategory" && (
          <motion.div key="sub" {...slide}>
            <BackButton onClick={() => setStep("category")} />
            <QuestionLabel text={t("wizard.askSubcategory")} />
            <div className={`flex flex-col ${easyMode ? "gap-4" : "gap-3"}`} role="group" aria-label={t("wizard.askSubcategory")}>
              {(SUBCATEGORIES[data.category] || []).map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSubcategory(sub.id)}
                  className={`text-left bg-card rounded-xl shadow-card hover:ring-2 hover:ring-primary transition-all font-medium focus:outline-none focus:ring-2 focus:ring-primary ${
                    easyMode ? "p-6 text-lg min-h-[72px]" : "p-4 min-h-[var(--button-height)]"
                  }`}
                >
                  {t(`sub.${sub.id}`)}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Details */}
        {step === "details" && (
          <motion.div key="details" {...slide}>
            <BackButton onClick={() => setStep("subcategory")} />
            <QuestionLabel text={t("wizard.askDescription")} />

            <div className="mb-6">
              <VoiceInput
                state={voice.voiceState}
                transcript={voice.transcript}
                onStart={() => voice.start((text) => setData(d => ({ ...d, description: text })))}
                onStop={() => { voice.stop(); if (voice.transcript) setData(d => ({ ...d, description: voice.transcript })); }}
                labels={{ listening: t("wizard.listening"), processing: t("wizard.processing"), understood: t("wizard.understood"), speakNow: t("wizard.speakNow"), stop: t("wizard.stop"), voiceInput: t("wizard.voiceInput") }}
              />
            </div>

            <textarea
              value={data.description}
              onChange={(e) => setData(d => ({ ...d, description: e.target.value }))}
              rows={easyMode ? 6 : 4}
              className={`w-full border border-border rounded-xl p-4 bg-card text-foreground resize-none focus:ring-2 focus:ring-primary focus:outline-none ${easyMode ? "text-lg" : ""}`}
              placeholder={t("wizard.descPlaceholder")}
              aria-label={t("wizard.description")}
            />

            <div className="mt-6">
              <QuestionLabel text={t("wizard.askWhen")} />
              <div className="flex flex-wrap gap-3" role="group" aria-label={t("wizard.askWhen")}>
                {timeOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setData(d => ({ ...d, whenOccurred: opt }))}
                    className={`px-5 py-3 rounded-xl font-medium transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary ${
                      data.whenOccurred === opt
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border hover:ring-2 hover:ring-primary"
                    } ${easyMode ? "text-lg" : ""}`}
                    aria-pressed={data.whenOccurred === opt}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <QuestionLabel text={t("wizard.askAmount")} />
              <input
                type="text"
                value={data.amountInvolved || ""}
                onChange={(e) => setData(d => ({ ...d, amountInvolved: e.target.value }))}
                className={`w-full border border-border rounded-xl p-4 bg-card text-foreground focus:ring-2 focus:ring-primary focus:outline-none ${easyMode ? "text-lg" : ""}`}
                placeholder={t("wizard.amountPlaceholder")}
                aria-label={t("wizard.amount")}
              />
            </div>

            <button
              onClick={() => setStep("confirm")}
              disabled={!data.description.trim()}
              className={`w-full mt-8 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-50 min-h-[var(--button-height)] focus:outline-none focus:ring-4 focus:ring-primary/30 ${
                easyMode ? "py-5 text-lg" : "py-4"
              }`}
            >
              {t("wizard.continue")} →
            </button>
          </motion.div>
        )}

        {/* STEP 4: Confirm */}
        {step === "confirm" && (
          <motion.div key="confirm" {...slide}>
            <BackButton onClick={() => setStep("details")} />
            <QuestionLabel text={t("wizard.confirmTitle")} />

            <div className="bg-card rounded-xl shadow-card p-6 space-y-4 mb-6 border border-border">
              {[
                { label: t("wizard.category"), value: data.categoryLabel },
                { label: t("wizard.issue"), value: data.subcategory },
                { label: t("wizard.description"), value: data.description },
                ...(data.whenOccurred ? [{ label: t("wizard.when"), value: data.whenOccurred }] : []),
                ...(data.amountInvolved ? [{ label: t("wizard.amount"), value: "₹" + data.amountInvolved.replace(/[₹\s]/g, "") }] : []),
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.label}</p>
                  <p className={`font-medium mt-0.5 ${easyMode ? "text-lg" : ""}`}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("details")}
                className={`flex-1 py-4 rounded-xl font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors min-h-[var(--button-height)] focus:outline-none focus:ring-2 focus:ring-primary ${easyMode ? "text-lg" : ""}`}
              >
                {t("wizard.confirmEdit")}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 min-h-[var(--button-height)] focus:outline-none focus:ring-4 focus:ring-accent/30 ${
                  easyMode ? "text-lg py-5" : "py-4"
                }`}
              >
                <Send className="w-5 h-5" aria-hidden="true" />
                {submitting ? t("wizard.submitting") : t("wizard.confirmSubmit")}
              </button>
            </div>
          </motion.div>
        )}

        {/* ERROR */}
        {step === "error" && (
          <motion.div key="error" {...slide} className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className={`font-bold mb-2 ${easyMode ? "text-2xl" : "text-xl"}`}>{t("wizard.errorTitle")}</h2>
            <p className="text-muted-foreground mb-2 max-w-md mx-auto">{t("wizard.errorMessage")}</p>
            {errorMsg && <p className="text-xs text-destructive/70 mb-8 max-w-md mx-auto">{errorMsg}</p>}

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setStep("confirm"); setErrorMsg(""); }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold min-h-[var(--button-height)] hover:brightness-110 transition-all focus:outline-none focus:ring-4 focus:ring-primary/30"
              >
                <RefreshCw className="w-5 h-5" aria-hidden="true" />
                {t("wizard.retry")}
              </button>
              <button
                onClick={reset}
                className="px-8 py-4 rounded-xl border border-border bg-card font-semibold min-h-[var(--button-height)] hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {t("wizard.fileAnother")}
              </button>
            </div>
          </motion.div>
        )}

        {/* SUCCESS */}
        {step === "success" && result && (
          <motion.div key="success" {...slide} className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className={`font-bold mb-2 ${easyMode ? "text-2xl" : "text-xl"}`}>{t("wizard.successTitle")}</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t("wizard.successMessage")}</p>

            <div className="bg-card rounded-xl shadow-card p-6 max-w-sm mx-auto text-left mb-8 border border-border">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("wizard.refId")}</p>
                  <p className={`font-bold tabular-nums ${easyMode ? "text-2xl" : "text-lg"}`}>{result.referenceId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("wizard.department")}</p>
                  <p className="font-medium">{result.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("wizard.resolution")}</p>
                  <p className="font-medium">{result.time}</p>
                </div>
              </div>
            </div>

            <button
              onClick={reset}
              className={`px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold min-h-[var(--button-height)] hover:brightness-110 transition-all focus:outline-none focus:ring-4 focus:ring-primary/30 ${easyMode ? "text-lg" : ""}`}
            >
              {t("wizard.fileAnother")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>}
    </div>
  );
}

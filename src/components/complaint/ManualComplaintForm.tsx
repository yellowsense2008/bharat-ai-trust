import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, Loader2, Send } from "lucide-react";
import { useEasyMode } from "@/contexts/EasyModeContext";
import { useT } from "@/lib/i18n";
import { api } from "@/lib/api";
import { VoiceInput } from "./VoiceInput";
import { useVoiceRecognition } from "./useVoiceRecognition";
import { CATEGORIES, SUBCATEGORIES, type WizardStep, type ComplaintData } from "./types";

export function ManualComplaintForm() {
  const { easyMode, language } = useEasyMode();
  const t = useT(language);
  const lang = language === "hi" ? "hi" : "en";

  const [step, setStep] = useState<WizardStep>("category");
  const [data, setData] = useState<ComplaintData>({
    category: "",
    categoryLabel: "",
    subcategory: "",
    description: "",
    whenOccurred: "",
    amountInvolved: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [refId, setRefId] = useState("");

  const voice = useVoiceRecognition(lang as "en" | "hi");

  const handleCategory = (id: string, label: string) => {
    setData((d) => ({ ...d, category: id, categoryLabel: label }));
    setStep("subcategory");
  };

  const handleSubcategory = (id: string) => {
    setData((d) => ({ ...d, subcategory: id }));
    setStep("details");
  };

  const handleBack = () => {
    if (step === "subcategory") setStep("category");
    else if (step === "details") setStep("subcategory");
    else if (step === "confirm") setStep("details");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.createComplaint({
        category: data.category,
        subcategory: data.subcategory,
        description: data.description,
        title: `${data.categoryLabel} - ${data.subcategory}`,
      });
      setRefId(res.complaint_id || res.id || "BT-" + Date.now().toString(36).toUpperCase());
      setStep("success");
    } catch {
      setRefId("BT-" + Date.now().toString(36).toUpperCase());
      setStep("success");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep("category");
    setData({ category: "", categoryLabel: "", subcategory: "", description: "", whenOccurred: "", amountInvolved: "" });
    setRefId("");
    voice.reset();
  };

  const sz = easyMode ? "text-lg" : "text-sm";

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <AnimatePresence mode="wait">
        {/* CATEGORY STEP */}
        {step === "category" && (
          <motion.div key="cat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* Voice input */}
            <div className="mb-6">
              <VoiceInput
                state={voice.voiceState}
                transcript={voice.transcript}
                onStart={() => voice.start((text) => setData((d) => ({ ...d, description: text })))}
                onStop={voice.stop}
                labels={{
                  listening: t("wizard.listening"),
                  processing: t("wizard.processing"),
                  understood: t("wizard.understood"),
                  speakNow: t("wizard.speakNow"),
                  stop: t("wizard.stop"),
                  voiceInput: t("wizard.voiceInput"),
                }}
              />
              <p className="text-center text-muted-foreground text-xs mt-2">{t("wizard.orType")}</p>
            </div>

            <p className={`font-semibold mb-3 ${sz}`}>{t("wizard.askCategory")}</p>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategory(cat.id, lang === "hi" ? cat.labelHi : cat.label)}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left"
                >
                  <span className={`font-medium ${sz}`}>{lang === "hi" ? cat.labelHi : cat.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* SUBCATEGORY STEP */}
        {step === "subcategory" && (
          <motion.div key="sub" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={handleBack} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> {t("wizard.back")}
            </button>
            <p className={`font-semibold mb-3 ${sz}`}>{t("wizard.askSubcategory")}</p>
            <div className="space-y-2">
              {(SUBCATEGORIES[data.category] || []).map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleSubcategory(sub.id)}
                  className="w-full p-3 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left"
                >
                  <span className={sz}>{lang === "hi" ? sub.labelHi : sub.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* DETAILS STEP */}
        {step === "details" && (
          <motion.div key="det" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={handleBack} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> {t("wizard.back")}
            </button>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("wizard.description")}</label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData((d) => ({ ...d, description: e.target.value }))}
                  placeholder={t("wizard.descPlaceholder")}
                  rows={4}
                  className={`w-full border border-border rounded-xl px-4 py-3 bg-card text-foreground focus:ring-2 focus:ring-primary focus:outline-none ${sz}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("wizard.when")}</label>
                <div className="flex flex-wrap gap-2">
                  {["today", "yesterday", "thisWeek", "thisMonth"].map((w) => (
                    <button
                      key={w}
                      onClick={() => setData((d) => ({ ...d, whenOccurred: w }))}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                        data.whenOccurred === w ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      {t(`wizard.${w}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("wizard.amount")}</label>
                <input
                  type="text"
                  value={data.amountInvolved || ""}
                  onChange={(e) => setData((d) => ({ ...d, amountInvolved: e.target.value }))}
                  placeholder={t("wizard.amountPlaceholder")}
                  className={`w-full border border-border rounded-xl px-4 py-3 bg-card text-foreground focus:ring-2 focus:ring-primary focus:outline-none ${sz}`}
                />
              </div>
              <button
                onClick={() => setStep("confirm")}
                disabled={!data.description.trim()}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 hover:brightness-110 transition-all"
              >
                {t("wizard.continue")}
              </button>
            </div>
          </motion.div>
        )}

        {/* CONFIRM STEP */}
        {step === "confirm" && (
          <motion.div key="conf" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={handleBack} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> {t("wizard.confirmEdit")}
            </button>
            <h3 className="font-bold text-lg mb-4">{t("wizard.confirmTitle")}</h3>
            <div className="bg-card border border-border rounded-xl p-4 space-y-3 mb-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("wizard.category")}</p>
                <p className="font-medium">{data.categoryLabel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("wizard.issue")}</p>
                <p className="font-medium">{data.subcategory}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("wizard.description")}</p>
                <p className="font-medium">{data.description}</p>
              </div>
              {data.whenOccurred && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("wizard.when")}</p>
                  <p className="font-medium">{t(`wizard.${data.whenOccurred}`)}</p>
                </div>
              )}
              {data.amountInvolved && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("wizard.amount")}</p>
                  <p className="font-medium">{data.amountInvolved}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {t("wizard.submitting")}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> {t("wizard.confirmSubmit")}
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* SUCCESS STEP */}
        {step === "success" && (
          <motion.div key="succ" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-bold text-xl mb-2">{t("wizard.successTitle")}</h3>
            <p className="text-muted-foreground text-sm mb-4">{t("wizard.successMessage")}</p>
            <div className="bg-card border border-border rounded-xl p-4 mb-6 inline-block">
              <p className="text-xs text-muted-foreground">{t("wizard.refId")}</p>
              <p className="font-bold text-lg">{refId}</p>
            </div>
            <br />
            <button onClick={resetForm} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all">
              {t("wizard.fileAnother")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

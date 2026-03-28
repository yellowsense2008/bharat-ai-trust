import { HelpCircle, Phone, Mail, MessageSquare } from "lucide-react";
import { useEasyMode } from "@/contexts/EasyModeContext";
import { useT } from "@/lib/i18n";

export default function HelpSupport() {
  const { language, easyMode } = useEasyMode();
  const t = useT(language);

  const faqs = [
    { q: t("help.faq1q"), a: t("help.faq1a") },
    { q: t("help.faq2q"), a: t("help.faq2a") },
    { q: t("help.faq3q"), a: t("help.faq3a") },
    { q: t("help.faq4q"), a: t("help.faq4a") },
    { q: t("help.faq5q"), a: t("help.faq5a") },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 max-w-3xl">
      <h1 className={`font-bold mb-2 ${easyMode ? "text-3xl" : "text-2xl lg:text-3xl"}`}>{t("help.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("help.subtitle")}</p>
      <div className="space-y-3 mb-10">
        {faqs.map((faq) => (
          <div key={faq.q} className="bg-card rounded-lg shadow-card p-5">
            <h3 className={`font-semibold mb-1 flex items-center gap-2 ${easyMode ? "text-lg" : ""}`}>
              <HelpCircle className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
              {faq.q}
            </h3>
            <p className="text-sm text-muted-foreground ml-6">{faq.a}</p>
          </div>
        ))}
      </div>
      <h2 className={`font-bold mb-4 ${easyMode ? "text-2xl" : "text-xl"}`}>{t("help.contactTitle")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Phone, label: t("help.phone"), value: "1800-XXX-XXXX" },
          { icon: Mail, label: t("help.email"), value: "support@bharattrust.ai" },
          { icon: MessageSquare, label: t("help.chat"), value: t("help.chatAvail") },
        ].map((c) => (
          <div key={c.label} className="bg-card rounded-lg shadow-card p-5 text-center">
            <c.icon className="w-6 h-6 text-primary mx-auto mb-2" aria-hidden="true" />
            <p className="font-semibold text-sm">{c.label}</p>
            <p className="text-xs text-muted-foreground">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

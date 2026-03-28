import { Shield, Target, Users } from "lucide-react";
import { useEasyMode } from "@/contexts/EasyModeContext";
import { useT } from "@/lib/i18n";

export default function About() {
  const { language, easyMode } = useEasyMode();
  const t = useT(language);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 max-w-3xl">
      <h1 className={`font-bold mb-2 ${easyMode ? "text-3xl" : "text-2xl lg:text-3xl"}`}>{t("about.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("about.subtitle")}</p>
      <div className="bg-card rounded-lg shadow-card p-6 mb-6">
        <h2 className={`font-semibold mb-3 ${easyMode ? "text-xl" : "text-lg"}`}>{t("about.missionTitle")}</h2>
        <p className="text-muted-foreground leading-relaxed">{t("about.missionDesc")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Shield, title: t("about.trust"), desc: t("about.trustDesc") },
          { icon: Target, title: t("about.ai"), desc: t("about.aiDesc") },
          { icon: Users, title: t("about.inclusive"), desc: t("about.inclusiveDesc") },
        ].map((item) => (
          <div key={item.title} className="bg-card rounded-lg shadow-card p-5 text-center">
            <item.icon className="w-6 h-6 text-primary mx-auto mb-2" aria-hidden="true" />
            <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-primary/5 rounded-lg p-6">
        <p className="text-sm text-muted-foreground text-center">{t("about.footer")}</p>
      </div>
    </div>
  );
}

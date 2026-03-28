import { Link } from "react-router-dom";
import { FileText, Search, Shield, Mic, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useEasyMode } from "@/contexts/EasyModeContext";
import { useT } from "@/lib/i18n";

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const },
};

export default function Index() {
  const { language, easyMode } = useEasyMode();
  const t = useT(language);

  const stats = [
    { icon: FileText, label: t("home.statComplaints"), value: "12,480+" },
    { icon: Clock, label: t("home.statResolution"), value: "42.5 hrs" },
    { icon: Users, label: t("home.statUsers"), value: "8,200+" },
    { icon: Shield, label: t("home.statRate"), value: "94.2%" },
  ];

  return (
    <div>
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-1.5 mb-6">
              <Shield className="w-4 h-4 text-accent" aria-hidden="true" />
              <span className="text-sm font-medium text-primary-foreground/90">{t("home.badge")}</span>
            </div>
            <h1 className={`font-bold mb-4 text-primary-foreground ${easyMode ? "text-4xl lg:text-6xl" : "text-3xl lg:text-5xl"}`}>
              {t("home.title")}
            </h1>
            <p className={`text-primary-foreground/80 mb-4 ${easyMode ? "text-xl lg:text-2xl" : "text-lg lg:text-xl"}`}>
              {t("home.subtitle")}
            </p>
            <p className="text-primary-foreground/60 mb-10 max-w-xl mx-auto">
              {t("home.desc")}
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 justify-center ${easyMode ? "gap-6" : ""}`}>
              <Link
                to="/app/file-complaint"
                className={`inline-flex items-center justify-center gap-2 bg-accent text-primary font-semibold rounded-lg min-h-[var(--button-height)] hover:brightness-110 transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-accent/30 ${easyMode ? "px-10 py-5 text-xl" : "px-8 py-4 text-lg"}`}
              >
                <FileText className="w-5 h-5" aria-hidden="true" />
                {t("home.fileCta")}
              </Link>
              <Link
                to="/app/track-complaint"
                className={`inline-flex items-center justify-center gap-2 bg-primary-foreground/10 text-primary-foreground font-semibold rounded-lg min-h-[var(--button-height)] hover:bg-primary-foreground/20 transition-all border border-primary-foreground/20 focus:outline-none focus:ring-4 focus:ring-primary-foreground/20 ${easyMode ? "px-10 py-5 text-xl" : "px-8 py-4 text-lg"}`}
              >
                <Search className="w-5 h-5" aria-hidden="true" />
                {t("home.trackCta")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.35 }}
              className="bg-card rounded-lg p-5 shadow-card text-center"
            >
              <stat.icon className="w-6 h-6 text-accent mx-auto mb-2" aria-hidden="true" />
              <p className={`font-bold tabular-nums text-foreground ${easyMode ? "text-3xl" : "text-2xl"}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 py-16">
        <h2 className={`font-bold text-center mb-10 ${easyMode ? "text-3xl" : "text-2xl lg:text-3xl"}`}>{t("home.howItWorks")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Mic, title: t("home.step1Title"), desc: t("home.step1Desc") },
            { icon: Shield, title: t("home.step2Title"), desc: t("home.step2Desc") },
            { icon: Clock, title: t("home.step3Title"), desc: t("home.step3Desc") },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-lg p-6 shadow-card text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className={`font-semibold mb-2 ${easyMode ? "text-lg" : ""}`}>{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

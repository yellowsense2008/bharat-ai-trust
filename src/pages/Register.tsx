import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, UserPlus, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEasyMode } from "@/contexts/EasyModeContext";
import { useT, LANGUAGES, type Language } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const { language, setLanguage } = useEasyMode();
  const t = useT(language);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: t("auth.passwordMismatch"), variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: t("auth.passwordTooShort"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password });
      toast({ title: t("auth.registerSuccess") });
      navigate("/login");
    } catch (err: any) {
      toast({ title: t("auth.registerFailed"), description: err?.message || "Please try again.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-primary font-bold text-sm">BT</span>
            </div>
            <div>
              <p className="text-primary-foreground font-semibold text-sm leading-tight">Bharat Trust AI</p>
              <p className="text-primary-foreground/70 text-xs">Grievance Redressal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary-foreground/70" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-primary-foreground/10 text-primary-foreground text-xs rounded px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Select language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.nativeLabel}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{t("auth.registerTitle")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("auth.registerSubtitle")}</p>
          </div>

          <div className="bg-card rounded-xl shadow-card border border-border p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-foreground">{t("auth.fullName")}</label>
                <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full border border-border rounded-xl p-3 bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder={t("auth.namePlaceholder")} aria-label={t("auth.fullName")} />
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium mb-1.5 text-foreground">{t("auth.email")}</label>
                <input id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-border rounded-xl p-3 bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder={t("auth.emailPlaceholder")} aria-label={t("auth.email")} />
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium mb-1.5 text-foreground">{t("auth.password")}</label>
                <input id="reg-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-border rounded-xl p-3 bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder={t("auth.passwordPlaceholder")} aria-label={t("auth.password")} />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium mb-1.5 text-foreground">{t("auth.confirmPassword")}</label>
                <input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-border rounded-xl p-3 bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder={t("auth.confirmPasswordPlaceholder")} aria-label={t("auth.confirmPassword")} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-xl py-3.5 min-h-[48px] hover:brightness-110 transition-all disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-primary/30">
                <UserPlus className="w-5 h-5" aria-hidden="true" />
                {loading ? t("auth.registering") : t("auth.registerButton")}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-5">
              {t("auth.hasAccount")}{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">{t("auth.loginLink")}</Link>
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-green-600" />
              <span>{t("auth.secureBadge")}</span>
            </div>
            <p className="text-center text-xs text-muted-foreground">{t("auth.privacyNote")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

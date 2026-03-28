import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Home, FileText, Search, Accessibility, HelpCircle, Info, Globe, BarChart3, User, LogOut } from "lucide-react";
import { useEasyMode } from "@/contexts/EasyModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { LANGUAGES, useT, type Language } from "@/lib/i18n";
import HelpFab from "@/components/HelpFab";

const navKeys: { to: string; labelKey: string; icon: any }[] = [
  { to: "/app/home", labelKey: "nav.home", icon: Home },
  { to: "/app/file-complaint", labelKey: "nav.fileComplaint", icon: FileText },
  { to: "/app/track-complaint", labelKey: "nav.trackComplaint", icon: Search },
  { to: "/app/my-complaints", labelKey: "nav.myComplaints", icon: BarChart3 },
  { to: "/app/accessibility", labelKey: "nav.accessibility", icon: Accessibility },
  { to: "/app/help", labelKey: "nav.help", icon: HelpCircle },
  { to: "/app/about", labelKey: "nav.about", icon: Info },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { language, setLanguage, easyMode, toggleEasyMode } = useEasyMode();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const t = useT(language);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-primary sticky top-0 z-50" role="banner">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/app/home" className="flex items-center gap-3" aria-label="Bharat Trust AI Home">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-primary font-bold text-sm">BT</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-primary-foreground font-semibold text-sm leading-tight">Bharat Trust AI</p>
                <p className="text-primary-foreground/70 text-xs">Grievance Redressal</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {navKeys.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
                    location.pathname === item.to
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {isAuthenticated && user && (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary-foreground/10 text-primary-foreground text-sm">
                    <User className="w-3.5 h-3.5" />
                    <span className="max-w-[120px] truncate">{t("auth.welcome", { name: user.name.split(" ")[0] })}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-md text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 focus:outline-none focus:ring-2 focus:ring-accent"
                    aria-label={t("auth.logout")}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-md text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label="Select language"
                  aria-expanded={langOpen}
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentLang.nativeLabel}</span>
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-card rounded-lg shadow-card border py-1 min-w-[160px] z-50" role="listbox">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code as Language); setLangOpen(false); }}
                        role="option"
                        aria-selected={language === lang.code}
                        className={`w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors min-h-[44px] ${
                          language === lang.code ? "font-semibold text-primary" : "text-foreground"
                        }`}
                      >
                        {lang.nativeLabel} <span className="text-muted-foreground ml-1 text-xs">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={toggleEasyMode}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all min-h-[36px] focus:outline-none focus:ring-2 focus:ring-accent ${
                  easyMode
                    ? "bg-accent text-primary border-2 border-primary"
                    : "bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/30"
                }`}
                aria-label="Toggle Easy Mode"
                aria-pressed={easyMode}
              >
                {easyMode ? t("nav.easyModeOn") : t("nav.easyMode")}
              </button>

              <button
                className="lg:hidden p-2 text-primary-foreground min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-primary border-t border-primary-foreground/10 overflow-hidden z-40"
          >
            <nav className="container mx-auto px-4 py-2" role="navigation" aria-label="Mobile navigation">
              {navKeys.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium min-h-[48px] focus:outline-none focus:ring-2 focus:ring-accent ${
                    location.pathname === item.to
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "text-primary-foreground/70"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {t(item.labelKey)}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium min-h-[48px] text-primary-foreground/70 w-full focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <LogOut className="w-5 h-5" />
                {t("auth.logout")} {user ? `(${user.name.split(" ")[0]})` : ""}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 lg:px-8 py-2">
          <p className="text-xs text-muted-foreground text-center">{t("nav.subheader")}</p>
        </div>
      </div>

      <main className="flex-1" role="main">{children}</main>

      <HelpFab />

      <footer className="bg-primary text-primary-foreground" role="contentinfo">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <span className="text-primary font-bold text-xs">BT</span>
                </div>
                <span className="font-semibold">Bharat Trust AI</span>
              </div>
              <p className="text-primary-foreground/60 text-sm">{t("footer.tagline")}</p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-2">{t("footer.developedBy")}</p>
              <p className="text-primary-foreground/80 text-sm">YellowSense Technologies Pvt Ltd</p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-2">{t("footer.hackathon")}</p>
              <p className="text-primary-foreground/80 text-sm">{t("footer.hackathonDesc")}</p>
              <p className="text-primary-foreground/60 text-xs mt-1">{t("footer.hackathonTheme")}</p>
            </div>
          </div>
          <div className="border-t border-primary-foreground/10 mt-6 pt-4 text-center">
            <p className="text-primary-foreground/40 text-xs">{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

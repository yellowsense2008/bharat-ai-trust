import { useState } from "react";
import { Shield, Bot, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEasyMode } from "@/contexts/EasyModeContext";
import { useT } from "@/lib/i18n";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChatComplaint } from "@/components/complaint/ChatComplaint";
import { ManualComplaintForm } from "@/components/complaint/ManualComplaintForm";

export default function FileComplaint() {
  const { isAuthenticated } = useAuth();
  const { easyMode, language } = useEasyMode();
  const t = useT(language);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
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
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 max-w-2xl flex flex-col" style={{ height: "calc(100vh - 80px)" }}>
      {/* Header */}
      <div className="mb-4">
        <h1 className={`font-bold ${easyMode ? "text-3xl" : "text-2xl"}`}>{t("wizard.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("wizard.subtitle")}</p>
      </div>

      {/* Mode Tabs */}
      <Tabs defaultValue="ai" className="flex flex-col flex-1 min-h-0">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="ai" className="flex-1 gap-2">
            <Bot className="w-4 h-4" />
            {language === "hi" ? "AI सहायक (अनुशंसित)" : "AI Assistant (Recommended)"}
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex-1 gap-2">
            <FileText className="w-4 h-4" />
            {language === "hi" ? "मैन्युअल भरें" : "Fill Manually"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="flex-1 flex flex-col min-h-0 mt-0">
          <ChatComplaint />
        </TabsContent>

        <TabsContent value="manual" className="flex-1 flex flex-col min-h-0 mt-0">
          <ManualComplaintForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

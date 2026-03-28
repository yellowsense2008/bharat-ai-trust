import { Globe } from "lucide-react";

interface WizardHeaderProps {
  title: string;
  subtitle: string;
  lang: "en" | "hi";
  onLangChange: (lang: "en" | "hi") => void;
  step: number;
  totalSteps: number;
}

export function WizardHeader({ title, subtitle, lang, onLangChange, step, totalSteps }: WizardHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Title row with language selector */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1 shrink-0">
          <Globe className="w-4 h-4 text-muted-foreground ml-2" />
          <button
            onClick={() => onLangChange("en")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onLangChange("hi")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              lang === "hi" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            हिं
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < step ? "bg-success" : i === step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

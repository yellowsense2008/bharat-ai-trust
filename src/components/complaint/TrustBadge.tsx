import { Shield, Lock, Clock } from "lucide-react";

interface TrustBadgeProps {
  secureBadge: string;
  privacyNote: string;
  resolutionPreview: string;
}

export function TrustBadge({ secureBadge, privacyNote, resolutionPreview }: TrustBadgeProps) {
  return (
    <div className="space-y-3">
      {/* Secure badge */}
      <div className="flex items-center gap-2 bg-success/10 text-success rounded-lg px-4 py-2.5">
        <Shield className="w-4 h-4 shrink-0" />
        <span className="text-sm font-semibold">{secureBadge}</span>
      </div>

      {/* Resolution preview */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="w-4 h-4 shrink-0" />
        <span className="text-xs">{resolutionPreview}</span>
      </div>

      {/* Privacy note */}
      <div className="flex items-start gap-2 text-muted-foreground">
        <Lock className="w-4 h-4 shrink-0 mt-0.5" />
        <span className="text-xs leading-relaxed">{privacyNote}</span>
      </div>
    </div>
  );
}

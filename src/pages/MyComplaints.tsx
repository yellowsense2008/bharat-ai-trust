import { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle, AlertTriangle, Inbox } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useEasyMode } from "@/contexts/EasyModeContext";
import { useT } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Complaint {
  reference_id: string;
  title: string;
  status: string;
  created_at: string;
  category?: string;
  priority?: string;
  assigned_department?: string;
}

export default function MyComplaints() {
  const { language, easyMode } = useEasyMode();
  const t = useT(language);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0, avgTime: "—" });
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.getAnalytics().catch(() => null),
      api.getMyComplaints().catch((err: Error) => {
        if (mounted) {
          toast({
            title: "Failed to load complaints",
            description: err?.message || "Please try again later.",
            variant: "destructive",
          });
        }
        return null;
      }),
    ]).then(([analyticsRes, complaintsRes]) => {
      if (!mounted) return;
      if (analyticsRes) {
        setStats({
          total: analyticsRes.total || 0,
          active: analyticsRes.active || 0,
          resolved: analyticsRes.resolved || 0,
          avgTime: analyticsRes.avg_resolution_time || "—",
        });
      }
      const list: Complaint[] = Array.isArray(complaintsRes)
        ? complaintsRes
        : Array.isArray(complaintsRes?.complaints)
        ? complaintsRes.complaints
        : [];
      setComplaints(list.slice(0, 10));
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const statCards = [
    { label: t("complaints.total"), value: stats.total, icon: FileText, color: "text-primary" },
    { label: t("complaints.active"), value: stats.active, icon: AlertTriangle, color: "text-accent" },
    { label: t("complaints.resolved"), value: stats.resolved, icon: CheckCircle, color: "text-success" },
    { label: t("complaints.avgTime"), value: stats.avgTime, icon: Clock, color: "text-primary" },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
      <h1 className={`font-bold mb-2 ${easyMode ? "text-3xl" : "text-2xl lg:text-3xl"}`}>{t("complaints.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("complaints.subtitle")}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" role="region" aria-label="Complaint statistics">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-5 shadow-card space-y-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))
        ) : (
          statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-lg p-5 shadow-card"
            >
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} aria-hidden="true" />
              <p className={`font-bold tabular-nums ${easyMode ? "text-3xl" : "text-2xl"}`}>{s.value}</p>
              <p className={`text-muted-foreground ${easyMode ? "text-base" : "text-sm"}`}>{s.label}</p>
            </motion.div>
          ))
        )}
      </div>

      {/* Complaint List */}
      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">{t("complaints.recent")}</h2>
        </div>

        {loading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-32 hidden sm:block" />
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" aria-hidden="true" />
            <p className={`font-medium text-muted-foreground ${easyMode ? "text-xl" : "text-lg"}`}>{t("complaints.empty")}</p>
            <p className="text-sm text-muted-foreground/70 mt-1 mb-6">{t("complaints.emptySub")}</p>
            <Link
              to="/app/file-complaint"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg min-h-[var(--button-height)] hover:brightness-110 transition-all"
            >
              <FileText className="w-5 h-5" />
              {t("nav.fileComplaint")}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground" scope="col">{t("complaints.id")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground" scope="col">{t("complaints.category")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell" scope="col">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground" scope="col">{t("complaints.status")}</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c, i) => (
                  <tr key={c.reference_id || i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className={`p-3 font-semibold tabular-nums ${easyMode ? "text-base" : ""}`}>{c.reference_id}</td>
                    <td className="p-3">{c.title}</td>
                    <td className="p-3 hidden sm:table-cell text-muted-foreground">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        c.status === "Resolved" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                      }`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

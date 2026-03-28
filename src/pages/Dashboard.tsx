import { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const defaultStats = {
  total: 1248, active: 312, resolved: 893, avgTime: "42.5 hrs",
};

const demoComplaints = [
  { reference_id: "BT-2025A1", category: "UPI", assigned_department: "Digital Payments", priority: "High", status: "In Progress" },
  { reference_id: "BT-2025A2", category: "Card", assigned_department: "Card Services", priority: "Medium", status: "Assigned" },
  { reference_id: "BT-2025A3", category: "Payments", assigned_department: "Payment Operations", priority: "Low", status: "Resolved" },
  { reference_id: "BT-2025A4", category: "Loan", assigned_department: "Lending", priority: "High", status: "Submitted" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(defaultStats);
  const [complaints, setComplaints] = useState(demoComplaints);

  useEffect(() => {
    api.getAnalytics().then((res) => {
      if (res) setStats({
        total: res.total || defaultStats.total,
        active: res.active || defaultStats.active,
        resolved: res.resolved || defaultStats.resolved,
        avgTime: res.avg_resolution_time || defaultStats.avgTime,
      });
    }).catch(() => {});
    api.getComplaints().then((res) => {
      if (res?.complaints?.length) setComplaints(res.complaints.slice(0, 10));
    }).catch(() => {});
  }, []);

  const statCards = [
    { label: "Total Complaints", value: stats.total, icon: FileText, color: "text-primary" },
    { label: "Active", value: stats.active, icon: AlertTriangle, color: "text-accent" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle, color: "text-success" },
    { label: "Avg Resolution", value: stats.avgTime, icon: Clock, color: "text-primary" },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
      <h1 className="text-2xl lg:text-3xl font-bold mb-2">Track C Dashboard</h1>
      <p className="text-muted-foreground mb-8">AI-Powered Customer Grievance Redressal Analytics</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-lg p-5 shadow-card"
          >
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Complaint List */}
      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Recent Complaints</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Reference ID</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Department</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Priority</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-semibold tabular-nums">{c.reference_id}</td>
                  <td className="p-3">{c.category}</td>
                  <td className="p-3 hidden sm:table-cell">{c.assigned_department}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      c.priority === "High" ? "bg-destructive/10 text-destructive" :
                      c.priority === "Medium" ? "bg-accent/20 text-accent-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>{c.priority}</span>
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
      </div>
    </div>
  );
}

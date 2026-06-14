import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { MobileShell } from "@/components/MobileShell";
import { TopBar } from "@/components/TopBar";
import { BrainCircuit, AlertTriangle, CheckCircle2, TrendingUp, RefreshCw, AlertCircle, History, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-reports")({
  component: AdminReports,
});

function AdminReports() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReports = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setLoading(true);
    
    try {
      const res = await api.get(`/api/admin/ai-reports?refresh=${forceRefresh}`);
      if (res.data.status === "success") {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load AI Action Reports.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <MobileShell>
        <TopBar title="AI Action Reports" back={false} />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <BrainCircuit className="h-12 w-12 text-indigo-500 animate-pulse mb-4" />
          <p className="text-sm font-bold text-slate-500">Connecting to Intelligence Engine...</p>
        </div>
      </MobileShell>
    );
  }

  if (!data) {
    return (
      <MobileShell>
        <TopBar title="AI Action Reports" back={false} />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-sm font-bold text-red-500">Failed to load reports</p>
        </div>
      </MobileShell>
    );
  }

  const reports = data.data.reports || [];
  const generalInsights = data.data.general_insights || [];
  
  const getPriorityColors = (priority: string) => {
    if (priority === "HIGH") return "border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5 text-red-600";
    if (priority === "MEDIUM") return "border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-600";
    return "border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5 text-green-600";
  };

  const getPriorityBadgeColors = (priority: string) => {
    if (priority === "HIGH") return "bg-red-500 text-white shadow-red-500/20 shadow-lg";
    if (priority === "MEDIUM") return "bg-amber-500 text-white shadow-amber-500/20 shadow-lg";
    return "bg-green-500 text-white shadow-green-500/20 shadow-lg";
  };

  return (
    <MobileShell>
      <TopBar title="AI Reports" back={false} />

      <div className="px-4 pt-4 pb-24 space-y-6 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center justify-between bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <BrainCircuit className="h-8 w-8 text-indigo-500" />
              Business Intelligence Engine
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              AI-generated action reports based on real-time merchant analytics.
            </p>
          </div>
          <button
            onClick={() => fetchReports(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>

        {/* Action Cards Section */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" /> Priority Action Reports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reports.map((report: any, idx: number) => (
              <div key={idx} className={`rounded-3xl border p-6 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 ${getPriorityColors(report.priority)}`}>
                
                {/* Priority Badge */}
                <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-[10px] font-black uppercase tracking-wider ${getPriorityBadgeColors(report.priority)}`}>
                  {report.priority} Priority
                </div>

                <div className="mb-4 pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    {report.type === "alert" ? (
                      <AlertTriangle className="h-5 w-5" />
                    ) : (
                      <TrendingUp className="h-5 w-5" />
                    )}
                    <h3 className="font-black text-lg">{report.title}</h3>
                  </div>
                  <p className="text-sm font-semibold opacity-90 leading-relaxed">
                    {report.insight}
                  </p>
                </div>

                <div className="space-y-3 bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-sm mt-auto">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold opacity-70 mb-1">Reason</p>
                    <p className="text-xs font-bold">{report.reason}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold opacity-70 mb-1">Recommendation</p>
                    <p className="text-xs font-bold">{report.recommendation}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold opacity-70 mb-1">Expected Impact</p>
                    <p className="text-sm font-black text-indigo-600">{report.expected_impact}</p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Lower Section: Global Insights & History */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Global Insights */}
          <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-indigo-500" /> Market Intelligence
            </h2>
            <div className="space-y-3">
              {generalInsights.map((insight: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                  <p className="text-sm font-semibold text-slate-700 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Report History */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-500" /> Generation Log
            </h2>
            <div className="space-y-4">
              {data.history && data.history.map((hist: any, idx: number) => {
                const date = new Date(hist.created_at);
                return (
                  <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Automated Scan</p>
                      <p className="text-[10px] text-slate-500">{date.toLocaleDateString()} at {date.toLocaleTimeString()}</p>
                    </div>
                    <div className="bg-green-100 text-green-600 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Success
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </MobileShell>
  );
}

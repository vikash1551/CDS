import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MerchantShell } from "@/components/MerchantShell";
import { TopBar } from "@/components/TopBar";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Package,
  BarChart3,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Sparkles,
  RefreshCw,
  IndianRupee,
  Activity,
  ListTodo,
  Lightbulb
} from "lucide-react";

export const Route = createFileRoute("/merchant-stock-prediction")({
  head: () => ({
    meta: [
      { title: "AI Inventory Analyzer — Campus Flow" },
      {
        name: "description",
        content: "Professional AI-powered inventory analysis and demand prediction.",
      },
    ],
  }),
  component: AIInventoryAnalyzer,
});

interface ProductAnalysis {
  name: string;
  category: string;
  current_stock: number;
  weekly_consumption: number;
  days_remaining: number;
  demand_growth: string;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  suggested_restock: number;
  predicted_7_days: number;
  predicted_30_days: number;
  price: number;
}

interface DashboardData {
  health_score: number;
  health_status: "GOOD" | "WARNING" | "CRITICAL";
  total_products: number;
  total_inventory_value: number;
  high_risk_items: number;
  medium_risk_items: number;
  low_risk_items: number;
  weekly_sales_forecast: number;
  monthly_sales_forecast: number;
  potential_revenue_forecast: number;
  top_selling_product: string;
  top_selling_growth: string;
}

interface AnalysisData {
  status: string;
  demo_mode: boolean;
  message: string;
  dashboard: DashboardData;
  insights: string[];
  priority_actions: string[];
  products: ProductAnalysis[];
}

function AIInventoryAnalyzer() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/merchant/ai-inventory-analysis");
      if (res.data.status === "success") {
        setData(res.data);
        if (res.data.demo_mode) {
          toast.info("Demo Analysis Mode Active", { duration: 3000 });
        }
      } else {
        toast.error("Failed to fetch analysis.");
      }
    } catch {
      toast.error("Failed to get analysis. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const riskConfig = {
    HIGH: {
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      icon: <ShieldAlert className="h-4 w-4" />,
      label: "High Risk",
    },
    MEDIUM: {
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      icon: <Shield className="h-4 w-4" />,
      label: "Medium Risk",
    },
    LOW: {
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      icon: <ShieldCheck className="h-4 w-4" />,
      label: "Low Risk",
    },
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/20";
    if (score >= 50) return "bg-amber-500/10 border-amber-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  return (
    <MerchantShell>
      <TopBar title="AI Inventory Analyzer" back={false} />

      <div className="px-4 pt-2 pb-20 md:pb-6 space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6 text-brand" />
              Inventory Intelligence
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              AI-driven insights & demand forecasting
            </p>
          </div>
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand/10 text-brand px-3 py-2 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 mb-4">
              <Brain className="h-7 w-7 text-brand animate-pulse" />
            </div>
            <p className="text-sm font-bold mt-2">Analyzing Inventory...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Generating insights & demand forecasts
            </p>
          </div>
        ) : data ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* Demo Mode Banner */}
            {data.demo_mode && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 flex items-center gap-2 text-blue-500">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold">Demo Analysis Mode Active</span>
              </div>
            )}

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              
              {/* Health Score - Main Card */}
              <div className={`col-span-2 md:col-span-1 rounded-3xl border p-5 flex flex-col items-center justify-center relative overflow-hidden shadow-sm hover:shadow-md transition-all ${getHealthBg(data.dashboard.health_score)}`}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Activity className="h-20 w-20" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80 z-10">Health Score</p>
                <div className="flex items-baseline gap-1 z-10">
                  <span className={`text-6xl font-black ${getHealthColor(data.dashboard.health_score)} tracking-tighter`}>{data.dashboard.health_score}</span>
                  <span className="text-lg opacity-60 font-bold">/100</span>
                </div>
                <div className={`mt-3 px-4 py-1 rounded-full text-xs font-extrabold tracking-wide ${getHealthColor(data.dashboard.health_score)} bg-background/80 shadow-sm z-10`}>
                  {data.dashboard.health_status}
                </div>
              </div>

              {/* Core Financials */}
              <div className="col-span-2 md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Total Inventory Value */}
                <div className="rounded-3xl border border-border bg-card p-5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500"><Package className="h-4 w-4" /></div>
                    <p className="text-[10px] font-bold uppercase tracking-wider">Inventory Value</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground flex items-center">
                      <IndianRupee className="h-5 w-5 mr-0.5" />
                      {data.dashboard.total_inventory_value.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">Across {data.dashboard.total_products} products</p>
                  </div>
                </div>

                {/* Potential 30D Revenue */}
                <div className="rounded-3xl border border-border bg-card p-5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <div className="p-2 bg-green-500/10 rounded-xl text-green-500"><IndianRupee className="h-4 w-4" /></div>
                    <p className="text-[10px] font-bold uppercase tracking-wider">30D Rev Forecast</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground flex items-center">
                      <IndianRupee className="h-5 w-5 mr-0.5" />
                      {data.dashboard.potential_revenue_forecast.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-green-500 flex items-center gap-1 mt-1 font-bold">
                      <TrendingUp className="h-3 w-3" /> Trending Upwards
                    </p>
                  </div>
                </div>

                {/* 7D vs 30D Volume */}
                <div className="col-span-2 md:col-span-1 rounded-3xl border border-border bg-card p-5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <div className="p-2 bg-brand/10 rounded-xl text-brand"><BarChart3 className="h-4 w-4" /></div>
                    <p className="text-[10px] font-bold uppercase tracking-wider">Volume Forecast</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold">Weekly</p>
                      <p className="text-lg font-black">{data.dashboard.weekly_sales_forecast.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold">Monthly</p>
                      <p className="text-lg font-black">{data.dashboard.monthly_sales_forecast.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Distribution & Top Product */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Risk Cards */}
              <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                  <ShieldAlert className="h-6 w-6 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-2xl font-black text-red-500">{data.dashboard.high_risk_items}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">High Risk</p>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                  <Shield className="h-6 w-6 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-2xl font-black text-amber-500">{data.dashboard.medium_risk_items}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Medium Risk</p>
                </div>
                <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                  <ShieldCheck className="h-6 w-6 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-2xl font-black text-green-500">{data.dashboard.low_risk_items}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Low Risk</p>
                </div>
              </div>

              {/* Top Product Hero */}
              <div className="col-span-1 rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/10 to-brand/5 p-5 flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-5 bg-brand h-32 w-32 rounded-full blur-2xl group-hover:bg-brand/20 transition-all duration-500" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand mb-1">Top Performer</p>
                <p className="text-2xl font-black text-foreground truncate">{data.dashboard.top_selling_product}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {data.dashboard.top_selling_growth}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">Demand Growth</span>
                </div>
              </div>
            </div>

            {/* Insights & Actions Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Business Insights Panel */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="bg-blue-500/10 px-4 py-3 flex items-center gap-2 border-b border-border">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  <h3 className="text-xs font-bold text-blue-500">Business Insights</h3>
                </div>
                <div className="p-4 space-y-3">
                  {data.insights.map((insight, idx) => (
                    <div key={idx} className="flex gap-2.5">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                      <p className="text-xs leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Actions Panel */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="bg-brand/10 px-4 py-3 flex items-center gap-2 border-b border-border">
                  <ListTodo className="h-4 w-4 text-brand" />
                  <h3 className="text-xs font-bold text-brand">Priority Actions</h3>
                </div>
                <div className="p-4 space-y-3">
                  {data.priority_actions.map((action, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand/20 text-[9px] font-bold text-brand">
                        {idx + 1}
                      </div>
                      <p className="text-xs font-semibold leading-relaxed">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Risk Table */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Inventory Forecast Details
                </h3>
                <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-full font-bold">
                  {data.products.length} Items
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-secondary/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Product</th>
                      <th className="px-4 py-3 font-semibold text-center">Stock</th>
                      <th className="px-4 py-3 font-semibold text-center">Days Left</th>
                      <th className="px-4 py-3 font-semibold text-center">Growth</th>
                      <th className="px-4 py-3 font-semibold">Risk Level</th>
                      <th className="px-4 py-3 font-semibold text-right">30D Forecast</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.products.map((product) => (
                      <tr key={product.name} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-xs">{product.name}</p>
                          <p className="text-[9px] text-muted-foreground">{product.category}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-xs">{product.current_stock}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold text-xs ${product.days_remaining < 7 ? 'text-red-500' : ''}`}>
                            {product.days_remaining}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            product.demand_growth.startsWith('-') ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'
                          }`}>
                            {product.demand_growth}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`flex w-fit items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold ${riskConfig[product.risk_level].bg} ${riskConfig[product.risk_level].color}`}>
                            {riskConfig[product.risk_level].icon}
                            {riskConfig[product.risk_level].label}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-xs text-brand">{product.predicted_30_days}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </MerchantShell>
  );
}

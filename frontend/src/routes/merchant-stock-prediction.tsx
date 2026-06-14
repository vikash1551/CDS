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
  Search,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Sparkles,
  ArrowRight,
  Box,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/merchant-stock-prediction")({
  head: () => ({
    meta: [
      { title: "AI Stock Prediction — UniDrop" },
      {
        name: "description",
        content:
          "AI-powered stock demand prediction for smart inventory management.",
      },
    ],
  }),
  component: StockPrediction,
});

interface Product {
  name: string;
  stock: number;
  category: string;
  product_id: string;
}

interface Prediction {
  item: string;
  current_stock: number;
  predicted_demand_next_7_days: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  recommendation: string;
  confidence_score: number;
  daily_forecast: number[];
}

function StockPrediction() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [animatedDemand, setAnimatedDemand] = useState(0);

  // Fetch product list on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/prediction-products");
        if (res.data.products) {
          setProducts(res.data.products);
          if (res.data.products.length > 0) {
            setSelectedItem(res.data.products[0].name);
          }
        }
      } catch {
        toast.error("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Animate demand number on prediction change
  useEffect(() => {
    if (!prediction) return;
    const target = prediction.predicted_demand_next_7_days;
    const steps = 35;
    let step = 0;
    setAnimatedDemand(0);
    const interval = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
      setAnimatedDemand(Math.round(target * ease));
      if (step >= steps) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [prediction]);

  const handlePredict = async () => {
    if (!selectedItem) {
      toast.error("Please select a product first");
      return;
    }

    setLoading(true);
    setPrediction(null);

    try {
      const res = await api.get(
        `/api/predict-stock?item=${encodeURIComponent(selectedItem)}`
      );
      if (res.data.status === "success") {
        setPrediction(res.data);
        toast.success("Prediction generated!");
      } else {
        toast.error(res.data.message || "Prediction failed");
      }
    } catch {
      toast.error("Failed to get prediction. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const riskConfig = {
    HIGH: {
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      glow: "shadow-red-500/20",
      icon: <ShieldAlert className="h-5 w-5" />,
      label: "High Risk",
      barColor: "bg-red-500",
    },
    MEDIUM: {
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      glow: "shadow-amber-500/20",
      icon: <Shield className="h-5 w-5" />,
      label: "Medium Risk",
      barColor: "bg-amber-500",
    },
    LOW: {
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      glow: "shadow-green-500/20",
      icon: <ShieldCheck className="h-5 w-5" />,
      label: "Low Risk",
      barColor: "bg-green-500",
    },
  };

  const maxForecast = prediction
    ? Math.max(...prediction.daily_forecast, 1)
    : 1;

  const dayLabels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

  return (
    <MerchantShell>
      <TopBar title="AI Stock Prediction" back={false} />

      <div className="px-4 pt-2 pb-6">
        {/* Hero Section */}
        <div
          className="rounded-2xl p-5 mb-5 text-white relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <Brain className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-bold">AI Demand Predictor</h2>
                <p className="text-[10px] opacity-60">
                  Powered by Linear Regression · 7-Day Forecast
                </p>
              </div>
            </div>
            <p className="text-xs opacity-70 mt-2">
              Select a product and get AI-powered stock demand predictions with
              risk assessment and restock recommendations.
            </p>
          </div>
        </div>

        {/* Product Selector */}
        <div className="rounded-2xl border border-border bg-card p-4 mb-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <Package className="h-4 w-4 text-brand" /> Select Product
          </h3>

          {loadingProducts ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <select
                id="product-selector"
                value={selectedItem}
                onChange={(e) => {
                  setSelectedItem(e.target.value);
                  setPrediction(null);
                }}
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/50 appearance-none"
              >
                {products.map((p) => (
                  <option key={p.product_id} value={p.name}>
                    {p.name} — Stock: {p.stock}
                  </option>
                ))}
              </select>

              <button
                id="predict-stock-btn"
                onClick={handlePredict}
                disabled={loading || !selectedItem}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-brand text-brand-foreground px-4 py-3 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing data...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Predict Stock Demand
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Prediction Results */}
        {prediction && (
          <div
            className="space-y-4"
            style={{ animation: "prediction-fade-in 0.5s ease-out" }}
          >
            {/* Main Stats Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Predicted Demand */}
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <BarChart3 className="mx-auto h-5 w-5 text-blue-500 mb-2" />
                <p
                  className="text-3xl font-bold tabular-nums"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {animatedDemand}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  7-Day Predicted Demand
                </p>
              </div>

              {/* Risk Level */}
              <div
                className={`rounded-2xl border p-4 text-center ${riskConfig[prediction.risk_level].bg} ${riskConfig[prediction.risk_level].border}`}
              >
                <div
                  className={`mx-auto mb-2 ${riskConfig[prediction.risk_level].color}`}
                >
                  {riskConfig[prediction.risk_level].icon}
                </div>
                <p
                  className={`text-lg font-bold ${riskConfig[prediction.risk_level].color}`}
                >
                  {riskConfig[prediction.risk_level].label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Risk Assessment
                </p>
              </div>
            </div>

            {/* Stock vs Demand comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-card p-3 text-center">
                <Box className="mx-auto h-4 w-4 text-amber-500 mb-1" />
                <p className="text-xl font-bold">{prediction.current_stock}</p>
                <p className="text-[9px] text-muted-foreground">
                  Current Stock
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-3 text-center">
                <TrendingUp className="mx-auto h-4 w-4 text-brand mb-1" />
                <p className="text-xl font-bold">
                  {Math.round(prediction.confidence_score * 100)}%
                </p>
                <p className="text-[9px] text-muted-foreground">
                  AI Confidence
                </p>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5 text-purple-500" />
                  Model Confidence
                </h3>
                <span className="text-xs font-bold text-brand">
                  {Math.round(prediction.confidence_score * 100)}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${prediction.confidence_score * 100}%`,
                    background:
                      prediction.confidence_score > 0.7
                        ? "var(--brand)"
                        : prediction.confidence_score > 0.4
                          ? "#f59e0b"
                          : "#ef4444",
                    animation: "grow-width 1s ease-out",
                  }}
                />
              </div>
            </div>

            {/* 7-Day Forecast Chart */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-brand" />
                7-Day Demand Forecast
              </h3>
              <div className="flex items-end gap-2 h-28">
                {prediction.daily_forecast.map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-[9px] font-bold text-muted-foreground">
                      {val}
                    </span>
                    <div
                      className="w-full rounded-t-lg"
                      style={{
                        height: `${(val / maxForecast) * 100}%`,
                        minHeight: "4px",
                        background:
                          prediction.risk_level === "HIGH"
                            ? "rgba(239, 68, 68, 0.7)"
                            : prediction.risk_level === "MEDIUM"
                              ? "rgba(245, 158, 11, 0.7)"
                              : "var(--brand)",
                        transformOrigin: "bottom",
                        animation: `grow-bar 0.6s ease-out ${i * 0.08}s both`,
                      }}
                    />
                    <span className="text-[8px] font-semibold text-muted-foreground">
                      {dayLabels[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div
              className={`rounded-2xl border p-4 ${riskConfig[prediction.risk_level].bg} ${riskConfig[prediction.risk_level].border}`}
            >
              <h3
                className={`text-sm font-bold mb-2 flex items-center gap-1.5 ${riskConfig[prediction.risk_level].color}`}
              >
                {prediction.risk_level === "HIGH" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : prediction.risk_level === "MEDIUM" ? (
                  <RefreshCw className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                AI Recommendation
              </h3>
              <p className="text-xs leading-relaxed">
                {prediction.recommendation}
              </p>
            </div>

            {/* Re-predict button */}
            <button
              onClick={handlePredict}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold transition-all hover:bg-secondary/50 active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4" /> Re-analyze
            </button>
          </div>
        )}

        {/* Empty State */}
        {!prediction && !loading && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-4">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold">No prediction yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
              Select a product above and click{" "}
              <span className="font-bold text-brand">Predict Stock Demand</span>{" "}
              to get AI-powered insights.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            style={{ animation: "prediction-fade-in 0.3s ease-out" }}
          >
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 mb-4">
                <Brain className="h-7 w-7 text-brand animate-pulse" />
              </div>
              <div className="absolute -inset-2 rounded-3xl bg-brand/5 animate-ping" />
            </div>
            <p className="text-sm font-bold mt-2">Analyzing patterns...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Running linear regression on historical data
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes prediction-fade-in {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes grow-bar {
          0% { transform: scaleY(0); }
          100% { transform: scaleY(1); }
        }
        @keyframes grow-width {
          0% { width: 0%; }
        }
      `}</style>
    </MerchantShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MerchantShell } from "@/components/MerchantShell";
import { TopBar } from "@/components/TopBar";
import { api } from "@/lib/api";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Package,
  IndianRupee,
  Activity,
  Lightbulb,
  Search,
  Filter,
  BarChart3,
  Calendar,
  AlertCircle
} from "lucide-react";

export const Route = createFileRoute("/merchant-analytics")({
  component: MerchantAnalytics,
});

function MerchantAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [timeFilter, setTimeFilter] = useState("This Week");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/merchant/analytics?time_range=${encodeURIComponent(timeFilter)}&category=${encodeURIComponent(categoryFilter)}&search=${encodeURIComponent(searchQuery)}`);
        if (res.data.status === "success") {
          setData(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [timeFilter, categoryFilter, searchQuery]);

  if (loading) {
    return (
      <MerchantShell>
        <TopBar title="Inventory Analytics" back={false} />
        <div className="flex flex-col items-center justify-center py-32">
          <Brain className="h-10 w-10 text-brand animate-pulse mb-4" />
          <p className="text-sm font-bold text-muted-foreground">Loading AI Analytics...</p>
        </div>
      </MerchantShell>
    );
  }

  if (!data) {
    return (
      <MerchantShell>
        <TopBar title="Inventory Analytics" back={false} />
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
          <p className="text-sm font-bold text-red-500">Failed to load analytics</p>
          <p className="text-xs text-muted-foreground mt-2">The server might be down or returned an error.</p>
        </div>
      </MerchantShell>
    );
  }

  // Frontend table uses the exact backend prediction_table
  let filteredTable = data.prediction_table;

  return (
    <MerchantShell>
      <TopBar title="Inventory Analytics" back={false} />

      <div className="px-4 pt-2 pb-24 space-y-6 max-w-7xl mx-auto">
        
        {/* TOP FILTER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <select 
                className="bg-transparent text-xs font-bold outline-none text-foreground"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>Custom Date Range</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                className="bg-transparent text-xs font-bold outline-none text-foreground"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option>All</option>
                <option>Food</option>
                <option>Beverages</option>
                <option>Stationery</option>
                <option>Electronics</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2 flex-1 md:max-w-xs">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search product..." 
              className="bg-transparent text-xs font-bold outline-none w-full placeholder:text-muted-foreground/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* KPI CARDS (4 Cards Only) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2 text-green-500 mb-3">
              <div className="p-2 bg-green-500/10 rounded-xl"><IndianRupee className="h-4 w-4" /></div>
              <p className="text-[10px] font-bold uppercase tracking-wider">Total Revenue</p>
            </div>
            <p className="text-2xl font-black">{data.kpis.total_revenue.toLocaleString()}</p>
          </div>
          
          <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2 text-blue-500 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-xl"><Package className="h-4 w-4" /></div>
              <p className="text-[10px] font-bold uppercase tracking-wider">Total Units Sold</p>
            </div>
            <p className="text-2xl font-black">{data.kpis.total_units_sold.toLocaleString()}</p>
          </div>
          
          <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2 text-red-500 mb-3">
              <div className="p-2 bg-red-500/10 rounded-xl"><AlertTriangle className="h-4 w-4" /></div>
              <p className="text-[10px] font-bold uppercase tracking-wider">Low Stock Alerts</p>
            </div>
            <p className="text-2xl font-black">{data.kpis.low_stock_alerts}</p>
          </div>
          
          <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2 text-brand mb-3">
              <div className="p-2 bg-brand/10 rounded-xl"><Brain className="h-4 w-4" /></div>
              <p className="text-[10px] font-bold uppercase tracking-wider">AI Accuracy</p>
            </div>
            <p className="text-2xl font-black">{data.kpis.ai_accuracy}%</p>
          </div>
        </div>

        {/* SECTION 1: AI INSIGHTS & SECTION 6: SMART RECOMMENDATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Lightbulb className="h-4 w-4 text-amber-500" /> AI Insights
            </h3>
            <div className="space-y-3">
              {data.insights.map((insight: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 bg-secondary/30 p-3 rounded-2xl">
                  <p className="text-xs font-semibold leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-brand" /> Smart Recommendations
            </h3>
            <div className="space-y-3">
              {data.smart_recommendations.map((rec: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 bg-brand/5 p-3 rounded-2xl border border-brand/10">
                  <div className="h-5 w-5 rounded-full bg-brand/20 text-brand flex items-center justify-center text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-xs font-semibold leading-relaxed text-brand">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: TRENDING PRODUCTS */}
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-green-500" /> Trending Products
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {data.trending_products.map((prod: any, idx: number) => (
              <div key={idx} className="bg-secondary/30 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{prod.category}</p>
                  <p className="text-sm font-bold truncate mb-2">{prod.product}</p>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Sold</p>
                    <p className="text-base font-black">{prod.units_sold}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    prod.trend_badge.includes('Trending') ? 'bg-orange-500/10 text-orange-500' :
                    prod.trend_badge.includes('Rising') ? 'bg-green-500/10 text-green-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {prod.trend_badge}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: CATEGORY ANALYTICS & SECTION 5: INVENTORY RISK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-blue-500" /> Category Analytics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {data.category_analytics.map((cat: any, idx: number) => (
                <div key={idx} className="bg-secondary/30 rounded-2xl p-3">
                  <p className="text-xs font-bold mb-2">{cat.category}</p>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-muted-foreground">Sales</span>
                    <span className="text-[10px] font-bold">{cat.total_sales}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-muted-foreground">Revenue</span>
                    <span className="text-[10px] font-bold flex items-center"><IndianRupee className="h-3 w-3" />{cat.revenue}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border/50 mt-1">
                    <span className="text-[10px] text-muted-foreground">Top Item</span>
                    <span className="text-[10px] font-bold truncate max-w-[80px] text-right">{cat.top_product}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm overflow-hidden flex flex-col">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 text-amber-500" /> Inventory Risk
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[220px] custom-scrollbar">
              {data.inventory_risk.map((risk: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-secondary/30 rounded-xl p-3">
                  <span className="text-xs font-semibold">{risk.product}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                    risk.risk_status === 'Low Stock Risk' ? 'bg-red-500/10 text-red-500' :
                    risk.risk_status === 'Overstocked' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-green-500/10 text-green-500'
                  }`}>
                    {risk.risk_status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3: DEMAND PREDICTION TABLE */}
        <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border/50">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand" /> Demand Prediction Table
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-secondary/30 text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-bold">Product</th>
                  <th className="px-5 py-4 font-bold text-center">Current Stock</th>
                  <th className="px-5 py-4 font-bold text-center">Units Sold</th>
                  <th className="px-5 py-4 font-bold text-center">Predicted (Next Wk)</th>
                  <th className="px-5 py-4 font-bold text-center">Rec. Stock</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredTable.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-5 py-4 font-bold text-xs">{row.product}</td>
                    <td className="px-5 py-4 text-center font-semibold text-xs">{row.current_stock}</td>
                    <td className="px-5 py-4 text-center font-semibold text-xs">{row.units_sold}</td>
                    <td className="px-5 py-4 text-center font-bold text-xs text-brand">{row.predicted_demand}</td>
                    <td className="px-5 py-4 text-center font-semibold text-xs">{row.recommended_stock}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        row.status === 'High Demand' ? 'bg-brand/10 text-brand' :
                        row.status === 'Medium Demand' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-secondary text-muted-foreground'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTable.length === 0 && (
              <div className="p-8 text-center text-xs text-muted-foreground font-semibold">
                No products found matching filters.
              </div>
            )}
          </div>
        </div>

      </div>
    </MerchantShell>
  );
}

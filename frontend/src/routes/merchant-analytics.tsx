import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MerchantShell } from "@/components/MerchantShell";
import { TopBar } from "@/components/TopBar";
import { TrendingUp, IndianRupee, Package, Clock, Users, Star, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const Route = createFileRoute("/merchant-analytics")({
  component: MerchantAnalytics,
});

const weeklyRevenue = [
  { day: "Mon", value: 1420 },
  { day: "Tue", value: 2180 },
  { day: "Wed", value: 1850 },
  { day: "Thu", value: 2720 },
  { day: "Fri", value: 3420 },
  { day: "Sat", value: 4100 },
  { day: "Sun", value: 2950 },
];

const hourlyOrders = [
  { hour: "8AM", count: 3 }, { hour: "9AM", count: 8 }, { hour: "10AM", count: 12 },
  { hour: "11AM", count: 15 }, { hour: "12PM", count: 22 }, { hour: "1PM", count: 28 },
  { hour: "2PM", count: 18 }, { hour: "3PM", count: 10 }, { hour: "4PM", count: 14 },
  { hour: "5PM", count: 20 }, { hour: "6PM", count: 25 }, { hour: "7PM", count: 19 },
  { hour: "8PM", count: 16 }, { hour: "9PM", count: 8 },
];

const topProducts = [
  { name: "Masala Maggi Cup", orders: 48, revenue: 1680, emoji: "🍜", trend: 12 },
  { name: "Cold Coffee", orders: 32, revenue: 1920, emoji: "🧋", trend: 8 },
  { name: "Samosa (2 pcs)", orders: 67, revenue: 1340, emoji: "🥟", trend: -3 },
  { name: "Veg Sandwich", orders: 28, revenue: 1120, emoji: "🥪", trend: 15 },
  { name: "Notes Printout", orders: 45, revenue: 225, emoji: "🖨️", trend: 22 },
];

function MerchantAnalytics() {
  const [animatedRevenue, setAnimatedRevenue] = useState(0);
  const [animatedOrders, setAnimatedOrders] = useState(0);
  const totalRevenue = weeklyRevenue.reduce((s, d) => s + d.value, 0);
  const maxRevenue = Math.max(...weeklyRevenue.map((d) => d.value));
  const maxOrders = Math.max(...hourlyOrders.map((h) => h.count));

  useEffect(() => {
    const steps = 40;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
      setAnimatedRevenue(Math.round(totalRevenue * ease));
      setAnimatedOrders(Math.round(247 * ease));
      if (step >= steps) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, []);

  return (
    <MerchantShell>
      <TopBar title="Analytics" back={false} />

      <div className="px-4 pt-2 pb-6">
        {/* Hero Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg, oklch(0.45 0.2 20), oklch(0.4 0.18 35))" }}>
            <IndianRupee className="h-4 w-4 opacity-70" />
            <p className="mt-2 text-2xl font-bold">₹{animatedRevenue.toLocaleString()}</p>
            <p className="text-[10px] opacity-70">This Week's Revenue</p>
            <span className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-bold">
              <ArrowUpRight className="h-2.5 w-2.5" /> 18%
            </span>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <Package className="h-4 w-4 text-red-500" />
            <p className="mt-2 text-2xl font-bold">{animatedOrders}</p>
            <p className="text-[10px] text-muted-foreground">Total Orders</p>
            <span className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-green-500/10 px-1.5 py-0.5 text-[9px] font-bold text-green-600">
              <ArrowUpRight className="h-2.5 w-2.5" /> 12%
            </span>
          </div>
        </div>

        {/* Mini Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <Clock className="mx-auto h-4 w-4 text-amber-500" />
            <p className="mt-1 text-base font-bold">8m</p>
            <p className="text-[9px] text-muted-foreground">Avg ETA</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <Users className="mx-auto h-4 w-4 text-blue-500" />
            <p className="mt-1 text-base font-bold">12</p>
            <p className="text-[9px] text-muted-foreground">Active Couriers</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <Star className="mx-auto h-4 w-4 fill-amber-400 text-amber-400" />
            <p className="mt-1 text-base font-bold">4.8</p>
            <p className="text-[9px] text-muted-foreground">Store Rating</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="rounded-2xl border border-border bg-card p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-red-500" /> Weekly Revenue
            </h3>
            <span className="text-[10px] font-semibold text-muted-foreground">₹{totalRevenue.toLocaleString()}</span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {weeklyRevenue.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-muted-foreground">₹{(d.value / 1000).toFixed(1)}k</span>
                <div
                  className="w-full rounded-t-lg"
                  style={{
                    height: `${(d.value / maxRevenue) * 100}%`,
                    minHeight: "4px",
                    background: i === weeklyRevenue.length - 2 ? "#ef4444" : "oklch(0.55 0.22 25 / 0.3)",
                    transformOrigin: "bottom",
                    animation: `grow-bar 0.6s ease-out ${i * 0.08}s both`,
                  }}
                />
                <span className="text-[9px] font-semibold text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="rounded-2xl border border-border bg-card p-4 mb-5">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-amber-500" /> Peak Order Times
          </h3>
          <div className="flex items-end gap-[3px] h-24">
            {hourlyOrders.map((h, i) => (
              <div key={h.hour} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${(h.count / maxOrders) * 100}%`,
                    minHeight: "3px",
                    background: h.count >= 20 ? "#ef4444" : h.count >= 14 ? "oklch(0.55 0.22 25 / 0.45)" : "oklch(0.55 0.22 25 / 0.2)",
                    transformOrigin: "bottom",
                    animation: `grow-bar 0.5s ease-out ${i * 0.04}s both`,
                  }}
                />
                {i % 2 === 0 && <span className="text-[7px] font-semibold text-muted-foreground">{h.hour}</span>}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground text-center">🔥 Peak hours: <span className="font-bold text-red-500">12 PM – 1 PM</span> & <span className="font-bold text-red-500">5 PM – 6 PM</span></p>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <Package className="h-4 w-4 text-red-500" /> Most Ordered
          </h3>
          <div className="space-y-2.5">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-5 text-center text-xs font-bold text-muted-foreground">#{i + 1}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-lg">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold line-clamp-1">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.orders} orders · ₹{p.revenue}</p>
                </div>
                <span className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${p.trend >= 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>
                  {p.trend >= 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                  {Math.abs(p.trend)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes grow-bar { 0% { transform: scaleY(0); } 100% { transform: scaleY(1); } }
      `}</style>
    </MerchantShell>
  );
}

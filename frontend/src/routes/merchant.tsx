import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { socketService } from "@/lib/socket";
import { MerchantShell } from "@/components/MerchantShell";
import { TopBar } from "@/components/TopBar";
import { Package, TrendingUp, Clock, Bike, Star, IndianRupee, Bell, ChevronRight, Zap, Users, ArrowUpRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/merchant")({
  head: () => ({
    meta: [
      { title: "Lend and Buy Dashboard — UniDrop" },
      { name: "description", content: "Manage your campus shop, orders, and deliveries." },
    ],
  }),
  component: Merchant,
});

import { useMerchantStore } from "@/store/merchantStore";

function Merchant() {
  const { isOpen } = useMerchantStore();
  const [ordersToday, setOrdersToday] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [activeDeliveries, setActiveDeliveries] = useState(0);
  const [avgEta, setAvgEta] = useState(0);
  const [liveOrders, setLiveOrders] = useState<{ id: string; items: string; to: string; time: string; status: string; emoji: string }[]>([]);

  // Animated counter on mount
  useEffect(() => {
    const targets = { orders: 47, revenue: 3420, active: 3, eta: 8 };
    const duration = 1200;
    const steps = 30;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setOrdersToday(Math.round(targets.orders * ease));
      setRevenue(Math.round(targets.revenue * ease));
      setActiveDeliveries(Math.round(targets.active * ease));
      setAvgEta(Math.round(targets.eta * ease));
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, []);

  // Fetch real incoming orders
  const fetchLiveOrders = async () => {
    try {
      const res = await api.get("/merchant/orders");
      if (res.data.orders) {
        const mapped = res.data.orders.map((o: any) => ({
          id: o.order_id || `#ORD-${Math.floor(Math.random() * 900) + 100}`,
          items: Array.isArray(o.items) ? o.items.map((i: any) => `${i.name} × ${i.quantity}`).join(", ") : (o.item || "Unknown item"),
          to: o.delivery_location || "Campus",
          time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: o.status === "pending" ? "new" : o.status,
          emoji: "📦"
        }));
        
        // Show notification for newly arrived orders
        if (liveOrders.length > 0 && mapped.length > liveOrders.length) {
            toast.success("📦 New order received!");
        }

        setLiveOrders(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch live orders", err);
    }
  };

  useEffect(() => {
    fetchLiveOrders();
    
    // Replace polling with WebSocket
    const socket = socketService.connect();
    const handleNewOrder = (data: any) => {
      // Refresh the orders from backend or prepend
      toast.success("📦 New real-time order received!");
      fetchLiveOrders();
    };
    
    socket?.on("new_order", handleNewOrder);
    
    return () => {
      socket?.off("new_order", handleNewOrder);
    };
  }, []);

  const couriers = [
    { name: "Aarav S.", rating: 4.9, drops: 124, match: 94, avatar: "🧑‍🎓", status: "available" },
    { name: "Priya K.", rating: 4.8, drops: 98, match: 87, avatar: "👩‍🎓", status: "delivering" },
    { name: "Rohan M.", rating: 4.7, drops: 87, match: 81, avatar: "🧑", status: "available" },
  ];

  const statusColor = (s: string) => {
    switch (s) {
      case "new": return "bg-red-500/15 text-red-600";
      case "preparing": return "bg-amber-500/15 text-amber-600";
      case "picked": return "bg-blue-500/15 text-blue-600";
      default: return "bg-secondary text-foreground";
    }
  };
  const { totalReceived, totalAccepted, totalPending } = useMerchantStore();

  return (
    <MerchantShell>
      <TopBar
        title="Lend and Buy"
        back={false}
        right={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1.5">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span className="text-[11px] font-bold text-green-600">{totalAccepted}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1.5">
              <Clock className="h-3 w-3 text-amber-600" />
              <span className="text-[11px] font-bold text-amber-600">{totalPending}</span>
            </div>
            <Link to="/merchant-orders" className="relative flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
              <Bell className="h-4 w-4" />
              {totalPending > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-[8px] font-bold text-white ring-2 ring-card">{totalPending}</span>
              )}
            </Link>
          </div>
        }
      />

      {/* Shop Header */}
      <div className="px-4 pb-6 pt-3" style={{ background: "linear-gradient(135deg, oklch(0.45 0.2 20), oklch(0.35 0.18 30))" }}>
        <div className="flex items-center gap-3 text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl ring-4 ring-white/10">🏪</div>
          <div className="flex-1">
            <p className="text-lg font-bold">Hostel Canteen</p>
            <p className="text-[11px] opacity-70">NMIT Campus · Ramesh Kumar</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
            <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-green-400" : "bg-red-400"}`} /> {isOpen ? "Open" : "Closed"}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { icon: <Package className="h-3 w-3" />, label: "Orders", value: ordersToday },
            { icon: <Bike className="h-3 w-3" />, label: "Active", value: activeDeliveries },
            { icon: <IndianRupee className="h-3 w-3" />, label: "Revenue", value: `₹${revenue}` },
            { icon: <Clock className="h-3 w-3" />, label: "Avg ETA", value: `${avgEta}m` },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/10 p-2.5 backdrop-blur text-white text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] font-semibold opacity-70">{s.icon}{s.label}</div>
              <p className="mt-1 text-lg font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="-mt-3 rounded-t-3xl bg-background px-4 pt-5 pb-6">
        {/* Incoming Orders */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold flex items-center gap-1.5">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-rose-600" /></span>
            Live Orders
          </h2>
          <Link to="/merchant-orders" className="text-xs font-semibold text-red-500 flex items-center gap-0.5">View all <ChevronRight className="h-3 w-3" /></Link>
        </div>

        <div className="space-y-2 mb-6">
          {liveOrders.slice(0, 3).map((o, i) => (
            <div
              key={o.id + i}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-all"
              style={{ animation: o.status === "new" ? "fade-up 0.4s ease-out" : undefined }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-xl">{o.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">{o.id}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusColor(o.status)}`}>{o.status}</span>
                </div>
                <p className="text-sm font-semibold line-clamp-1">{o.items}</p>
                <p className="text-[10px] text-muted-foreground">{o.to} · {o.time}</p>
              </div>
              {o.status === "new" && (
                <button
                  onClick={async () => {
                    setLiveOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: "preparing" } : x)));
                    toast.success("Order accepted!");
                    try {
                      await api.post("/merchant/update-order-status", { order_id: o.id, status: "preparing" });
                    } catch (e) {
                      toast.error("Failed to update on server");
                    }
                  }}
                  className="rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-3 py-2 text-[10px] font-bold text-white transition-transform active:scale-95"
                >
                  Accept
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Active Couriers */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold flex items-center gap-1.5"><Users className="h-4 w-4 text-red-500" /> Active Couriers</h2>
          <Link to="/merchant-couriers" className="text-xs font-semibold text-red-500 flex items-center gap-0.5">AI Match <ChevronRight className="h-3 w-3" /></Link>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {couriers.map((c) => (
            <div key={c.name} className="rounded-2xl border border-border bg-card p-3 text-center">
              <span className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-secondary text-xl">{c.avatar}</span>
              <p className="mt-1.5 text-xs font-bold line-clamp-1">{c.name}</p>
              <p className="flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{c.rating}
              </p>
              <div className="mt-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-bold text-red-500">{c.match}% match</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-sm font-bold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Manage Menu", sub: "8 items active", to: "/merchant-products", emoji: "📋" },
            { label: "Analytics", sub: "↑ 12% revenue", to: "/merchant-analytics", emoji: "📊" },
            { label: "Track Deliveries", sub: "3 in transit", to: "/merchant-tracking", emoji: "🗺️" },
            { label: "Store Profile", sub: "4.8 ★ rating", to: "/merchant-profile", emoji: "🏪" },
          ].map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-all hover:bg-secondary/50 active:scale-[0.98]"
            >
              <span className="text-xl">{a.emoji}</span>
              <div>
                <p className="text-xs font-bold">{a.label}</p>
                <p className="text-[10px] text-muted-foreground">{a.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fade-up { 0% { opacity:0; transform:translateY(8px); } 100% { opacity:1; transform:translateY(0); } }
      `}</style>
    </MerchantShell>
  );
}

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
      { title: "Lend and Buy Dashboard — Campus Flow" },
      { name: "description", content: "Manage your campus shop, orders, and deliveries." },
    ],
  }),
  component: Merchant,
});

import { useMerchantStore } from "@/store/merchantStore";

function Merchant() {
  const { isOpen, setIsOpen } = useMerchantStore();
  const [showPauseModal, setShowPauseModal] = useState(false);
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

  // Fetch initial store status and live orders
  const fetchLiveOrdersAndStatus = async () => {
    try {
      const statusRes = await api.get("/merchant/status");
      setIsOpen(statusRes.data.is_open);

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
    fetchLiveOrdersAndStatus();
    
    // Replace polling with WebSocket
    const socket = socketService.connect();
    const handleNewOrder = (data: any) => {
      // Refresh the orders from backend or prepend
      toast.success("📦 New real-time order received!");
      fetchLiveOrdersAndStatus();
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
      case "new": return "bg-brand/15 text-brand";
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
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[8px] font-bold text-brand-foreground ring-2 ring-card">{totalPending}</span>
              )}
            </Link>
          </div>
        }
      />

      {/* Shop Header */}
      <div className="px-4 pb-6 pt-3 bg-brand text-brand-foreground">
        <div className="flex items-center gap-3 text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl ring-4 ring-white/10">🏪</div>
          <div className="flex-1">
            <p className="text-lg font-bold">Hostel Canteen</p>
            <p className="text-[11px] opacity-70">Campus · Ramesh Kumar</p>
          </div>
          {/* Interactive Status Toggle */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-semibold text-white/80 mb-1.5 uppercase tracking-wider">Status</span>
            <button
              onClick={async () => {
                if (isOpen) {
                  setShowPauseModal(true);
                } else {
                  setIsOpen(true);
                  try { await api.post("/merchant/status", { is_open: true }); } catch (e) {}
                  toast.success("Store Opened", { description: "You are now receiving new orders." });
                }
              }}
              className={`relative flex items-center h-8 w-[88px] rounded-full p-1 transition-colors duration-300 shadow-sm ${isOpen ? 'bg-green-500 hover:bg-green-400' : 'bg-red-500 hover:bg-red-400'}`}
            >
              <div className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${isOpen ? 'translate-x-[56px]' : 'translate-x-0'}`} />
              <span className="absolute left-3 text-[10px] font-bold text-white uppercase">{isOpen ? "On" : "Off"}</span>
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
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
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-brand text-brand-foreground" /></span>
            Live Orders
          </h2>
          <Link to="/merchant-orders" className="text-xs font-semibold text-brand flex items-center gap-0.5">View all <ChevronRight className="h-3 w-3" /></Link>
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
                  className="rounded-xl bg-brand text-brand-foreground px-3 py-2 text-[10px] font-bold transition-transform active:scale-95"
                >
                  Accept
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Active Couriers */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold flex items-center gap-1.5"><Users className="h-4 w-4 text-brand" /> Active Couriers</h2>
          <Link to="/merchant-couriers" className="text-xs font-semibold text-brand flex items-center gap-0.5">AI Match <ChevronRight className="h-3 w-3" /></Link>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {couriers.map((c) => (
            <div key={c.name} className="rounded-2xl border border-border bg-card p-3 text-center">
              <span className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-secondary text-xl">{c.avatar}</span>
              <p className="mt-1.5 text-xs font-bold line-clamp-1">{c.name}</p>
              <p className="flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{c.rating}
              </p>
              <div className="mt-1.5 rounded-full bg-brand/10 px-2 py-0.5 text-[9px] font-bold text-brand">{c.match}% match</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-sm font-bold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[
            { label: "Manage Menu", sub: "8 items active", to: "/merchant-products", emoji: "📋" },
            { label: "Analytics", sub: "↑ 12% revenue", to: "/merchant-analytics", emoji: "📊" },
            { label: "Track Deliveries", sub: "3 in transit", to: "/merchant-tracking", emoji: "🗺️" },
            { label: "Store Profile", sub: "4.8 ★ rating", to: "/merchant-profile", emoji: "🏪" },
            { label: "AI Predictions", sub: "Stock forecast", to: "/merchant-stock-prediction", emoji: "🤖" },
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

      {/* Pause Confirmation Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <span className="text-xl">⏸️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Pause your store?</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Your store will stop receiving new orders until reopened.
            </p>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setShowPauseModal(false)}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setIsOpen(false);
                  setShowPauseModal(false);
                  try { await api.post("/merchant/status", { is_open: false }); } catch (e) {}
                  toast("Store Paused", { icon: "🔴", description: "You are no longer receiving new orders." });
                }}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 shadow-sm transition-colors"
              >
                Pause Store
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-up { 0% { opacity:0; transform:translateY(8px); } 100% { opacity:1; transform:translateY(0); } }
      `}</style>
    </MerchantShell>
  );
}

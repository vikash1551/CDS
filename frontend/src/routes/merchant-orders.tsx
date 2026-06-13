import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { socketService } from "@/lib/socket";
import { MerchantShell } from "@/components/MerchantShell";
import { TopBar } from "@/components/TopBar";
import { Clock, CheckCircle2, XCircle, Bike, MapPin, Zap, Receipt, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { useMerchantStore } from "@/store/merchantStore";

export const Route = createFileRoute("/merchant-orders")({
  component: MerchantOrders,
});

type Order = {
  id: string; items: string; to: string; from: string; time: string;
  status: "new" | "preparing" | "assigned" | "picked" | "delivered" | "rejected";
  urgent: boolean; emoji: string; total: number; runner: string | null; eta: string;
};

const initial: Order[] = [
  { id: "#231", items: "Maggi × 2, Coffee", to: "Library Block", from: "Counter 2", time: "Just now", status: "new", urgent: true, emoji: "🍜", total: 130, runner: null, eta: "5 min" },
  { id: "#230", items: "Sandwich, Water Bottle", to: "Hostel B-402", from: "Counter 1", time: "2m ago", status: "new", urgent: false, emoji: "🥪", total: 75, runner: null, eta: "8 min" },
  { id: "#229", items: "Coffee × 3", to: "CSE Lab 4", from: "Counter 2", time: "5m ago", status: "preparing", urgent: false, emoji: "☕", total: 180, runner: "Aarav S.", eta: "6 min" },
  { id: "#228", items: "Notes Printout × 10", to: "Admin Office", from: "Print Desk", time: "8m ago", status: "assigned", urgent: true, emoji: "🖨️", total: 50, runner: "Priya K.", eta: "4 min" },
  { id: "#227", items: "Pen × 5, Notebook", to: "ME Workshop", from: "Counter 1", time: "12m ago", status: "picked", urgent: false, emoji: "✏️", total: 90, runner: "Rohan M.", eta: "3 min" },
  { id: "#226", items: "Water Bottle × 6", to: "Gym Block", from: "Counter 1", time: "20m ago", status: "delivered", urgent: false, emoji: "💧", total: 120, runner: "Sneha R.", eta: "—" },
  { id: "#225", items: "Maggi, Lemon Tea", to: "Hostel A-112", from: "Counter 2", time: "25m ago", status: "delivered", urgent: false, emoji: "🍜", total: 75, runner: "Aarav S.", eta: "—" },
];

function MerchantOrders() {
  const [orders, setOrders] = useState<Order[]>(initial);
  const [filter, setFilter] = useState<string>("all");
  const [expandedBills, setExpandedBills] = useState<Set<string>>(new Set());
  const { incrementAccepted, decrementPending, setPending } = useMerchantStore();

  const fetchOrders = async () => {
    try {
      const res = await api.get("/merchant/orders");
      if (res.data.orders) {
        const mapped = res.data.orders.map((o: any) => ({
          id: o.order_id || `#${Math.floor(Math.random() * 900) + 100}`,
          items: Array.isArray(o.items) ? o.items.map((i: any) => `${i.name} × ${i.quantity}`).join(", ") : (o.item || "Unknown item"),
          to: o.delivery_location || "Campus",
          from: "Store",
          time: new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: o.status === "pending" ? "new" : o.status,
          urgent: o.total_amount > 100,
          emoji: o.emoji || "📦",
          total: o.total_amount,
          runner: o.courier_name || o.courier_id || null,
          eta: o.eta || "5 min"
        }));
        setOrders(mapped);

        // Update the global store pending count live
        const pendingCount = mapped.filter((o: any) => o.status === "new").length;
        setPending(pendingCount);
      }
    } catch (err) {
      console.error("Failed to fetch orders from server, using local demo data", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const socket = socketService.connect();

    const handleNewOrder = () => {
      fetchOrders();
    };

    socket?.on("new_order", handleNewOrder);

    return () => {
      socket?.off("new_order", handleNewOrder);
    };
  }, []);

  const toggleBill = (id: string) => {
    setExpandedBills((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateStatus = async (id: string, status: Order["status"]) => {
    // Optimistic UI update
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

    try {
      const backendStatus = status === "new" ? "pending" : status;
      await api.post("/merchant/update-order-status", { order_id: id, status: backendStatus });
    } catch (err) {
      console.warn("Backend sync failed, using local state");
    }
  };

  const acceptOrder = async (order: Order) => {
    await updateStatus(order.id, "preparing");
    setExpandedBills((prev) => new Set(prev).add(order.id));
    incrementAccepted();
    toast.success("Order accepted!");

    // Broadcast to runners automatically (for real cross-tab flow)
    const bc = new BroadcastChannel("unidrop-orders");
    bc.postMessage({ type: "NEW_ORDER", order });
    bc.close();

    // Fallback auto-assignment if no real runner accepts within 4 seconds
    setTimeout(() => {
      setOrders((prev) => {
        const target = prev.find((o) => o.id === order.id);
        if (target && target.status === "preparing") {
          const runners = ["Aarav S.", "Priya K.", "Rohan M.", "Sneha R."];
          const runner = runners[Math.floor(Math.random() * runners.length)];
          toast.success(`Courier ${runner} auto-assigned!`);
          return prev.map((o) => (o.id === order.id ? { ...o, status: "assigned" as const, runner } : o));
        }
        return prev;
      });
    }, 4000);
  };

  const rejectOrder = async (id: string) => {
    await updateStatus(id, "rejected");
    decrementPending();
    toast.error("Order rejected");
  };

  const assignRunner = async (id: string) => {
    const runners = ["Aarav S.", "Priya K.", "Rohan M.", "Sneha R."];
    const runner = runners[Math.floor(Math.random() * runners.length)];
    
    // Optimistic UI update
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "assigned" as const, runner } : o)));
    toast.success(`Courier ${runner} assigned!`);

    try {
      await api.post("/merchant/assign-courier", { order_id: id });
    } catch (err) {
      console.warn("Backend failed to assign courier, but local state was updated.");
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      new: "bg-red-500/15 text-red-600", preparing: "bg-amber-500/15 text-amber-600",
      assigned: "bg-blue-500/15 text-blue-600", picked: "bg-violet-500/15 text-violet-600",
      delivered: "bg-green-500/15 text-green-600", rejected: "bg-gray-500/15 text-gray-500",
    };
    return map[s] || "";
  };

  const stages = ["new", "preparing", "assigned", "picked", "delivered"];
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const parseBillItems = (order: Order) => {
    const parts = order.items.split(", ");
    const basePrice = Math.round(order.total * 0.92);
    const perItem = Math.round(basePrice / parts.length);
    return parts.map((p) => {
      const match = p.match(/(.+?)(?:\s*×\s*(\d+))?$/);
      const name = match?.[1]?.trim() || p;
      const qty = match?.[2] ? parseInt(match[2]) : 1;
      return { name, qty, price: perItem * qty };
    });
  };

  return (
    <MerchantShell>
      <TopBar title="Incoming Orders" back={false} />

      <div className="px-4 pt-2 pb-6">
        {/* Filter Chips */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-3">
          {["all", ...stages, "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold capitalize transition-all ${filter === f ? "bg-gradient-to-r from-red-500 to-rose-600 text-white" : "bg-secondary text-muted-foreground"
                }`}
            >
              {f} {f !== "all" && <span className="opacity-60">({orders.filter((o) => o.status === f).length})</span>}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filtered.map((o, i) => {
            const isBillOpen = expandedBills.has(o.id);
            const canShowBill = o.status !== "new" && o.status !== "rejected";

            return (
              <div
                key={o.id + i}
                className={`rounded-2xl border bg-card overflow-hidden transition-all ${o.status === "new" ? "border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.08)]" : "border-border"
                  }`}
                style={{ animation: o.time === "Just now" ? "fade-up 0.4s ease-out" : undefined }}
              >
                {/* Order Card */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{o.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground">{o.id}</span>
                          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusBadge(o.status)}`}>{o.status}</span>
                          {o.urgent && <span className="rounded-full bg-gradient-to-r from-red-500 to-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white">URGENT</span>}
                        </div>
                        <p className="text-sm font-semibold mt-0.5">{o.items}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">₹{o.total}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{o.to}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />ETA {o.eta}</span>
                    <span>{o.time}</span>
                  </div>

                  {/* Delivery Progress */}
                  {canShowBill && (
                    <div className="mt-3 flex items-center gap-1">
                      {stages.map((s, si) => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full ${stages.indexOf(o.status) >= si ? "bg-gradient-to-r from-red-500 to-rose-600" : "bg-border"}`} />
                      ))}
                    </div>
                  )}

                  {/* Runner info */}
                  {o.runner && (
                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                      <Bike className="h-3 w-3 text-red-500" />
                      <span className="font-semibold">{o.runner}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {o.status === "new" && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => acceptOrder(o)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 py-2.5 text-xs font-bold text-white active:scale-95"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => rejectOrder(o.id)}
                        className="flex items-center justify-center gap-1 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-muted-foreground active:scale-95"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {o.status === "preparing" && (
                    <button
                      onClick={() => assignRunner(o.id)}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-red-500/30 bg-red-500/5 py-2.5 text-xs font-bold text-red-500 active:scale-95"
                    >
                      <Zap className="h-3.5 w-3.5" /> AI Assign Courier
                    </button>
                  )}

                  {/* View Bill Toggle */}
                  {canShowBill && (
                    <button
                      onClick={() => toggleBill(o.id)}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-secondary/70 py-2 text-[11px] font-bold text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      {isBillOpen ? "Hide Bill" : "View Bill"}
                      {isBillOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  )}
                </div>

                {/* Inline Bill — expands below the order */}
                {isBillOpen && canShowBill && (
                  <div className="border-t border-dashed border-border bg-secondary/30 animate-bill-expand">
                    {/* Bill Header */}
                    <div className="bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase tracking-wider opacity-80">Invoice</span>
                        </div>
                        <span className="text-sm font-bold">{o.id}</span>
                      </div>
                      <p className="text-[10px] opacity-70 mt-0.5">{new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                    </div>

                    <div className="p-4">
                      {/* Delivery Info */}
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3 pb-3 border-b border-dashed border-border">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground text-xs">{o.to}</p>
                          <p>From: {o.from} · {o.time}</p>
                        </div>
                      </div>

                      {/* Itemized List */}
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Items</p>
                      <div className="space-y-2 mb-3">
                        {parseBillItems(o).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded bg-secondary text-[10px] font-bold text-muted-foreground">{item.qty}×</span>
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <span className="font-semibold">₹{item.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-dashed border-border my-3" />

                      {/* Taxes */}
                      <div className="space-y-1.5 text-[12px]">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span>₹{Math.round(o.total * 0.92)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Platform Fee</span>
                          <span>₹{Math.round(o.total * 0.03)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>GST (5%)</span>
                          <span>₹{Math.round(o.total * 0.05)}</span>
                        </div>
                      </div>

                      <div className="border-t border-border my-3" />

                      {/* Grand Total */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold">Grand Total</span>
                        <span className="text-lg font-bold bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent">₹{o.total}</span>
                      </div>

                      {/* Print */}
                      <button
                        onClick={() => toast.success(`Bill ${o.id} sent to printer!`)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 py-2.5 text-xs font-bold text-white active:scale-[0.98] transition-transform"
                      >
                        <Printer className="h-3.5 w-3.5" /> Print Bill
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fade-up { 0% { opacity:0; transform:translateY(8px); } 100% { opacity:1; transform:translateY(0); } }
        @keyframes bill-expand { 0% { opacity:0; max-height:0; } 100% { opacity:1; max-height:600px; } }
        .animate-bill-expand { animation: bill-expand 0.3s ease-out; }
      `}</style>
    </MerchantShell>
  );
}

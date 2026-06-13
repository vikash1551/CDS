import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MobileShell } from "@/components/MobileShell";
import { TopBar } from "@/components/TopBar";
import { Package, Clock, ChevronRight, Star, RotateCcw, ShoppingBag, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — UniDrop" },
      { name: "description", content: "View your past orders and reorder favorites." },
    ],
  }),
  component: Orders,
});

// Fallback demo orders if backend returns empty
const fallbackOrders = [
  {
    order_id: "ORD-3487", created_at: "Today, 2:35 PM",
    items: [{ name: "Masala Maggi Cup" }, { name: "Cold Coffee" }],
    total_amount: 95, status: "delivered", courier_name: "Aarav S.", rating: 5, emoji: "🍜",
  },
  {
    order_id: "ORD-3480", created_at: "Today, 11:20 AM",
    items: [{ name: "Veg Thali" }],
    total_amount: 80, status: "delivered", courier_name: "Priya K.", rating: 4, emoji: "🍛",
  },
  {
    order_id: "ORD-3472", created_at: "Yesterday, 4:45 PM",
    items: [{ name: "Cold Coffee × 2" }, { name: "Choco Donut" }],
    total_amount: 155, status: "delivered", courier_name: "Rohan M.", rating: 5, emoji: "☕",
  },
];

const EMOJI_MAP: Record<string, string> = {
  maggi: "🍜", coffee: "☕", thali: "🍛", samosa: "🥟", notebook: "📓",
  donut: "🍩", tea: "🍵", juice: "🧃", sandwich: "🥪",
};

function getEmoji(items: any[]): string {
  const name = (items[0]?.name || "").toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (name.includes(key)) return emoji;
  }
  return "📦";
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.includes(",")) return dateStr;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" }) + `, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return dateStr;
  }
}

function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then((res) => {
        const data = res.data.orders || [];
        setOrders(data.length > 0 ? data : fallbackOrders);
      })
      .catch(() => setOrders(fallbackOrders))
      .finally(() => setLoading(false));
  }, []);

  const delivered = orders.filter((o) => o.status === "delivered");
  const totalSpent = delivered.reduce((s, o) => s + (o.total_amount || 0), 0);

  return (
    <MobileShell>
      <TopBar title="My Orders" />

      <div className="px-4 pt-2 pb-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-xl font-bold">{delivered.length}</p>
            <p className="text-[10px] font-semibold text-muted-foreground">Completed</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-xl font-bold">₹{totalSpent}</p>
            <p className="text-[10px] font-semibold text-muted-foreground">Total Spent</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-xl font-bold flex items-center justify-center gap-0.5">
              <Star className="h-4 w-4 fill-warning text-warning" /> 4.7
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground">Avg Given</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          /* Order List */
          <div className="space-y-3">
            {orders.map((o) => {
              const itemNames = (o.items || []).map((i: any) => i.name).join(", ");
              const emoji = o.emoji || getEmoji(o.items || []);
              const date = formatDate(o.created_at);
              const isDelivered = o.status === "delivered";

              return (
                <div
                  key={o.order_id}
                  className="rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl">
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-muted-foreground">{o.order_id?.slice(0, 12)}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            isDelivered
                              ? "bg-success/15 text-success"
                              : o.status === "cancelled"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-warning/15 text-warning-foreground"
                          }`}
                        >
                          {o.status?.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-semibold line-clamp-1">{itemNames || o.delivery_location}</p>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {date}
                        </span>
                        {o.courier_name && <span>by {o.courier_name}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      {o.rating && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < (o.rating || 0) ? "fill-warning text-warning" : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">₹{o.total_amount || 0}</span>
                      {isDelivered && (
                        <Link
                          to="/store"
                          className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary transition-transform active:scale-95"
                        >
                          <RotateCcw className="h-3 w-3" /> Reorder
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state hint */}
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 text-[11px] text-muted-foreground">
          <ShoppingBag className="h-3.5 w-3.5" />
          That's all your recent orders
        </div>
      </div>
    </MobileShell>
  );
}

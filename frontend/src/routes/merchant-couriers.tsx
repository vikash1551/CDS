import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MerchantShell } from "@/components/MerchantShell";
import { TopBar } from "@/components/TopBar";
import { Star, Zap, Bike, Clock, MapPin, ChevronRight, Shield, Route as RouteIcon } from "lucide-react";

export const Route = createFileRoute("/merchant-couriers")({
  component: MerchantCouriers,
});

type Courier = {
  id: string; name: string; avatar: string; dept: string; rating: number;
  drops: number; eta: string; match: number; distance: string;
  status: "available" | "delivering" | "offline"; badges: string[];
};

const couriers: Courier[] = [
  { id: "c1", name: "Aarav Sharma", avatar: "🧑‍🎓", dept: "CSE · 2nd yr", rating: 4.9, drops: 124, eta: "4 min", match: 94, distance: "120m", status: "available", badges: ["🚀", "🔥", "⭐"] },
  { id: "c2", name: "Priya Krishnan", avatar: "👩‍🎓", dept: "ECE · 3rd yr", rating: 4.8, drops: 98, eta: "6 min", match: 87, distance: "300m", status: "available", badges: ["⭐", "🌙"] },
  { id: "c3", name: "Rohan Mehta", avatar: "🧑", dept: "ME · 2nd yr", rating: 4.7, drops: 87, eta: "8 min", match: 81, distance: "450m", status: "delivering", badges: ["🔥"] },
  { id: "c4", name: "Sneha Reddy", avatar: "👩", dept: "IT · 3rd yr", rating: 4.6, drops: 72, eta: "5 min", match: 78, distance: "200m", status: "available", badges: ["⭐"] },
  { id: "c5", name: "Kabir Joshi", avatar: "🧑‍💻", dept: "Design · 2nd yr", rating: 4.5, drops: 65, eta: "10 min", match: 72, distance: "600m", status: "offline", badges: [] },
  { id: "c6", name: "Meera Patel", avatar: "👩‍🔬", dept: "Chem · 4th yr", rating: 4.8, drops: 58, eta: "7 min", match: 68, distance: "500m", status: "available", badges: ["🚀"] },
];

function MerchantCouriers() {
  const [filter, setFilter] = useState<"all" | "available" | "delivering" | "offline">("all");

  const filtered = filter === "all" ? couriers : couriers.filter((c) => c.status === filter);

  const matchGlow = (match: number) => {
    if (match >= 90) return "ring-2 ring-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.12)]";
    if (match >= 80) return "ring-1 ring-amber-500/20";
    return "";
  };

  const statusDot = (s: string) => {
    switch (s) {
      case "available": return "bg-green-500";
      case "delivering": return "bg-amber-500";
      default: return "bg-gray-400";
    }
  };

  return (
    <MerchantShell>
      <TopBar title="Courier Matching" back />

      <div className="px-4 pt-2 pb-6">
        {/* AI Header */}
        <div className="rounded-2xl p-4 mb-4 text-white" style={{ background: "linear-gradient(135deg, oklch(0.45 0.2 20), oklch(0.4 0.18 35))" }}>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Route Matching</span>
          </div>
          <p className="text-[11px] opacity-80">Our AI matches couriers based on route compatibility, ETA, rating, and delivery history.</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {(["all", "available", "delivering", "offline"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-[11px] font-bold capitalize ${filter === f ? "bg-gradient-to-r from-red-500 to-rose-600 text-white" : "bg-secondary text-muted-foreground"}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Courier Cards */}
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className={`rounded-2xl border border-border bg-card p-4 transition-all ${matchGlow(c.match)}`}>
              <div className="flex items-start gap-3">
                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-2xl">{c.avatar}</span>
                  <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ${statusDot(c.status)} ring-2 ring-card`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">{c.dept}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {c.rating}</span>
                    <span className="flex items-center gap-0.5"><Bike className="h-3 w-3" /> {c.drops} drops</span>
                    <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {c.distance}</span>
                  </div>
                  {/* Badges */}
                  {c.badges.length > 0 && (
                    <div className="mt-1.5 flex gap-1">
                      {c.badges.map((b, i) => (
                        <span key={i} className="flex h-5 w-5 items-center justify-center rounded-md bg-secondary text-[10px]">{b}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  {/* AI Match Score */}
                  <div className={`rounded-xl px-2.5 py-1.5 text-center ${c.match >= 90 ? "bg-red-500/10" : c.match >= 80 ? "bg-amber-500/10" : "bg-secondary"}`}>
                    <p className={`text-lg font-bold ${c.match >= 90 ? "text-red-500" : c.match >= 80 ? "text-amber-600" : "text-muted-foreground"}`}>{c.match}%</p>
                    <p className="text-[8px] font-bold uppercase text-muted-foreground">AI Match</p>
                  </div>
                  <p className="mt-1 text-[10px] font-semibold text-muted-foreground flex items-center gap-0.5 justify-end">
                    <Clock className="h-3 w-3" /> {c.eta}
                  </p>
                </div>
              </div>

              {/* Assign Button */}
              {c.status === "available" && (
                <button
                  onClick={() => toast.success(`${c.name} assigned to order!`)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 py-2.5 text-xs font-bold text-white transition-transform active:scale-95"
                >
                  <Zap className="h-3.5 w-3.5" /> Assign Courier
                </button>
              )}
              {c.status === "delivering" && (
                <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/10 py-2.5 text-xs font-bold text-amber-600">
                  <RouteIcon className="h-3.5 w-3.5" /> Currently on delivery
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </MerchantShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MerchantShell } from "@/components/MerchantShell";
import { TopBar } from "@/components/TopBar";
import { Star, Package, IndianRupee, Clock, MapPin, Edit3, Camera, Award, Bike, TrendingUp, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/merchant-profile")({
  component: MerchantProfile,
});

import { useMerchantStore } from "@/store/merchantStore";

function MerchantProfile() {
  const { isOpen, setIsOpen } = useMerchantStore();
  const [editing, setEditing] = useState(false);
  const [storeName, setStoreName] = useState("Hostel Canteen");
  const [storeDesc, setStoreDesc] = useState("Quick bites, beverages & stationery for campus life. Open 8 AM – 10 PM.");
  const [storeImage, setStoreImage] = useState<string | null>(null);

  const topProducts = [
    { name: "Masala Maggi Cup", sold: 1240, emoji: "🍜" },
    { name: "Cold Coffee", sold: 980, emoji: "🧋" },
    { name: "Samosa (2 pcs)", sold: 870, emoji: "🥟" },
    { name: "Veg Sandwich", sold: 650, emoji: "🥪" },
  ];

  return (
    <MerchantShell>
      <TopBar title="Store Profile" back={false} right={
        <button
          onClick={() => { if (editing) toast.success("Profile saved!"); setEditing(!editing); }}
          className="flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-rose-600 px-3 py-1.5 text-[11px] font-bold text-white active:scale-95"
        >
          <Edit3 className="h-3 w-3" /> {editing ? "Save" : "Edit"}
        </button>
      } />

      <div className="px-4 pt-2 pb-6">
        {/* Store Header */}
        <div className="relative rounded-2xl overflow-hidden mb-5" style={{ background: "linear-gradient(135deg, oklch(0.45 0.2 20), oklch(0.35 0.18 30))" }}>
          <div className="p-5 text-white">
            <div className="flex items-start gap-4">
              <div className="relative">
                {storeImage ? (
                  <img src={storeImage} alt="Store" className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white/10" />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-4xl ring-4 ring-white/10">🏪</span>
                )}
                {editing && (
                  <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white text-red-500 shadow active:scale-95 transition-transform">
                    <Camera className="h-3.5 w-3.5" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setStoreImage(URL.createObjectURL(file));
                          toast.success("Store photo updated!");
                        }
                      }} 
                    />
                  </label>
                )}
              </div>
              <div className="flex-1">
                {editing ? (
                  <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="bg-white/15 rounded-lg px-2 py-1 text-lg font-bold w-full outline-none backdrop-blur" />
                ) : (
                  <h2 className="text-xl font-bold">{storeName}</h2>
                )}
                <p className="text-[11px] opacity-70 mt-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" /> NMIT Campus, Block A</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-sm font-semibold"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.8</span>
                  <span className="text-xs opacity-70">·</span>
                  <span className="text-xs opacity-80">324 ratings</span>
                </div>
              </div>
            </div>

            {/* Online Toggle */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 p-3 backdrop-blur">
              <div>
                <p className="text-sm font-bold">{isOpen ? "Store is Open" : "Store is Closed"}</p>
                <p className="text-[10px] opacity-70">{isOpen ? "Accepting orders" : "Not accepting orders"}</p>
              </div>
              <button
                onClick={() => { setIsOpen(!isOpen); toast(isOpen ? "Store closed" : "Store is now open!"); }}
                className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors ${isOpen ? "bg-green-500" : "bg-white/20"}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${isOpen ? "translate-x-[28px]" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-2xl border border-border bg-card p-4 mb-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">About</h3>
          {editing ? (
            <textarea value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)} rows={3} className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-rose-500 resize-none" />
          ) : (
            <p className="text-sm text-foreground">{storeDesc}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Package className="h-4 w-4 text-red-500" />
              <span className="text-[10px] font-bold uppercase">Total Orders</span>
            </div>
            <p className="text-2xl font-bold">3,847</p>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-600"><TrendingUp className="h-3 w-3" /> +18% this month</span>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <IndianRupee className="h-4 w-4 text-red-500" />
              <span className="text-[10px] font-bold uppercase">Lifetime Revenue</span>
            </div>
            <p className="text-2xl font-bold">₹1.2L</p>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-600"><TrendingUp className="h-3 w-3" /> +22% this month</span>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Bike className="h-4 w-4 text-red-500" />
              <span className="text-[10px] font-bold uppercase">Active Couriers</span>
            </div>
            <p className="text-2xl font-bold">12</p>
            <span className="text-[10px] text-muted-foreground">3 delivering now</span>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="h-4 w-4 text-red-500" />
              <span className="text-[10px] font-bold uppercase">Avg Delivery</span>
            </div>
            <p className="text-2xl font-bold">8 min</p>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-600"><TrendingUp className="h-3 w-3" /> 2 min faster</span>
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl border border-border bg-card p-4 mb-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Top Products (All Time)</h3>
          <div className="space-y-2.5">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-5 text-center text-sm font-bold text-muted-foreground">#{i + 1}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-lg">{p.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.sold.toLocaleString()} sold</p>
                </div>
                <Award className="h-4 w-4 text-amber-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Store Achievements</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { emoji: "🥇", name: "Top Seller", desc: "Most orders this week" },
              { emoji: "⚡", name: "Speed King", desc: "Fastest avg ETA" },
              { emoji: "💯", name: "Perfect Score", desc: "4.8+ rating" },
            ].map((a) => (
              <div key={a.name} className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center">
                <span className="text-2xl">{a.emoji}</span>
                <p className="mt-1 text-[10px] font-bold">{a.name}</p>
                <p className="text-[8px] text-muted-foreground">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MerchantShell>
  );
}

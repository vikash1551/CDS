import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store";
import { TopBar } from "@/components/TopBar";
import { MobileShell } from "@/components/MobileShell";
import { products } from "@/lib/data";
import { Star, Clock, Shield, Heart } from "lucide-react";

export const Route = createFileRoute("/product/$id")({
  component: Product,
});

function Product() {
  const { id } = useParams({ from: "/product/$id" });
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const [qty, setQty] = useState(1);
  const p = products.find((x) => x.id === id) ?? products[0];

  return (
    <MobileShell>
      <TopBar title={p.shop} right={<button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"><Heart className="h-4 w-4" /></button>} />
      <div className="md:grid md:grid-cols-2 md:gap-8">
      <div className="flex aspect-square items-center justify-center text-[140px] md:rounded-3xl md:aspect-square" style={{ background: p.bg }}>
        {p.emoji}
      </div>
      <div className="px-4 py-4 md:px-0 md:py-2">
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span className="rounded-full bg-brand px-2 py-0.5 text-brand-foreground">⚡ {p.eta}</span>
          <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-success">
            <Star className="h-3 w-3 fill-current" /> 4.6 · 1.2k
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold leading-tight">{p.name}</h1>
        <p className="text-xs text-muted-foreground">{p.unit} · {p.shop}</p>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold">₹{p.price}</span>
          {p.mrp && <span className="text-sm text-muted-foreground line-through">₹{p.mrp}</span>}
          {p.mrp && (
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success">
              Save ₹{p.mrp - p.price}
            </span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { icon: Clock, label: "9 min", sub: "delivery" },
            { icon: Shield, label: "Verified", sub: "shop" },
            { icon: Star, label: "4.6", sub: "rating" },
          ].map((b, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-3 text-center">
              <b.icon className="mx-auto h-4 w-4 text-primary" />
              <p className="mt-1 text-xs font-bold">{b.label}</p>
              <p className="text-[10px] text-muted-foreground">{b.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-bold">Pickup partner</p>
          <p className="mt-1 text-xs text-muted-foreground">A nearby student going your way picks this up — they earn, you get it fast.</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg">🧑‍🎓</div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Aarav · 4.9★</p>
              <p className="text-[11px] text-muted-foreground">Heading to Block A · 6 min</p>
            </div>
            <span className="rounded-full bg-success/15 px-2 py-1 text-[10px] font-bold text-success">Online</span>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-bold">More from {p.shop}</p>
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto -mx-4 px-4">
            {products.filter((x) => x.id !== p.id).slice(0, 5).map((x) => (
              <Link to="/product/$id" params={{ id: x.id }} key={x.id} className="w-[120px] shrink-0 overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex aspect-square items-center justify-center text-3xl" style={{ background: x.bg }}>{x.emoji}</div>
                <div className="p-2">
                  <p className="line-clamp-1 text-[11px] font-semibold">{x.name}</p>
                  <p className="text-[11px] font-bold">₹{x.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[480px] border-t border-border bg-card px-4 py-3 md:sticky md:bottom-6 md:mt-6 md:max-w-none md:rounded-2xl md:border md:px-5 md:py-4 md:shadow-pop"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-border px-3 py-2">
            <button type="button" onClick={() => setQty((prev) => Math.max(1, prev - 1))} className="text-lg font-bold">−</button>
            <span className="w-6 text-center text-sm font-bold">{qty}</span>
            <button type="button" onClick={() => setQty((prev) => prev + 1)} className="text-lg font-bold">+</button>
          </div>
          <button 
            type="button"
            onClick={() => {
              addToCart({ ...p, qty });
              toast.success(`Added ${qty} × ${p.name} to cart`);
              navigate({ to: "/cart" });
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-pop"
          >
            Add to cart · ₹{p.price * qty}
          </button>
        </div>
      </div>
    </MobileShell>
  );
}

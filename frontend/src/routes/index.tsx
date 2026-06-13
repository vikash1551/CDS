import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useCartStore, useRunnerStore } from "@/lib/store";
import { MapPin, ChevronDown, Search, Bell, Zap, BookOpen, Coffee, Star, ArrowRight, Plus, X, Navigation } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { GoLiveSlider } from "@/components/GoLiveSlider";
import { categories, products, lendItems } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UniDrop — Order & Lend in minutes" },
      { name: "description", content: "Order from campus shops and lend gear to fellow students. Real-time pickup and tracking." },
      { property: "og:title", content: "UniDrop" },
      { property: "og:description", content: "Order from campus shops and lend gear to fellow students." },
    ],
  }),
  component: Index,
});

function Index() {
  const { addToCart } = useCartStore();
  const { isOnline, setOnline, setIncomingOrder, isReceivingOrder, activeOrderId, activeLendRequestId } = useRunnerStore();
  const [location, setLocation] = useState("Block A · Room 214");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [customAddress, setCustomAddress] = useState("");
  const nav = useNavigate();

  const handleGetLocation = () => {
    toast.info("Fetching GPS location...");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setTimeout(() => {
            setLocation("Campus Main Gate");
            toast.success("Location updated via GPS");
          }, 800);
        },
        () => {
          toast.error("GPS permission denied. Using default.");
        }
      );
    } else {
      toast.error("GPS not supported on this device");
    }
  };

  const handleGoLive = (status: boolean) => {
    if (status && (isReceivingOrder || activeOrderId || activeLendRequestId)) {
      toast.error("You cannot go online while you have an active order!");
      return;
    }
    
    setOnline(status);
    if (status) {
      toast.success("You are now online! 🟢");
    } else {
      setIncomingOrder(null);
    }
  };

  return (
    <MobileShell>
      {/* Hero / location */}
      <div className="bg-gradient-hero px-4 pb-6 pt-4 md:rounded-3xl md:px-8 md:pb-10 md:pt-8">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowLocationPopup(true)} className="flex items-center gap-1 text-left transition-transform active:scale-95">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10">
              <MapPin className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <div className="leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60">Delivering to</p>
              <p className="flex items-center gap-1 text-sm font-bold">
                {location} <ChevronDown className="h-3.5 w-3.5" />
              </p>
            </div>
          </button>

          {/* Capsule Go Live Button */}
          <button
            onClick={() => handleGoLive(!isOnline)}
            className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${isOnline
                ? "bg-success/15 text-success ring-1 ring-success/30"
                : "bg-foreground/10 text-foreground"
              }`}
          >
            {isOnline && <span className="absolute -left-1 -top-1 h-2.5 w-2.5 animate-ping rounded-full bg-success opacity-75" />}
            {isOnline && <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-success" />}
            {isOnline ? "ON DUTY" : "GO LIVE"}
          </button>
        </div>

        <div className="mt-5">
          <h1 className="text-[28px] font-bold leading-tight md:text-5xl">
            Campus rush?<br />
            <span className="text-primary">We're on the way.</span>
          </h1>
          <p className="mt-1 text-sm text-foreground/70 md:text-base">Order from canteens · Lend & borrow gear · Live tracking</p>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-card px-3 py-2.5 shadow-card md:max-w-xl md:px-4 md:py-3.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search maggi, calculator, donut…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                nav({ to: "/store" });
                toast.info(`Searching for "${searchQuery}"...`);
              }
            }}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={() => {
              if (searchQuery.trim()) {
                nav({ to: "/store" });
                toast.info(`Searching for "${searchQuery}"...`);
              }
            }}
            className="flex items-center justify-center rounded-lg bg-brand p-1.5 text-brand-foreground transition-transform active:scale-95"
            aria-label="Search"
          >
            <Search className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Live Stats Area */}
      {isOnline && (
        <section className="px-4 mt-3 md:mt-6 md:px-0">
          <div className="overflow-hidden rounded-2xl border border-success/30 bg-gradient-to-r from-success/5 to-success/10 p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-success">
                  You're Live
                </span>
              </div>
            </div>

            <div className="flex items-center justify-around border-t border-success/10 pt-3">
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">₹0</p>
                <p className="text-[10px] font-semibold text-success">Earned today</p>
              </div>
              <div className="h-8 w-px bg-success/20" />
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">0</p>
                <p className="text-[10px] font-semibold text-success">Deliveries</p>
              </div>
              <div className="h-8 w-px bg-success/20" />
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">0m</p>
                <p className="text-[10px] font-semibold text-success">Online</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mode cards */}
      <section className="px-4 mt-3 md:mt-6 md:px-0">
        <div className="grid grid-cols-2 gap-3 md:gap-5">
          <Link
            to="/store"
            className="relative overflow-hidden rounded-3xl bg-gradient-primary p-4 text-primary-foreground shadow-pop"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-brand-foreground">
              <Zap className="h-3 w-3" /> Live
            </span>
            <h3 className="mt-3 text-lg font-bold leading-tight">Campus<br />Store</h3>
            <p className="mt-1 text-[11px] text-primary-foreground/70">Snacks, meals, supplies</p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold">
              Order now <ArrowRight className="h-3 w-3" />
            </div>
            <div className="absolute -right-2 -bottom-1 text-6xl">🛍️</div>
          </Link>
          <Link
            to="/lend"
            className="relative overflow-hidden rounded-3xl bg-brand p-4 text-brand-foreground shadow-pop"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-foreground/10 px-2 py-0.5 text-[10px] font-bold">
              Peer · Peer
            </span>
            <h3 className="mt-3 text-lg font-bold leading-tight">Lend &<br />Borrow</h3>
            <p className="mt-1 text-[11px] text-brand-foreground/70">Calculators, lab gear, books</p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold">
              Browse <ArrowRight className="h-3 w-3" />
            </div>
            <div className="absolute -right-2 -bottom-1 text-6xl">🤝</div>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-6 px-4 md:mt-10 md:px-0">
        <div className="flex items-end justify-between">
          <h2 className="text-base font-bold md:text-2xl">Shop by category</h2>
          <Link to="/store" className="text-xs font-semibold text-primary md:text-sm">See all</Link>
        </div>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto -mx-4 px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:px-0 md:mx-0 md:grid md:grid-cols-8 md:gap-3 md:overflow-visible md:px-0">
          {categories.map((c) => (
            <Link
              to="/store"
              search={{ cat: c.id }}
              key={c.id}
              className="flex w-[78px] shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-2 shadow-card md:w-auto md:p-3"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl md:h-14 md:w-14 md:text-3xl"
                style={{ background: c.bg }}
              >
                {c.emoji}
              </span>
              <span className="text-[11px] font-semibold md:text-xs">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending products */}
      <section className="mt-6 px-4 md:mt-10 md:px-0">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-base font-bold md:text-2xl">Hot on campus 🔥</h2>
            <p className="text-[11px] text-muted-foreground md:text-sm">Picked up by 240+ students today</p>
          </div>
          <Link to="/store" className="text-xs font-semibold text-primary md:text-sm">See all</Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-5">
          {products.slice(0, 4).map((p) => (
            <Link
              to="/product/$id"
              params={{ id: p.id }}
              key={p.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
            >
              <div
                className="relative flex aspect-square items-center justify-center text-5xl"
                style={{ background: p.bg }}
              >
                <span>{p.emoji}</span>
                <span className="absolute left-2 top-2 rounded-full bg-card/90 px-1.5 py-0.5 text-[10px] font-bold">
                  ⚡ {p.eta}
                </span>
              </div>
              <div className="p-2.5">
                <p className="line-clamp-1 text-[13px] font-semibold">{p.name}</p>
                <p className="line-clamp-1 text-[10px] text-muted-foreground">{p.shop} · {p.unit}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold">₹{p.price}</span>
                    {p.mrp && <span className="text-[10px] text-muted-foreground line-through">₹{p.mrp}</span>}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(p);
                      toast.success(`Added ${p.name} to cart`);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-soft transition-transform active:scale-95"
                  >
                    <Plus className="h-4 w-4" strokeWidth={3} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Lending feed preview */}
      <section className="mt-6 px-4 md:mt-10 md:px-0">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-base font-bold md:text-2xl">Live near you</h2>
            <p className="text-[11px] text-muted-foreground md:text-sm">Students online · ready to lend</p>
          </div>
          <Link to="/lend" className="text-xs font-semibold text-primary md:text-sm">Open feed</Link>
        </div>
        <div className="mt-3 grid gap-2.5 md:grid-cols-2 md:gap-4">
          {lendItems.slice(0, 3).map((l) => (
            <Link
              to="/lend/$id"
              params={{ id: l.id }}
              key={l.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                style={{ background: l.bg }}
              >
                {l.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${l.tag === "Lend"
                        ? "bg-success/15 text-success"
                        : "bg-warning/20 text-warning-foreground"
                      }`}
                  >
                    {l.tag === "Lend" ? "LENDING" : "NEEDS"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{l.posted}</span>
                </div>
                <p className="line-clamp-1 text-sm font-semibold">{l.title}</p>
                <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{l.by}</span>
                  <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" />{l.rating}</span>
                  <span>· {l.distance}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">₹{l.pricePerHr}<span className="text-[10px] font-normal text-muted-foreground">/hr</span></p>
                {l.status === "online" && (
                  <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" /> online
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer chip */}
      <section className="mt-6 px-4 pb-2 md:mt-10 md:px-0">
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-[11px] text-muted-foreground md:py-5 md:text-sm">
          <Coffee className="h-3.5 w-3.5" />
          Built for campus life · 24/7
          <BookOpen className="h-3.5 w-3.5" />
        </div>
      </section>

      {/* Location Change Popup */}
      {showLocationPopup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" onClick={() => setShowLocationPopup(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-[480px] rounded-t-3xl bg-card px-5 pb-8 pt-5 shadow-pop md:rounded-3xl animate-in slide-in-from-bottom-4 fade-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold">Deliver to</h3>
              <button onClick={() => setShowLocationPopup(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-secondary/80">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mx-auto h-1 w-10 rounded-full bg-border mb-4 md:hidden" />

            {/* GPS option */}
            <button
              onClick={() => {
                toast.info("Fetching GPS location...");
                if ("geolocation" in navigator) {
                  navigator.geolocation.getCurrentPosition(
                    () => {
                      setTimeout(() => {
                        setLocation("Campus Main Gate");
                        setShowLocationPopup(false);
                        toast.success("Location updated via GPS");
                      }, 800);
                    },
                    () => toast.error("GPS permission denied.")
                  );
                }
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-3 mb-3 text-left transition-all active:scale-[0.98]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Navigation className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-primary">Use GPS location</span>
                <p className="text-[10px] text-muted-foreground">Auto-detect your current location</p>
              </div>
            </button>

            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Saved Locations</p>
            <div className="space-y-2 mb-4">
              {["Block A · Room 214", "Room 402, Hostel B", "Library Gate", "Campus Main Gate", "Cafeteria Entrance"].map((addr) => (
                <button
                  key={addr}
                  onClick={() => {
                    setLocation(addr);
                    setShowLocationPopup(false);
                    toast.success("Location updated!");
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all active:scale-[0.98] ${location === addr
                      ? "border-primary bg-primary/5 shadow-soft"
                      : "border-border bg-background hover:bg-secondary/50"
                    }`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${location === addr ? "bg-primary text-primary-foreground" : "bg-secondary"
                    }`}>
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold flex-1">{addr}</span>
                  {location === addr && (
                    <span className="text-[10px] font-bold text-primary uppercase">Current</span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Type a custom location..."
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customAddress.trim()) {
                    setLocation(customAddress.trim());
                    setCustomAddress("");
                    setShowLocationPopup(false);
                    toast.success("Location updated!");
                  }
                }}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-sm outline-none focus:border-primary/50"
              />
              <button
                onClick={() => {
                  if (customAddress.trim()) {
                    setLocation(customAddress.trim());
                    setCustomAddress("");
                    setShowLocationPopup(false);
                    toast.success("Location updated!");
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform active:scale-90"
              >
                <Navigation className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}

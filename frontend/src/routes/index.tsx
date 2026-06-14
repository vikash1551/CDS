import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCartStore, useRunnerStore } from "@/lib/store";
import { useEcosystemStore } from "@/store/ecosystemStore";
import { MapPin, ChevronDown, Search, Bell, Star, ArrowRight, Plus, X, Navigation, Wifi, User, ShieldCheck } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { CustomLogo } from "@/components/Logo";
import { NotificationCenter } from "@/components/NotificationCenter";
import { categories, products, lendItems } from "@/lib/data";
import campusWelcome from "@/campus_welcome.png";

export const Route = createFileRoute("/")(({
  head: () => ({
    meta: [
      { title: "Campus Flow — Your campus, delivered." },
      { name: "description", content: "Order from campus shops, lend & borrow gear, and connect with fellow students." },
      { property: "og:title", content: "Campus Flow" },
      { property: "og:description", content: "Order from campus shops and lend gear to fellow students." },
    ],
  }),
  component: Index,
}));

/* ── Borrow items data ── */
const borrowItems = [
  { id: "b1", name: "Scientific Calculator", emoji: "🧮", distance: "120 m away", rating: 4.8, reviews: 32, bg: "#F3E8FF" },
  { id: "b2", name: "Phone Charger", emoji: "🔌", distance: "85 m away", rating: 4.6, reviews: 18, bg: "#E0EEFF" },
  { id: "b3", name: "Lab Coat", emoji: "🥼", distance: "200 m away", rating: 4.9, reviews: 24, bg: "#FFF0E0" },
];

/* ── Active deliveries data ── */
const activeDeliveries = [
  { id: "d1", label: "Order from Canteen", location: "Block A · Room 214", status: "On the way", emoji: "🍛" },
  { id: "d2", label: "Calculator (Borrow)", location: "Library Gate", status: "Picking up", emoji: "🧮" },
];

/* ── Hot on Campus products ── */
const hotProducts = [
  { id: "h1", name: "Maggi Masala", shop: "Canteen 2", eta: "8 min", price: 20, emoji: "🍜", bg: "#FFF0E0" },
  { id: "h2", name: "Scientific Calculator", shop: "Aman Sharma", eta: "12 min", price: 0, emoji: "🧮", bg: "#F3E8FF" },
  { id: "h3", name: "Class Notes (DBMS)", shop: "Riya Patel", eta: "15 min", price: 10, emoji: "📘", bg: "#E0EEFF" },
];

function Index() {
  const { addToCart } = useCartStore();
  const { isOnline, setOnline, setIncomingOrder, isReceivingOrder, activeOrderId, activeLendRequestId } = useRunnerStore();
  const { isStoreOpen, products: liveProducts, fetchInitialState } = useEcosystemStore();
  const [location, setLocation] = useState("Boys Hostel Block C");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [customAddress, setCustomAddress] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    fetchInitialState();
  }, [fetchInitialState]);

  const handleGoLive = (status: boolean) => {
    // Validation removed for prototype to prevent getting stuck in dirty state
    setOnline(status);
    if (status) {
      toast.success("You are now online! 🟢");
    } else {
      setIncomingOrder(null);
    }
  };

  return (
    <MobileShell>
      {/* ═══════════ TOP GLOBAL NAV BAR ═══════════ */}
      <div className="sticky top-0 z-30 border-b border-border" style={{ background: '#FAF7F3' }}>
        <div className="flex items-center justify-between px-4 py-3 md:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: '#C76B39' }}>
              <CustomLogo className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold tracking-tight" style={{ color: '#A84B22' }}>CAMPUS FLOW</span>
          </Link>

          {/* Center search (desktop) */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-lg mx-8 rounded-full border border-border bg-white px-4 py-2.5 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search maggi, calculator, donut..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && searchQuery.trim()) { nav({ to: "/store" }); } }}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowNotifications(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white border border-border shadow-sm transition-transform active:scale-95"
            >
              <Bell className="h-[18px] w-[18px] text-foreground" strokeWidth={2} />
              <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button onClick={() => nav({ to: "/profile" })} className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm overflow-hidden transition-transform active:scale-95" style={{ background: '#C76B39' }}>
              <User className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════ MAIN CONTENT GRID ═══════════ */}
      <div className="md:grid md:grid-cols-[1fr_340px] md:gap-6 lg:grid-cols-[1fr_380px] lg:gap-8 md:px-6 lg:px-8 md:py-6">

        {/* ── LEFT COLUMN ── */}
        <div className="flex-1 min-w-0">

          {/* ─── Hero Banner ─── */}
          <div className="relative overflow-hidden md:rounded-3xl" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FDEBD0 50%, #F5C89A 100%)' }}>
            {/* Campus illustration overlay */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={campusWelcome}
                alt=""
                className="absolute right-0 top-0 h-full w-[65%] object-cover object-left opacity-70 md:opacity-80"
                style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 30%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%)' }}
              />
            </div>

            <div className="relative z-10 px-4 py-5 md:px-6 md:py-7 lg:px-8 lg:py-8">
              {/* Top row: location + go live */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setShowLocationPopup(true)} className="flex items-center gap-2 text-left transition-transform active:scale-95">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: '#A84B22' }}>
                    <MapPin className="h-3.5 w-3.5 text-white" strokeWidth={2.4} />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#A84B22' }}>Delivering to</p>
                    <p className="flex items-center gap-1 text-sm font-bold text-foreground">
                      {location} <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleGoLive(!isOnline)}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all active:scale-95 shadow-sm"
                  style={{
                    background: isOnline ? 'rgba(22, 163, 74, 0.1)' : '#FFFFFF',
                    color: isOnline ? '#16A34A' : '#A84B22',
                    border: isOnline ? '1px solid rgba(22, 163, 74, 0.3)' : '1px solid #E7E5E4',
                  }}
                >
                  <Wifi className="h-3.5 w-3.5" />
                  {isOnline ? "ON DUTY" : "GO LIVE"}
                </button>
              </div>

              {/* Headline */}
              <h1 className="text-[26px] font-bold leading-[1.15] md:text-[32px] lg:text-4xl">
                <span style={{ color: '#1F2937' }}>Campus rush?</span><br />
                <span style={{ color: '#A84B22' }}>We're on the way.</span>
              </h1>
              <p className="mt-1.5 text-[13px] text-foreground/70 md:text-sm">
                Order from canteens · Lend & borrow gear · Live tracking
              </p>

              {/* Search bar */}
              <div className="mt-4 flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm border border-border md:max-w-md">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search maggi, calculator, donut..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && searchQuery.trim()) { nav({ to: "/store" }); toast.info(`Searching for "${searchQuery}"...`); } }}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground md:hidden"
                />
                <input
                  placeholder="Search maggi, calculator, donut..."
                  className="hidden md:block w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  readOnly
                  onFocus={() => { /* Desktop uses the top nav search */ }}
                />
                <button
                  onClick={() => { if (searchQuery.trim()) { nav({ to: "/store" }); } }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-transform active:scale-95"
                  style={{ background: '#A84B22' }}
                >
                  <Search className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>

          {/* ─── Categories ─── */}
          <section className="mt-6 px-4 md:px-0">
            <div className="flex items-end justify-between">
              <h2 className="text-base font-bold md:text-lg">Categories</h2>
              <Link to="/store" className="text-xs font-semibold" style={{ color: '#A84B22' }}>See all</Link>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6 md:grid-cols-6">
              {categories.map((c) => (
                <Link
                  to="/store"
                  search={{ cat: c.id }}
                  key={c.id}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-border p-3 shadow-sm transition-all hover:shadow-md active:scale-95"
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{ background: c.bg }}
                  >
                    {c.emoji}
                  </span>
                  <span className="text-[11px] font-semibold text-foreground">{c.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* ─── Hot on Campus ─── */}
          <section className="mt-6 px-4 md:px-0 pb-4">
            <div className="flex items-end justify-between">
              <h2 className="text-base font-bold md:text-lg">Hot on Campus</h2>
              <Link to="/store" className="text-xs font-semibold" style={{ color: '#A84B22' }}>See all</Link>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {hotProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl bg-white border border-border p-3 shadow-sm"
                >
                  <span
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-3xl"
                    style={{ background: p.bg }}
                  >
                    {p.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground line-clamp-1">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.shop}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold" style={{ color: '#16A34A' }}>
                      ⚡ {p.eta}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-base font-bold text-foreground">₹{p.price}</span>
                      <button
                        onClick={() => {
                          const prod = products.find(pr => pr.name.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]));
                          if (prod) { addToCart(prod); toast.success(`Added ${p.name} to cart`); }
                          else { toast.success(`Added ${p.name}`); }
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-transform active:scale-95"
                        style={{ background: '#16A34A' }}
                      >
                        <Plus className="h-4 w-4" strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── RIGHT SIDEBAR (Desktop) ── */}
        <aside className="hidden md:flex md:flex-col md:gap-5 md:pt-0">

          {/* Borrow Nearby */}
          <div className="rounded-2xl bg-white border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground">Borrow Nearby</h3>
              <Link to="/lend" className="text-xs font-semibold" style={{ color: '#A84B22' }}>View all</Link>
            </div>
            <div className="space-y-4">
              {borrowItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl"
                    style={{ background: item.bg }}
                  >
                    {item.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{item.name}</p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3" style={{ color: '#A84B22' }} /> {item.distance}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {item.rating} ({item.reviews})
                    </p>
                  </div>
                  <button
                    className="rounded-full border px-4 py-1.5 text-xs font-bold transition-all active:scale-95"
                    style={{ borderColor: '#A84B22', color: '#A84B22' }}
                    onClick={() => toast.success(`Borrowing ${item.name}...`)}
                  >
                    Borrow
                  </button>
                </div>
              ))}
            </div>
          </div>



          {/* Trust Banner */}
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#FFF0E0' }}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: '#A84B22' }}>
              <ShieldCheck className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">Safe. Verified. Student-powered.</p>
              <p className="text-[11px] text-muted-foreground">Your campus, your community.</p>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Mobile-only sections (Borrow + Deliveries) ── */}
      <div className="md:hidden px-4 space-y-4 mt-2 pb-4">
        {/* Borrow Nearby */}
        <div className="rounded-2xl bg-white border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">Borrow Nearby</h3>
            <Link to="/lend" className="text-xs font-semibold" style={{ color: '#A84B22' }}>View all</Link>
          </div>
          <div className="space-y-3">
            {borrowItems.slice(0, 2).map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: item.bg }}>
                  {item.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground">{item.distance} · ⭐ {item.rating}</p>
                </div>
                <button className="rounded-full border px-3 py-1 text-[11px] font-bold" style={{ borderColor: '#A84B22', color: '#A84B22' }}>
                  Borrow
                </button>
              </div>
            ))}
          </div>
        </div>



        {/* Trust Banner Mobile */}
        <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: '#FFF0E0' }}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: '#A84B22' }}>
            <ShieldCheck className="h-4 w-4 text-white" />
          </span>
          <div>
            <p className="text-[13px] font-bold text-foreground">Safe. Verified. Student-powered.</p>
            <p className="text-[10px] text-muted-foreground">Your campus, your community.</p>
          </div>
        </div>
      </div>

      {/* ─── Location Popup ─── */}
      {showLocationPopup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" onClick={() => setShowLocationPopup(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-[480px] rounded-t-3xl bg-white px-5 pb-8 pt-5 shadow-pop md:max-w-lg md:rounded-3xl animate-in slide-in-from-bottom-4 fade-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold">Deliver to</h3>
              <button onClick={() => setShowLocationPopup(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mx-auto h-1 w-10 rounded-full bg-border mb-4 md:hidden" />

            <button
              onClick={() => {
                toast.info("Fetching GPS location...");
                if ("geolocation" in navigator) {
                  navigator.geolocation.getCurrentPosition(
                    () => { setTimeout(() => { setLocation("Campus Main Gate"); setShowLocationPopup(false); toast.success("Location updated via GPS"); }, 800); },
                    () => toast.error("GPS permission denied.")
                  );
                }
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-dashed p-3 mb-3 text-left transition-all active:scale-[0.98]"
              style={{ borderColor: 'rgba(168, 75, 34, 0.3)', background: 'rgba(168, 75, 34, 0.03)' }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ background: '#A84B22' }}>
                <Navigation className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-bold" style={{ color: '#A84B22' }}>Use GPS location</span>
                <p className="text-[10px] text-muted-foreground">Auto-detect your current location</p>
              </div>
            </button>

            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Saved Locations</p>
            <div className="space-y-2 mb-4">
              {["Block A · Room 214", "Room 402, Hostel B", "Library Gate", "Campus Main Gate", "Cafeteria Entrance"].map((addr) => (
                <button
                  key={addr}
                  onClick={() => { setLocation(addr); setShowLocationPopup(false); toast.success("Location updated!"); }}
                  className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all active:scale-[0.98]"
                  style={{ borderColor: location === addr ? '#A84B22' : '#E7E5E4', background: location === addr ? 'rgba(168, 75, 34, 0.03)' : '#FFFFFF' }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: location === addr ? '#A84B22' : '#F5F0EB', color: location === addr ? '#FFFFFF' : '#6B7280' }}>
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold flex-1">{addr}</span>
                  {location === addr && <span className="text-[10px] font-bold uppercase" style={{ color: '#A84B22' }}>Current</span>}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Type a custom location..."
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && customAddress.trim()) { setLocation(customAddress.trim()); setCustomAddress(""); setShowLocationPopup(false); toast.success("Location updated!"); } }}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 pr-12 text-sm outline-none"
              />
              <button
                onClick={() => { if (customAddress.trim()) { setLocation(customAddress.trim()); setCustomAddress(""); setShowLocationPopup(false); toast.success("Location updated!"); } }}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl text-white"
                style={{ background: '#A84B22' }}
              >
                <Navigation className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Notification Center ─── */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </MobileShell>
  );
}

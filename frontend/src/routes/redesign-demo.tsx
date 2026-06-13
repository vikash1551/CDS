import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  Home, ShoppingBag, Repeat2, MapPin, User, Zap, Star, ShieldCheck, Award, Bike, Clock, Sparkles, Package, CheckCircle2, Navigation, Radio, TrendingUp, Wallet, ChevronRight, Search, Plus, X, Eye, Laptop, Sun, Moon, Info, MessageSquare, ArrowRight, ThumbsUp, DollarSign, ListFilter, Activity
} from "lucide-react";
import { categories as staticCategories, products as staticProducts, lendItems as staticLendItems } from "@/lib/data";

export const Route = createFileRoute("/redesign-demo")({
  head: () => ({
    meta: [
      { title: "UniDrop UI/UX Redesign Demo" },
      { name: "description", content: "Interactive playground to test the redesigned premium UI system for UniDrop." },
    ],
  }),
  component: RedesignDemo,
});

function RedesignDemo() {
  const [activeTab, setActiveTab] = useState<"home" | "marketplace" | "courier" | "track" | "merchant" | "styleguide">("home");
  const [isDark, setIsDark] = useState(false);
  const [location, setLocation] = useState("Block A · Room 214");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Courier stats state
  const [courierOnline, setCourierOnline] = useState(false);
  const [earnings, setEarnings] = useState(140);
  const [xp, setXp] = useState(850);
  const [streak, setStreak] = useState(5);
  
  // Tracking simulation state
  const [trackingStage, setTrackingStage] = useState(2); // On The Way
  const [trackingEta, setTrackingEta] = useState(5);
  const [trackingActive, setTrackingActive] = useState(true);
  const [otpInput, setOtpInput] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const deliveryOtp = "3819";

  // Marketplace sub-tab
  const [marketTab, setMarketTab] = useState<"buy" | "borrow">("buy");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Merchant active orders simulation
  const [merchantOrders, setMerchantOrders] = useState([
    { id: "ORD-9402", item: "Masala Maggi Cup × 2, Cold Coffee", to: "Block A · Room 214", time: "10 min ago", status: "new" },
    { id: "ORD-9398", item: "Notebook A4, Pen Kit (5 pcs)", to: "Library Gate", time: "25 min ago", status: "preparing" },
    { id: "ORD-9391", item: "Choco Donut × 4", to: "Hostel B · Room 402", time: "45 min ago", status: "preparing" },
  ]);
  const [merchantRevenue, setMerchantRevenue] = useState(1280);

  // Auto-progress tracking simulation for premium feel
  useEffect(() => {
    if (!trackingActive || trackingStage >= 4) return;
    const interval = setInterval(() => {
      setTrackingStage(prev => {
        if (prev >= 4) {
          clearInterval(interval);
          return 4;
        }
        return prev + 1;
      });
      setTrackingEta(prev => Math.max(1, prev - 1));
    }, 12000);
    return () => clearInterval(interval);
  }, [trackingActive, trackingStage]);

  return (
    <div className={`redesign-theme min-h-screen bg-background text-foreground transition-colors duration-300 ${isDark ? "dark" : ""}`}>
      
      {/* Top Info Banner */}
      <div className="bg-brand text-brand-foreground px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Interactive UI/UX Redesign Sandbox</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDark(!isDark)} 
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            title="Toggle theme inside sandbox"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-32px)]">
        
        {/* Sandbox Menu / Navigation */}
        <aside className="w-full lg:w-72 bg-card border-b lg:border-b-0 lg:border-r border-border p-6 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2.5 px-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-soft">
                <Bike className="h-5 w-5" />
              </span>
              <div>
                <span className="text-base font-bold tracking-tight">UniDrop</span>
                <span className="block text-[10px] text-muted-foreground font-medium -mt-1">UI/UX Prototype</span>
              </div>
            </div>

            <nav className="mt-8 space-y-1">
              {[
                { id: "home", label: "Home Dashboard", icon: Home },
                { id: "marketplace", label: "Marketplace (Buy & Borrow)", icon: ShoppingBag },
                { id: "courier", label: "Courier Dashboard", icon: Award },
                { id: "track", label: "Live Tracking Screen", icon: Navigation },
                { id: "merchant", label: "Merchant Dashboard", icon: TrendingUp },
                { id: "styleguide", label: "Design System Tokens", icon: Eye },
              ].map(t => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-bold transition-all ${
                      active 
                        ? "bg-primary text-primary-foreground shadow-soft" 
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-8 pt-6 border-t border-border/60 text-[11px] text-muted-foreground space-y-2 px-2">
            <p className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-brand" />
              <span>Click items to trigger live interactions.</span>
            </p>
            <p>Scoped styling applies to variables without impacting external routes.</p>
          </div>
        </aside>

        {/* Dashboard Work Area */}
        <main className="flex-1 bg-background p-4 md:p-8 flex items-start justify-center overflow-y-auto">
          <div className="w-full max-w-[480px] sm:max-w-[640px] md:max-w-[960px] min-h-[500px] flex flex-col">
            
            {/* ACTIVE TAB CONTENT */}
            
            {/* ── HOME DASHBOARD REDESIGN ── */}
            {activeTab === "home" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Modern Header / GPS Location */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground border border-border">
                      <MapPin className="h-4.5 w-4.5" />
                    </span>
                    <div className="leading-tight">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deliver to</p>
                      <p className="text-xs font-bold">{location}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setCourierOnline(!courierOnline)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold transition-all shadow-soft border ${
                      courierOnline 
                        ? "bg-success/10 text-success border-success/30" 
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${courierOnline ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
                    {courierOnline ? "ON DUTY" : "GO LIVE"}
                  </button>
                </div>

                {/* Hero Position */}
                <div className="mt-4">
                  <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl leading-tight">
                    Need something on campus?<br />
                    <span className="text-brand">Get it delivered.</span>
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    UniDrop connects quick commerce canteen options, peer lending listings, and student courier networks in one campus system.
                  </p>
                </div>

                {/* Main Action Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  
                  {/* Card 1: Quick Order */}
                  <div 
                    onClick={() => { setActiveTab("marketplace"); setMarketTab("buy"); }}
                    className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-card hover:border-brand/40 transition-all duration-300 hover:shadow-soft flex flex-col justify-between min-h-[160px]"
                  >
                    <div>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand mb-3">
                        <ShoppingBag className="h-5 w-5" />
                      </span>
                      <h3 className="text-sm font-bold group-hover:text-brand transition-colors">Quick Order</h3>
                      <p className="text-[11px] text-muted-foreground mt-1">Snacks, stationery, and meals delivered in minutes.</p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-brand mt-4">
                      Browse stores <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>

                  {/* Card 2: Borrow Item */}
                  <div 
                    onClick={() => { setActiveTab("marketplace"); setMarketTab("borrow"); }}
                    className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-card hover:border-brand/40 transition-all duration-300 hover:shadow-soft flex flex-col justify-between min-h-[160px]"
                  >
                    <div>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success mb-3">
                        <Repeat2 className="h-5 w-5" />
                      </span>
                      <h3 className="text-sm font-bold group-hover:text-success transition-colors">Borrow Gear</h3>
                      <p className="text-[11px] text-muted-foreground mt-1">Rent calculators, chargers, or lab coats near you.</p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-success mt-4">
                      Explore feed <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>

                  {/* Card 3: Become Courier */}
                  <div 
                    onClick={() => setActiveTab("courier")}
                    className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-card hover:border-brand/40 transition-all duration-300 hover:shadow-soft flex flex-col justify-between min-h-[160px]"
                  >
                    <div>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-warning/10 text-warning mb-3">
                        <Bike className="h-5 w-5" />
                      </span>
                      <h3 className="text-sm font-bold group-hover:text-warning-foreground transition-colors">Runner Mode</h3>
                      <p className="text-[11px] text-muted-foreground mt-1">Earn cash & XP by delivering packages on your route.</p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-warning-foreground mt-4">
                      Start earning <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>

                </div>

                {/* Mock Active Delivery Drawer (Triggered by active state) */}
                {trackingActive && (
                  <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4 shadow-soft flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-soft">
                        <Clock className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs font-bold">Your delivery is on the way</p>
                        <p className="text-[10px] text-muted-foreground">ETA {trackingEta} min · Rahul (Runner) is near Block C</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab("track")}
                      className="rounded-lg bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground shadow-soft"
                    >
                      Track Live
                    </button>
                  </div>
                )}

                {/* Recommended Resources List */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-3.5">
                    <h2 className="text-sm font-bold tracking-tight">Available Near You</h2>
                    <button onClick={() => { setActiveTab("marketplace"); setMarketTab("borrow"); }} className="text-xs font-semibold text-brand">See all</button>
                  </div>
                  <div className="grid gap-2.5">
                    {staticLendItems.slice(0, 2).map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 shadow-card hover:shadow-soft transition-all">
                        <span className="text-2xl h-11 w-11 flex items-center justify-center rounded-lg bg-muted">{item.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold leading-tight">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.by} · {item.distance} away · {item.rating}★ rating</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-extrabold text-foreground">₹{item.pricePerHr}/hr</p>
                          <span className="inline-block rounded-full bg-success/15 px-1.5 py-0.5 text-[9px] font-bold text-success mt-0.5">Lending</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ── MARKETPLACE REDESIGN ── */}
            {activeTab === "marketplace" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Header */}
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight">Campus Marketplace</h1>
                  <p className="text-xs text-muted-foreground">Browse snacks, essentials, or borrow gear from campus companions.</p>
                </div>

                {/* Sub Tab Toggle (Buy vs Borrow) */}
                <div className="flex bg-secondary p-1 rounded-xl">
                  <button 
                    onClick={() => setMarketTab("buy")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${marketTab === "buy" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}
                  >
                    🏪 Buy (Canteen & Store)
                  </button>
                  <button 
                    onClick={() => setMarketTab("borrow")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${marketTab === "borrow" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}
                  >
                    🤝 Borrow (Student Exchanges)
                  </button>
                </div>

                {/* Category Chips (Buy tab only) */}
                {marketTab === "buy" && (
                  <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
                    <button 
                      onClick={() => setSelectedCategory("all")}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold border shrink-0 transition-colors ${
                        selectedCategory === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-secondary"
                      }`}
                    >
                      ✨ All Items
                    </button>
                    {staticCategories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold border shrink-0 transition-colors ${
                          selectedCategory === cat.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-secondary"
                        }`}
                      >
                        {cat.emoji} {cat.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Grid Lists */}
                {marketTab === "buy" ? (
                  <div className="grid grid-cols-2 gap-3">
                    {staticProducts
                      .filter(p => selectedCategory === "all" || p.category === selectedCategory)
                      .map(p => (
                        <div key={p.id} className="group bg-card border border-border rounded-xl overflow-hidden shadow-card hover:border-brand/35 transition-all">
                          <div className="aspect-square flex items-center justify-center text-4xl bg-muted relative">
                            <span>{p.emoji}</span>
                            <span className="absolute top-2 left-2 rounded-md bg-card/90 px-1.5 py-0.5 text-[9px] font-bold shadow-soft">⚡ {p.eta}</span>
                          </div>
                          <div className="p-3.5">
                            <p className="text-xs font-bold line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{p.shop} · {p.unit}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs font-bold text-foreground">₹{p.price}</span>
                              <button 
                                onClick={() => alert(`Added ${p.name} to cart (Simulated)`)}
                                className="h-7 w-7 rounded-full bg-brand text-brand-foreground flex items-center justify-center shadow-soft active:scale-95 transition-transform"
                                aria-label="Add to cart"
                              >
                                <Plus className="h-4 w-4" strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {staticLendItems.map(item => (
                      <div key={item.id} className="bg-card border border-border rounded-xl p-4 shadow-card hover:border-success/35 transition-all">
                        <div className="flex items-start gap-4">
                          <span className="text-3xl h-14 w-14 flex items-center justify-center rounded-xl bg-muted">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${item.tag === "Lend" ? "bg-success/15 text-success" : "bg-warning/15 text-warning-foreground"}`}>
                                {item.tag === "Lend" ? "LENDING" : "REQUESTING"}
                              </span>
                              <span className="text-[9px] text-muted-foreground">{item.posted}</span>
                              {item.status === "online" && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-success ml-auto">
                                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> online
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-bold mt-1 leading-snug">{item.title}</h3>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                              <span>{item.avatar} {item.by}</span>
                              <span>·</span>
                              <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" /> {item.rating}</span>
                              <span>·</span>
                              <span>{item.distance}</span>
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                              <span className="text-xs font-extrabold">₹{item.pricePerHr}<span className="text-[9px] font-normal text-muted-foreground">/hr</span></span>
                              <button 
                                onClick={() => alert(`Requested ${item.title} (Simulated)`)}
                                className="rounded-lg bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground shadow-soft transition-transform active:scale-95"
                              >
                                {item.tag === "Lend" ? "Borrow" : "Lend"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* ── COURIER DASHBOARD REDESIGN ── */}
            {activeTab === "courier" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Runner Workspace</h1>
                    <p className="text-xs text-muted-foreground">Deliver orders, gain XP, and build your reputation score.</p>
                  </div>
                  <button 
                    onClick={() => setCourierOnline(!courierOnline)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold transition-all shadow-soft border ${
                      courierOnline 
                        ? "bg-success/10 text-success border-success/30" 
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${courierOnline ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
                    {courierOnline ? "ONLINE" : "GO ONLINE"}
                  </button>
                </div>

                {/* Profile Widget */}
                <div className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 shadow-card">
                  <span className="text-3xl h-14 w-14 flex items-center justify-center rounded-xl bg-accent border border-border">🧑‍🎓</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Vihaan Reddy</p>
                    <p className="text-[10px] text-muted-foreground">CSE · 3rd year · Active Streak: {streak} days</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-success/15 px-2 py-0.5 text-[9px] font-bold text-success">
                        Reliability: 98%
                      </span>
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-brand/15 px-2 py-0.5 text-[9px] font-bold text-brand">
                        Rank: Expert
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Panel */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
                    <DollarSign className="h-5 w-5 text-success mx-auto mb-1" />
                    <p className="text-xl font-bold">₹{earnings}</p>
                    <p className="text-[9px] text-muted-foreground">Today's Earnings</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
                    <Award className="h-5 w-5 text-warning mx-auto mb-1" />
                    <p className="text-xl font-bold">{xp} XP</p>
                    <p className="text-[9px] text-muted-foreground">Experience Gained</p>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="bg-card border border-border rounded-xl p-4 shadow-card">
                  <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
                    <span>Level 4 Runner</span>
                    <span className="text-brand">850/1,000 XP</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: "85%" }} />
                  </div>
                </div>

                {/* Courier Achievements */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">Your Achievements</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { emoji: "🚀", name: "Speed Demon", desc: "Delivery < 8m" },
                      { emoji: "🔥", name: "On Fire", desc: "5 day streak" },
                      { emoji: "🌟", name: "5-Star Club", desc: "No complaints" },
                    ].map((ach, i) => (
                      <div key={i} className="bg-brand/5 border border-brand/15 rounded-xl p-3 text-center">
                        <span className="text-2xl mb-1 block">{ach.emoji}</span>
                        <p className="text-[10px] font-extrabold leading-tight">{ach.name}</p>
                        <p className="text-[8px] text-muted-foreground leading-tight mt-0.5">{ach.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Local deliveries dispatcher */}
                {courierOnline && (
                  <div className="bg-card border-2 border-dashed border-brand/30 rounded-xl p-5 text-center animate-in slide-in-from-bottom-2 duration-300">
                    <Activity className="h-6 w-6 text-brand mx-auto mb-2 animate-pulse" />
                    <p className="text-xs font-bold">Looking for campus courier jobs...</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Stay close to canteens or academic blocks for instant matchings.</p>
                  </div>
                )}

              </div>
            )}

            {/* ── TRACKING EXPERIENCE REDESIGN ── */}
            {activeTab === "track" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Active Tracking</h1>
                    <p className="text-xs text-muted-foreground">Order ID: #ORD-9402 · Realtime Campus Transit</p>
                  </div>
                  <span className="flex h-2.5 w-2.5 rounded-full bg-brand animate-ping" />
                </div>

                {/* Courier Profile Widget */}
                <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl h-11 w-11 flex items-center justify-center rounded-full bg-accent">🚴</span>
                    <div>
                      <p className="text-xs font-bold">Rahul Sharma</p>
                      <p className="text-[10px] text-muted-foreground">Student Courier · CSE 2nd Yr</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => alert("Calling runner... (Simulated)")} className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted text-muted-foreground active:scale-95 transition-transform">
                      <Phone className="h-4.5 w-4.5" />
                    </button>
                    <button onClick={() => alert("Opening chat chat overlay... (Simulated)")} className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted text-muted-foreground active:scale-95 transition-transform">
                      <MessageSquare className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

                {/* Timeline and Map Container */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-5">
                  
                  {/* Uber Eats-style Progress bar */}
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delivery Status</p>
                      <span className="text-xs font-bold text-brand">
                        {trackingStage === 4 ? "Arrived!" : `ETA ~ ${trackingEta} min`}
                      </span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden flex">
                      <div className="h-full bg-brand rounded-full transition-all duration-1000" style={{ width: `${(trackingStage / 4) * 100}%` }} />
                    </div>
                  </div>

                  {/* Horizontal Timeline checkpoints */}
                  <div className="flex items-start justify-between">
                    {[
                      { emoji: "✅", label: "Accepted", active: trackingStage >= 0 },
                      { emoji: "🍱", label: "Preparing", active: trackingStage >= 1 },
                      { emoji: "🚴", label: "Transit", active: trackingStage >= 2 },
                      { emoji: "📍", label: "Arrived", active: trackingStage >= 4 },
                    ].map((step, i) => (
                      <div key={i} className="flex flex-col items-center text-center w-16">
                        <span className={`text-sm h-8 w-8 flex items-center justify-center rounded-full border-2 ${
                          step.active ? "bg-brand/10 border-brand text-brand" : "bg-card border-border text-muted-foreground"
                        }`}>
                          {step.emoji}
                        </span>
                        <p className={`text-[9px] font-bold mt-1.5 ${step.active ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Campus Transit Landmark Note */}
                  <div className="bg-accent/40 rounded-lg p-3 text-xs border border-border/40 text-center font-medium">
                    📍 {
                      trackingStage === 0 ? "Courier accepted order. Waiting at counter." :
                      trackingStage === 1 ? "Food being prepared at Canteen fulfillment desk." :
                      trackingStage === 2 ? "Rahul passing through Library Shortcut." :
                      trackingStage === 3 ? "Rahul approaching Block A Corridor." :
                      "Courier arrived outside Room 214! Provide your OTP."
                    }
                  </div>
                </div>

                {/* Delivery OTP Security Verification */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-card text-center space-y-4">
                  <div>
                    <h3 className="text-sm font-bold">Confirm Handover</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Share this OTP with Rahul only when you receive your package.</p>
                  </div>

                  <div className="flex justify-center gap-2">
                    {deliveryOtp.split("").map((digit, i) => (
                      <span key={i} className="h-12 w-10 flex items-center justify-center rounded-xl bg-secondary text-lg font-bold border border-border">
                        {digit}
                      </span>
                    ))}
                  </div>

                  {!otpVerified ? (
                    <div className="flex gap-2 justify-center max-w-xs mx-auto">
                      <input 
                        type="text" 
                        placeholder="Verify code (3819)" 
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="flex-1 bg-secondary text-xs rounded-xl border border-border px-3 outline-none focus:border-brand"
                      />
                      <button 
                        onClick={() => {
                          if (otpInput === deliveryOtp) {
                            setOtpVerified(true);
                            setTrackingStage(4);
                          } else {
                            alert("Incorrect OTP mock validation.");
                          }
                        }}
                        className="rounded-xl bg-brand text-brand-foreground px-4 py-2 text-xs font-bold"
                      >
                        Verify
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-success text-xs font-bold justify-center">
                      <ShieldCheck className="h-4.5 w-4.5" />
                      <span>Handover Secured & Completed!</span>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ── MERCHANT DASHBOARD REDESIGN ── */}
            {activeTab === "merchant" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Hostel Canteen</h1>
                    <p className="text-xs text-muted-foreground">Fulfillment desk & analytics hub.</p>
                  </div>
                  <span className="rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-bold text-success border border-success/35">
                    Store Open
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-card border border-border rounded-xl p-3 shadow-card text-center">
                    <p className="text-xs text-muted-foreground">Today's Revenue</p>
                    <p className="text-lg font-extrabold mt-0.5">₹{merchantRevenue}</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-3 shadow-card text-center">
                    <p className="text-xs text-muted-foreground">Active Orders</p>
                    <p className="text-lg font-extrabold mt-0.5">{merchantOrders.length}</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-3 shadow-card text-center">
                    <p className="text-xs text-muted-foreground">Dispatch ETA</p>
                    <p className="text-lg font-extrabold mt-0.5">5.2m</p>
                  </div>
                </div>

                {/* Active orders management */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Live Incoming Orders</h3>
                  <div className="grid gap-2.5">
                    {merchantOrders.map((order, i) => (
                      <div key={order.id} className="bg-card border border-border rounded-xl p-4 shadow-card flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{order.id}</span>
                            <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase ${
                              order.status === "new" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning-foreground"
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs font-semibold mt-1.5">{order.item}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{order.to} · {order.time}</p>
                        </div>
                        {order.status === "new" && (
                          <button 
                            onClick={() => {
                              const updated = [...merchantOrders];
                              updated[i].status = "preparing";
                              setMerchantOrders(updated);
                              setMerchantRevenue(prev => prev + 120);
                            }}
                            className="rounded-lg bg-brand text-brand-foreground px-3 py-1.5 text-[10px] font-bold shadow-soft transition-transform active:scale-95"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Courier Dispatch / Available partners */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Available Courier Matches</h3>
                  <div className="grid gap-2">
                    {[
                      { name: "Aarav Sen", rating: "4.9", route: "Heading to Block A", match: "98%" },
                      { name: "Priya Kumar", rating: "4.8", route: "Heading to Hostel B", match: "86%" },
                    ].map((cour, index) => (
                      <div key={index} className="flex items-center justify-between bg-card border border-border rounded-xl p-3 shadow-card">
                        <div className="flex items-center gap-3">
                          <span className="text-xl h-9 w-9 flex items-center justify-center rounded-full bg-secondary">🧑</span>
                          <div>
                            <p className="text-xs font-bold">{cour.name} · {cour.rating}★</p>
                            <p className="text-[9px] text-muted-foreground">{cour.route}</p>
                          </div>
                        </div>
                        <span className="inline-flex rounded-full bg-success/15 px-2 py-0.5 text-[9px] font-bold text-success">
                          Match: {cour.match}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ── DESIGN SYSTEM PLAYGROUND ── */}
            {activeTab === "styleguide" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight">Design System System</h1>
                  <p className="text-xs text-muted-foreground">Scoped theme classes, color tokens, and button presets.</p>
                </div>

                {/* Color blocks */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Design Colors</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {[
                      { name: "Background", color: "bg-background border border-border", desc: "Var --background" },
                      { name: "Card Container", color: "bg-card border border-border", desc: "Var --card" },
                      { name: "Brand Accent", color: "bg-brand text-brand-foreground", desc: "Midnight Cobalt" },
                      { name: "Primary Key", color: "bg-primary text-primary-foreground", desc: "Deep Slate/Zinc" },
                      { name: "Secondary Action", color: "bg-secondary text-secondary-foreground border border-border", desc: "Light Gray/Slate" },
                      { name: "Muted Context", color: "bg-muted text-muted-foreground", desc: "Card Backings" },
                      { name: "Success Accent", color: "bg-success text-success-foreground", desc: "Emerald Green" },
                      { name: "Warning Indicator", color: "bg-warning text-warning-foreground", desc: "Warm Amber" },
                    ].map((col, idx) => (
                      <div key={idx} className={`rounded-xl p-3 text-center ${col.color} shadow-card`}>
                        <p className="text-[10px] font-extrabold">{col.name}</p>
                        <p className="text-[9px] opacity-75 mt-0.5">{col.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons & Presets */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Button Styles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <button className="rounded-xl bg-brand text-brand-foreground py-2.5 px-4 text-xs font-bold shadow-soft transition-transform active:scale-95">
                      Brand Active Button
                    </button>
                    <button className="rounded-xl bg-primary text-primary-foreground py-2.5 px-4 text-xs font-bold shadow-soft transition-transform active:scale-95">
                      Primary Dark Button
                    </button>
                    <button className="rounded-xl bg-secondary text-secondary-foreground border border-border py-2.5 px-4 text-xs font-bold shadow-card transition-transform active:scale-95">
                      Secondary Light Button
                    </button>
                  </div>
                </div>

                {/* Typography System */}
                <div className="bg-card border border-border rounded-xl p-4 shadow-card space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Typography Hierarchy</h3>
                  <p className="text-3xl font-extrabold tracking-tight">Display Title Extrabold (3xl)</p>
                  <p className="text-xl font-bold tracking-tight">Section Title Bold (xl)</p>
                  <p className="text-sm font-semibold">Body Heading Medium (sm)</p>
                  <p className="text-xs text-muted-foreground">Context Sub-text Muted (xs)</p>
                </div>

                {/* Shadow Structures */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-card border border-border rounded-xl p-4 shadow-soft text-center text-[10px] font-bold">
                    Soft Shadow Card (shadow-soft)
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 shadow-pop text-center text-[10px] font-bold">
                    Pop Shadow Drawers (shadow-pop)
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center text-[10px] font-bold">
                    Default border-scoped (shadow-card)
                  </div>
                </div>

              </div>
            )}
            
            {/* ── FOOTER CHIP ── */}
            <div className="mt-12 mb-6 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-4 text-[10px] text-muted-foreground">
              <span>UniDrop Design Sandbox</span>
              <span>·</span>
              <span>Click sidebar items to preview other screens</span>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles, Clock, MapPin, CheckCircle2, Package, Bike, Navigation, Trophy, Zap, ArrowLeft, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CourierAvatar } from "./CourierAvatar";
import { COURIER, MOCK_REQUESTS, BADGES, DELIVERY_HISTORY, type CourierPhase, type DeliveryRequest } from "./CourierData";
import { socketService } from "@/lib/socket";
import { api } from "@/lib/api";

const STAGES = [
  { label: "Accepted", icon: CheckCircle2 },
  { label: "Picking Up", icon: Package },
  { label: "On The Way", icon: Bike },
  { label: "Near You", icon: Navigation },
  { label: "Delivered", icon: Sparkles },
];
const CAMPUS_LABELS = ["Leaving pickup area", "Passing through Block A", "Using Library Shortcut", "Crossing Main Corridor", "Near drop-off point", "Approaching destination", "At delivery point"];
const ROUTE_LANDMARKS = [
  { emoji: "📦", label: "Pickup" },
  { emoji: "🏫", label: "Block A" },
  { emoji: "📚", label: "Library" },
  { emoji: "🏠", label: "Hostel" },
  { emoji: "📍", label: "Drop" },
];

export function CourierFlow() {
  const [phase, setPhase] = useState<CourierPhase>("dashboard");
  const [activeRequest, setActiveRequest] = useState<DeliveryRequest | null>(null);
  const [earnings, setEarnings] = useState(COURIER.todayEarnings);
  const [deliveryCount, setDeliveryCount] = useState(12);
  const [xp, setXp] = useState(COURIER.xp);
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);

  useEffect(() => {
    // Fetch existing pending orders from the backend
    api.get("/orders?status=pending&limit=10")
      .then(res => {
        if (res.data && res.data.orders) {
          const liveRequests: DeliveryRequest[] = res.data.orders.map((o: any) => ({
            id: o.order_id || String(Math.random()),
            item: o.items?.[0]?.name || "Package",
            customer: o.requester_id || "Student",
            pickup: o.pickup_name || o.pickup_location?.name || "Campus Location",
            drop: o.delivery_location || o.drop_location?.name || "Campus Drop",
            reward: o.total_amount ? Math.round(Number(o.total_amount) * 0.15) : 20,
            eta: 10,
            emoji: "📦",
            urgency: o.priority === "urgent" ? "HIGH" : "MEDIUM"
          }));
          setRequests(liveRequests);
        }
      })
      .catch(err => console.error("Failed to fetch orders", err));

    const socket = socketService.connect();
    socket.on("new_order", (data: any) => {
      const newReq: DeliveryRequest = {
        id: data.order_id,
        item: "New Order",
        customer: "Student",
        pickup: "Campus Store",
        drop: "Your Location",
        reward: 20,
        eta: 10,
        emoji: "📦",
        urgency: "HIGH",
      };
      setRequests((prev) => {
        // Prevent duplicates
        if (prev.find(r => r.id === newReq.id)) return prev;
        return [newReq, ...prev];
      });
      toast.info("🔔 New delivery request nearby!");
    });
    return () => {
      socket.off("new_order");
    };
  }, []);

  const handleAccept = (r: DeliveryRequest) => {
    setActiveRequest(r);
    setPhase("pickup");
    toast("📦 Delivery assigned!");
    const socket = socketService.connect();
    socket.emit("accept_order", { order_id: r.id, courier_name: COURIER.name });
  };

  return (
    <AnimatePresence mode="wait">
      {phase === "dashboard" && <Dashboard key="dash" earnings={earnings} deliveryCount={deliveryCount} xp={xp} onViewRequests={() => setPhase("requests")} />}
      {phase === "requests" && <RequestFeed key="req" requests={requests} onAccept={handleAccept} onBack={() => setPhase("dashboard")} />}
      {phase === "pickup" && activeRequest && <PickupScreen key="pick" request={activeRequest} onPickedUp={() => { setPhase("tracking"); toast("🚴 Let's go! Delivery started"); }} onBack={() => setPhase("requests")} />}
      {phase === "tracking" && activeRequest && <CourierTracking key="track" request={activeRequest} onDelivered={() => setPhase("complete")} />}
      {phase === "complete" && activeRequest && <DeliveryComplete key="done" request={activeRequest} onDone={() => { setEarnings(e => e + (activeRequest?.reward ?? 0)); setDeliveryCount(d => d + 1); setXp(x => x + 25); setActiveRequest(null); setPhase("dashboard"); }} />}
    </AnimatePresence>
  );
}

/* ── DASHBOARD ── */
function Dashboard({ earnings, deliveryCount, xp, onViewRequests }: { earnings: number; deliveryCount: number; xp: number; onViewRequests: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3 p-4">
      {/* Profile */}
      <div className="flex items-center gap-3 rounded-2xl border border-border p-3 shadow-card" style={{ background: "var(--color-card)" }}>
        <CourierAvatar gender={COURIER.gender} size={52} isMoving={false} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">{COURIER.name}</p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" />{COURIER.rating}</span>
            <span>·</span><span>{COURIER.dept}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "var(--color-success)", color: "var(--color-success-foreground)" }}>
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          <span className="text-[11px] font-bold">LIVE</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Today's Earnings", value: `₹${earnings}`, icon: "💰", color: "var(--color-success)" },
          { label: "Deliveries", value: String(deliveryCount), icon: "⚡", color: "var(--color-brand)" },
          { label: "Total XP", value: String(xp), icon: "✨", color: "var(--color-warning)" },
          { label: "Streak", value: `${COURIER.streak} 🔥`, icon: "🔥", color: "var(--color-destructive)" },
        ].map((s) => (
          <motion.div key={s.label} whileHover={{ scale: 1.02 }} className="rounded-2xl border border-border p-3 shadow-card" style={{ background: "var(--color-card)" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-xl font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* XP Progress */}
      <div className="rounded-2xl border border-border p-3 shadow-card" style={{ background: "var(--color-card)" }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Level Progress</p>
          <span className="text-xs font-bold" style={{ color: "var(--color-primary)" }}>{xp}/1500 XP</span>
        </div>
        <div className="h-2 w-full rounded-full" style={{ background: "var(--color-secondary)" }}>
          <motion.div className="h-full rounded-full" style={{ background: "var(--gradient-brand)" }} animate={{ width: `${(xp / 1500) * 100}%` }} />
        </div>
      </div>

      {/* Badges */}
      <div className="rounded-2xl border border-border p-3 shadow-card" style={{ background: "var(--color-card)" }}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Badges</p>
        <div className="grid grid-cols-4 gap-2">
          {BADGES.map(b => (
            <div key={b.name} className="flex flex-col items-center gap-1 rounded-xl p-2" style={{ opacity: b.unlocked ? 1 : 0.35, background: b.unlocked ? "var(--color-accent)" : "var(--color-secondary)" }}>
              <span className="text-xl">{b.emoji}</span>
              <span className="text-[8px] font-bold text-center leading-tight">{b.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="rounded-2xl border border-border p-3 shadow-card" style={{ background: "var(--color-card)" }}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Recent Deliveries</p>
        {DELIVERY_HISTORY.map((d, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{d.item}</p>
              <p className="text-[10px] text-muted-foreground">{d.from} → {d.to} · {d.time}</p>
            </div>
            <span className="text-xs font-bold" style={{ color: "var(--color-success)" }}>+₹{d.earned}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={onViewRequests}
        className="w-full rounded-2xl py-3.5 text-sm font-bold shadow-pop" style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>
        View Nearby Requests 🔔
      </motion.button>
    </motion.div>
  );
}

/* ── REQUEST FEED ── */
function RequestFeed({ requests, onAccept, onBack }: { requests: DeliveryRequest[]; onAccept: (r: DeliveryRequest) => void; onBack: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-3 p-4">
      <button onClick={onBack} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-1"><ArrowLeft className="h-3 w-3" />Back to Dashboard</button>
      <p className="text-lg font-bold">Nearby Requests</p>
      <p className="text-xs text-muted-foreground -mt-2">Accept a delivery to start earning</p>
      {requests.map((r, i) => (
        <motion.div key={r.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
          className="rounded-2xl border-2 p-4 shadow-card" style={{
            background: "var(--color-card)",
            borderColor: r.urgency === "HIGH" ? "var(--color-warning)" : "var(--color-border)",
          }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{r.emoji}</span>
              <div>
                <p className="text-sm font-bold">{r.item}</p>
                <p className="text-[10px] text-muted-foreground">by {r.customer}</p>
              </div>
            </div>
            {r.urgency === "HIGH" && (
              <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "var(--color-warning)", color: "var(--color-warning-foreground)" }}>URGENT</motion.span>
            )}
            {r.urgency === "MEDIUM" && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "var(--color-accent)", color: "var(--color-accent-foreground)" }}>MEDIUM</span>}
          </div>
          <div className="mt-3 flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" style={{ color: "var(--color-success)" }} />{r.pickup}</span>
            <span>→</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" style={{ color: "var(--color-destructive)" }} />{r.drop}</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="font-bold" style={{ color: "var(--color-success)" }}>₹{r.reward}</span>
            <span>·</span><span>ETA {r.eta} min</span>
          </div>
          {r.note && <p className="mt-2 text-[10px] italic text-muted-foreground">"{r.note}"</p>}
          <div className="mt-3 flex gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => onAccept(r)}
              className="flex-1 rounded-xl py-2.5 text-xs font-bold shadow-soft" style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>Accept</motion.button>
            <button className="rounded-xl px-4 py-2.5 text-xs font-semibold" style={{ background: "var(--color-secondary)", color: "var(--color-secondary-foreground)" }}>Ignore</button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ── PICKUP SCREEN ── */
function PickupScreen({ request, onPickedUp, onBack }: { request: DeliveryRequest; onPickedUp: () => void; onBack: () => void }) {
  const [storeStatus, setStoreStatus] = useState<"packing" | "ready">("packing");
  
  useEffect(() => {
    // Simulate Dark Store / Canteen Hub packing time (Blinkit style)
    const t = setTimeout(() => setStoreStatus("ready"), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3 p-4">
      <button onClick={onBack} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-1"><ArrowLeft className="h-3 w-3" />Back</button>
      
      {storeStatus === "packing" ? (
        <div className="rounded-2xl border border-warning/50 bg-warning/10 p-4 animate-pulse">
          <p className="text-sm font-bold text-warning-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Hub is packing the order...
          </p>
          <p className="text-xs text-muted-foreground mt-1">Please wait at {request.pickup} until the order is ready.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-success/50 bg-success/10 p-4">
          <p className="text-sm font-bold text-success flex items-center gap-2">
            ✅ Order is ready for pickup!
          </p>
          <p className="text-xs text-muted-foreground mt-1">Walk to the counter and collect.</p>
        </div>
      )}

      <div className="rounded-2xl border border-border p-4 shadow-card" style={{ background: "var(--color-card)" }}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pickup Location</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: "var(--color-accent)" }}>{request.emoji}</span>
          <div>
            <p className="text-lg font-bold">{request.pickup}</p>
            <p className="text-xs text-muted-foreground">Canteen Fulfillment Hub</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border p-4 shadow-card" style={{ background: "var(--color-card)" }}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Order Details</p>
        <p className="mt-2 text-sm font-bold">{request.item}</p>
        <p className="text-xs text-muted-foreground mt-1">For: {request.customer}</p>
        <p className="text-xs text-muted-foreground">Drop: {request.drop}</p>
        {request.note && <p className="mt-2 text-[11px] italic rounded-xl p-2" style={{ background: "var(--color-accent)" }}>📝 "{request.note}"</p>}
      </div>
      <div className="rounded-2xl border border-border p-3 shadow-card flex items-center justify-between" style={{ background: "var(--color-card)" }}>
        <span className="text-xs font-semibold">Reward</span>
        <span className="text-lg font-bold" style={{ color: "var(--color-success)" }}>₹{request.reward}</span>
      </div>
      <motion.button 
        whileTap={storeStatus === "ready" ? { scale: 0.98 } : {}} 
        onClick={storeStatus === "ready" ? onPickedUp : undefined}
        disabled={storeStatus === "packing"}
        className="w-full rounded-2xl py-3.5 text-sm font-bold shadow-pop transition-all disabled:opacity-50" style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>
        {storeStatus === "packing" ? "Waiting for Hub..." : "✅ Picked Up — Start Delivery"}
      </motion.button>
    </motion.div>
  );
}

/* ── COURIER TRACKING ── */
function CourierTracking({ request, onDelivered }: { request: DeliveryRequest; onDelivered: () => void }) {
  const [stage, setStage] = useState(2); // start at "On The Way"
  const [eta, setEta] = useState(request.eta);
  const [campusLabel, setCampusLabel] = useState(CAMPUS_LABELS[2]);
  const notified = useRef<Set<number>>(new Set([0, 1, 2]));

  useEffect(() => {
    const t = setInterval(() => setStage(s => { if (s >= 4) return s; return s + 1; }), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!notified.current.has(stage)) {
      notified.current.add(stage);
      if (stage === 3) toast("📍 Almost there!");
      if (stage === 4) { toast("✅ You've arrived! Deliver the item"); onDelivered(); }
    }
    const label = CAMPUS_LABELS[Math.min(stage, CAMPUS_LABELS.length - 1)];
    setCampusLabel(label);

    const socket = socketService.connect();
    socket.emit('update_courier_stage', {
      order_id: request.id,
      stage_index: stage,
      stage: STAGES[Math.min(stage, STAGES.length - 1)].label,
      progress: Math.min((stage / 4) * 100, 100),
      label: label,
      courier: COURIER.name
    });
  }, [stage, onDelivered, request.id]);

  useEffect(() => {
    if (stage >= 4) return;
    const t = setInterval(() => {
      setEta(e => {
        const nextEta = Math.max(0, e - 1);
        const socket = socketService.connect();
        socket.emit('update_courier_stage', { order_id: request.id, eta: nextEta });
        return nextEta;
      });
    }, 3000);
    return () => clearInterval(t);
  }, [stage, request.id]);

  const progress = Math.min((stage / 4) * 100, 100);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 p-4">
      <div className="flex items-center justify-between rounded-2xl border border-border p-3 shadow-card" style={{ background: "var(--color-card)" }}>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delivering To</p>
            <p className="text-sm font-bold">{request.drop}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{eta} min</p>
          <p className="text-[10px] text-muted-foreground">ETA</p>
        </div>
      </div>

      {/* Route */}
      <div className="rounded-2xl border border-border p-4 shadow-card" style={{ background: "var(--color-card)" }}>
        <div className="flex items-center justify-between mb-2">
          {ROUTE_LANDMARKS.map((lm, i) => (
            <div key={lm.label} className="flex flex-col items-center gap-0.5" style={{ width: "20%" }}>
              <motion.span animate={{ scale: Math.floor((progress / 100) * 4) === i ? [1, 1.2, 1] : 1 }} transition={{ duration: 1.5, repeat: Infinity }}>{lm.emoji}</motion.span>
              <span className="text-[9px] font-semibold text-center" style={{ color: i <= Math.floor((progress / 100) * 4) ? "var(--color-foreground)" : "var(--color-muted-foreground)" }}>{lm.label}</span>
            </div>
          ))}
        </div>
        <div className="relative h-2 w-full rounded-full" style={{ background: "var(--color-secondary)" }}>
          <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: "var(--gradient-brand)" }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }} />
        </div>
        <div className="relative mt-2" style={{ height: 44 }}>
          <motion.div className="absolute top-0" animate={{ left: `${Math.min(progress, 92)}%` }} transition={{ duration: 1 }} style={{ transform: "translateX(-50%)" }}>
            <CourierAvatar gender={COURIER.gender} size={40} isMoving={stage < 4} />
          </motion.div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p key={campusLabel} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-1 text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" style={{ color: "var(--color-primary)" }} />{campusLabel}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-border p-4 shadow-card" style={{ background: "var(--color-card)" }}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Delivery Timeline</p>
        {STAGES.map((s, i) => {
          const done = i < stage; const active = i === stage; const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <motion.div className="flex h-7 w-7 items-center justify-center rounded-full border-2"
                  style={{ background: done ? "var(--color-success)" : active ? "var(--color-brand)" : "var(--color-secondary)", borderColor: done ? "var(--color-success)" : active ? "var(--color-brand)" : "var(--color-border)", color: done || active ? (done ? "var(--color-success-foreground)" : "var(--color-brand-foreground)") : "var(--color-muted-foreground)" }}
                  animate={active ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}>
                  {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </motion.div>
                {i < STAGES.length - 1 && <div className="w-0.5" style={{ height: 20, background: done ? "var(--color-success)" : "var(--color-border)" }} />}
              </div>
              <div className="pt-0.5 pb-3">
                <p className="text-xs font-semibold" style={{ color: i > stage ? "var(--color-muted-foreground)" : "var(--color-foreground)" }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── DELIVERY COMPLETE ── */
function DeliveryComplete({ request, onDone }: { request: DeliveryRequest; onDone: () => void }) {
  const [otpInput, setOtpInput] = useState("");
  const [verified, setVerified] = useState(false);
  const correctOtp = "4827";

  const handleVerify = () => {
    if (otpInput === correctOtp) {
      setVerified(true);
      toast.success("✅ OTP Verified! Delivery confirmed!");
    } else {
      toast.error("Wrong OTP, try again");
    }
  };

  if (!verified) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 p-4">
        <div className="rounded-2xl border border-border p-4 shadow-card text-center" style={{ background: "var(--color-card)" }}>
          <p className="text-4xl mb-2">📦</p>
          <p className="text-lg font-bold">Enter Customer OTP</p>
          <p className="text-xs text-muted-foreground">Ask {request.customer} for the 4-digit code</p>
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2, 3].map(i => (
              <input key={i} type="text" maxLength={1} className="h-14 w-12 rounded-xl border-2 border-border text-center text-2xl font-bold" style={{ background: "var(--color-secondary)" }}
                value={otpInput[i] || ""}
                onChange={e => {
                  const v = e.target.value.replace(/\D/, "");
                  const newOtp = otpInput.split(""); newOtp[i] = v; setOtpInput(newOtp.join(""));
                  if (v && e.target.nextElementSibling) (e.target.nextElementSibling as HTMLInputElement).focus();
                }} />
            ))}
          </div>
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleVerify}
            className="mt-4 w-full rounded-2xl py-3 text-sm font-bold shadow-pop" style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>Verify OTP</motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 p-4">
      <motion.div initial={{ y: 30 }} animate={{ y: 0 }} className="rounded-2xl border border-border p-6 shadow-card text-center" style={{ background: "var(--color-card)" }}>
        <motion.p initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.6 }} className="text-6xl mb-3">🎉</motion.p>
        <p className="text-xl font-bold">Delivery Complete!</p>
        <p className="text-xs text-muted-foreground mt-1">Great job, {COURIER.name.split(" ")[0]}!</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3" style={{ background: "var(--color-accent)" }}>
            <p className="text-xl font-bold" style={{ color: "var(--color-success)" }}>+₹{request.reward}</p>
            <p className="text-[10px] text-muted-foreground">Earned</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: "var(--color-accent)" }}>
            <p className="text-xl font-bold" style={{ color: "var(--color-warning)" }}>+25 XP</p>
            <p className="text-[10px] text-muted-foreground">Experience</p>
          </div>
        </div>
      </motion.div>
      <motion.button whileTap={{ scale: 0.98 }} onClick={onDone}
        className="w-full rounded-2xl py-3.5 text-sm font-bold shadow-pop" style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>Back to Dashboard 🏠</motion.button>
    </motion.div>
  );
}

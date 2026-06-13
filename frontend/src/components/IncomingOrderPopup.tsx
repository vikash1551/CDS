import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useRunnerStore } from "@/lib/store";
import { MapPin, Navigation, Package, Star, Clock, ChevronRight, Check } from "lucide-react";

export function IncomingOrderPopup() {
  const { incomingOrder, setIncomingOrder, isOnline } = useRunnerStore();
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [accepted, setAccepted] = useState(false);

  const THUMB = 56;

  // Sound effect for incoming order (optional visual pulse if sound not playing)
  useEffect(() => {
    if (incomingOrder && !accepted) {
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [incomingOrder, accepted]);

  const getMaxX = useCallback(() => {
    if (!trackRef.current) return 200;
    return trackRef.current.offsetWidth - THUMB - 8;
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (accepted) return;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - THUMB / 2 - 4, getMaxX()));
    setDragX(x);
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);

    // Accept order threshold
    if (dragX > getMaxX() * 0.75) {
      setAccepted(true);
      toast.success("Order accepted! Routing to pickup...");
      setTimeout(() => {
        setIncomingOrder(null);
        setAccepted(false);
        setDragX(0);
        navigate({ to: "/track" }); // Or a specific runner dispatch route
      }, 1500);
    } else {
      setDragX(0);
    }
  };

  if (!isOnline || !incomingOrder) return null;

  const progress = dragging ? dragX / getMaxX() : 0;
  const thumbOffset = accepted ? getMaxX() : dragging ? dragX : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-background/80 p-4 pb-8 backdrop-blur-md transition-all duration-500 animate-in fade-in zoom-in-95">
      <div
        className="w-full max-w-[480px] overflow-hidden rounded-[32px] border border-border bg-card shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-300"
        style={{ transform: accepted ? "scale(0.95)" : "scale(1)", opacity: accepted ? 0.8 : 1 }}
      >
        {/* Header Map Area Simulation */}
        <div className="relative h-32 w-full bg-secondary overflow-hidden">
          {/* Simulated route lines */}
          <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 10 90 Q 30 10 90 20" fill="none" stroke="var(--color-primary)" strokeWidth="4" strokeDasharray="6 6" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />

          {/* Incoming Order Badge */}
          <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-brand px-4 py-1.5 shadow-[0_0_20px_rgba(var(--color-brand),0.5)]">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-foreground animate-pulse">
              New Request
            </p>
          </div>
        </div>

        <div className="px-5 pb-6 pt-2">
          {/* Earnings & EXP */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold tracking-tight">₹{incomingOrder.earnings}</p>
              <p className="text-sm font-semibold text-muted-foreground mt-0.5">Estimated Earnings</p>
            </div>
            <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-warning/15 text-warning">
              <Star className="h-5 w-5 fill-current mb-0.5" />
              <span className="text-sm font-bold">+{incomingOrder.exp}</span>
            </div>
          </div>

          <div className="my-5 h-px w-full bg-border" />

          {/* Route Details */}
          <div className="relative space-y-5">
            {/* Connection Line */}
            <div className="absolute left-[19px] top-[24px] bottom-[24px] w-0.5 bg-border border-dashed border-l-2" />

            <div className="flex gap-4">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent border-[3px] border-card">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">Pickup</p>
                <p className="text-base font-bold mt-0.5">{incomingOrder.pickupLocation}</p>
                <p className="text-sm text-muted-foreground">{incomingOrder.pickupDistance} away</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {incomingOrder.items.map(item => (
                    <span key={item} className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold">{item}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary border-[3px] border-card text-primary-foreground">
                <Navigation className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">Dropoff</p>
                <p className="text-base font-bold mt-0.5">{incomingOrder.dropoffLocation}</p>
                <p className="text-sm text-muted-foreground">{incomingOrder.dropoffDistance} from pickup</p>
              </div>
            </div>
          </div>

          <div className="my-5 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
            <Clock className="h-4 w-4" /> Total est. time: {incomingOrder.eta}
          </div>

          {/* Swipe to Accept Slider */}
          <div
            className="relative h-[68px] overflow-hidden rounded-[24px] bg-secondary p-1.5 transition-colors duration-500"
            style={{
              background: accepted ? "var(--color-primary)" : "var(--color-secondary)"
            }}
          >
            <div
              ref={trackRef}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              {!accepted && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60" style={{ animation: "shimmer-text 2s ease-in-out infinite" }}>
                    Swipe to accept
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/40" style={{ animation: "nudge-right 1.5s ease-in-out infinite" }} />
                  <ChevronRight className="h-5 w-5 text-muted-foreground/20 -ml-4" style={{ animation: "nudge-right 1.5s ease-in-out infinite" }} />
                </div>
              )}
              {accepted && (
                <span className="text-sm font-bold uppercase tracking-wider text-primary-foreground">
                  Accepted
                </span>
              )}
            </div>

            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="absolute top-1.5 flex h-[56px] w-[56px] cursor-grab items-center justify-center rounded-[20px] shadow-sm transition-[left,background,transform] active:cursor-grabbing touch-none select-none"
              style={{
                left: `${6 + thumbOffset}px`,
                transitionDuration: dragging ? "0ms" : "300ms",
                background: accepted ? "var(--color-primary-foreground)" : "var(--color-primary)",
                color: accepted ? "var(--color-primary)" : "var(--color-primary-foreground)",
              }}
            >
              {accepted ? <Check className="h-6 w-6" strokeWidth={3} /> : <ChevronRight className="h-7 w-7" strokeWidth={2.5} />}
            </div>
          </div>

          <button
            onClick={() => {
              setIncomingOrder(null);
            }}
            className="w-full mt-4 text-center text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

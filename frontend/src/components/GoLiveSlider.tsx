import { useState, useRef, useCallback } from "react";
import { Zap, Bike, ChevronRight } from "lucide-react";

export function GoLiveSlider({ isLive, onChange }: { isLive: boolean; onChange: (v: boolean) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  const THUMB = 52;
  const getMaxX = useCallback(() => {
    if (!trackRef.current) return 200;
    return trackRef.current.offsetWidth - THUMB - 8;
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isLive) { onChange(false); return; }
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
    if (dragX > getMaxX() * 0.65) {
      onChange(true);
    }
    setDragX(0);
  };

  const thumbOffset = isLive ? getMaxX() : dragging ? dragX : 0;
  const progress = isLive ? 1 : dragging ? dragX / getMaxX() : 0;

  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-card transition-all duration-500"
      style={{
        borderColor: isLive ? "oklch(0.72 0.19 142)" : "var(--color-border)",
        background: isLive
          ? "linear-gradient(135deg, oklch(0.25 0.06 150), oklch(0.22 0.04 160))"
          : "var(--color-card)",
      }}
    >
      {/* Slider track */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
            )}
            <span className={`text-xs font-bold uppercase tracking-wider ${isLive ? "text-green-400" : "text-muted-foreground"}`}>
              {isLive ? "You're Live" : "Go on duty"}
            </span>
          </div>
          {isLive && (
            <span className="text-[11px] font-semibold text-green-400/80">
              Tap thumb to go offline
            </span>
          )}
        </div>

        <div
          ref={trackRef}
          className="relative h-[60px] rounded-2xl transition-all duration-500"
          style={{
            background: isLive
              ? "linear-gradient(90deg, oklch(0.45 0.18 150), oklch(0.55 0.2 140))"
              : `linear-gradient(90deg, oklch(${0.92 - progress * 0.47} ${progress * 0.18} ${150 - progress * 10}), oklch(${0.95 - progress * 0.4} ${progress * 0.15} ${155}))`,
          }}
        >
          {/* Shimmer hint text */}
          {!isLive && !dragging && (
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 pointer-events-none">
              <span className="text-sm font-bold text-foreground/40" style={{ animation: "shimmer-text 2s ease-in-out infinite" }}>
                Slide to go live
              </span>
              <ChevronRight className="h-4 w-4 text-foreground/30" style={{ animation: "nudge-right 1.5s ease-in-out infinite" }} />
            </div>
          )}

          {/* Live label */}
          {isLive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-sm font-bold text-white/90 tracking-wide">🟢 ON DUTY</span>
            </div>
          )}

          {/* Draggable thumb */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute top-1 h-[52px] w-[52px] cursor-grab rounded-xl shadow-lg transition-[left] flex items-center justify-center active:cursor-grabbing select-none touch-none"
            style={{
              left: `${4 + thumbOffset}px`,
              transitionDuration: dragging ? "0ms" : "400ms",
              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              background: isLive
                ? "linear-gradient(135deg, #fff, #e8f5e9)"
                : "linear-gradient(135deg, #fff, #f5f5f5)",
              boxShadow: isLive
                ? "0 4px 20px rgba(76, 175, 80, 0.4)"
                : "0 4px 15px rgba(0,0,0,0.15)",
            }}
          >
            {isLive ? (
              <Zap className="h-6 w-6 text-green-600" strokeWidth={2.5} />
            ) : (
              <Bike className="h-6 w-6 text-foreground/70" strokeWidth={2} />
            )}
          </div>
        </div>
      </div>

      {/* Stats bar when live */}
      {isLive && (
        <div
          className="flex items-center justify-around border-t border-white/10 px-4 py-2.5"
          style={{ animation: "fade-up 0.4s ease-out" }}
        >
          <div className="text-center">
            <p className="text-lg font-bold text-white">₹0</p>
            <p className="text-[10px] text-green-300/70">Earned today</p>
          </div>
          <div className="h-6 w-px bg-white/15" />
          <div className="text-center">
            <p className="text-lg font-bold text-white">0</p>
            <p className="text-[10px] text-green-300/70">Deliveries</p>
          </div>
          <div className="h-6 w-px bg-white/15" />
          <div className="text-center">
            <p className="text-lg font-bold text-white">0m</p>
            <p className="text-[10px] text-green-300/70">Online</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer-text {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes nudge-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

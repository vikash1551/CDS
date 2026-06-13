import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CustomLogo } from "@/components/Logo";

export const Route = createFileRoute("/splash")({
  head: () => ({
    meta: [
      { title: "UniDrop" },
      { name: "description", content: "UniDrop — order, lend, and deliver across campus." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0); // 0=logo, 1=tagline, 2=exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => navigate({ to: "/login" }), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-primary">
      {/* Animated background rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/5"
            style={{
              width: `${i * 220}px`,
              height: `${i * 220}px`,
              animation: `splash-ring ${2 + i * 0.4}s ease-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Logo + Text */}
      <div
        className="relative flex flex-col items-center gap-5 transition-all duration-700"
        style={{
          opacity: phase === 2 ? 0 : 1,
          transform: phase === 2 ? "scale(1.15)" : "scale(1)",
        }}
      >
        {/* Logo icon */}
        <div
          className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-brand shadow-pop transition-all duration-700"
          style={{
            opacity: phase >= 0 ? 1 : 0,
            transform: phase >= 0 ? "translateY(0) scale(1)" : "translateY(30px) scale(0.8)",
          }}
        >
          <CustomLogo className="h-12 w-12 text-brand-foreground" />
        </div>

        {/* App name */}
        <div
          className="text-center transition-all duration-700"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-primary-foreground">
            UniDrop
          </h1>
          <p className="mt-2 text-sm font-medium text-primary-foreground/60">
            Order · Lend · Deliver
          </p>
        </div>

        {/* Loading dots */}
        <div
          className="mt-4 flex gap-1.5 transition-all duration-500"
          style={{ opacity: phase >= 1 ? 1 : 0 }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-brand/80"
              style={{
                animation: "splash-dot 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes splash-ring {
          0% { transform: scale(0.8); opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes splash-dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

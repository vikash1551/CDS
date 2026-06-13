import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, ShoppingBag, Bike, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/select-role")({
  head: () => ({
    meta: [
      { title: "Choose Your Role — UniDrop" },
      { name: "description", content: "Select how you want to use UniDrop — order or deliver." },
    ],
  }),
  component: SelectRole,
});

const ROLES = [
  {
    id: "buyer",
    emoji: "🛒",
    title: "I want to order",
    subtitle: "Browse stores, order food & supplies, get campus delivery",
    perks: ["Order from 50+ campus shops", "Live tracking with ETA", "Lend & borrow gear"],
    icon: ShoppingBag,
    gradient: "linear-gradient(135deg, oklch(0.93 0.18 100) 0%, oklch(0.85 0.16 75) 100%)",
    borderActive: "oklch(0.85 0.16 75)",
  },
  {
    id: "runner",
    emoji: "🚴",
    title: "I want to deliver",
    subtitle: "Pick up orders on your route and earn ₹10–40 per drop",
    perks: ["Earn while walking to class", "Flexible — accept when free", "Build campus reputation"],
    icon: Bike,
    gradient: "linear-gradient(135deg, oklch(0.32 0.14 282) 0%, oklch(0.22 0.1 280) 100%)",
    borderActive: "oklch(0.27 0.12 282)",
  },
  {
    id: "both",
    emoji: "⚡",
    title: "Both — I'll do it all",
    subtitle: "Order when you need, deliver when you're free",
    perks: ["Full access to everything", "Switch modes anytime", "Bonus campus points"],
    icon: Sparkles,
    gradient: "linear-gradient(135deg, oklch(0.7 0.16 150) 0%, oklch(0.55 0.14 170) 100%)",
    borderActive: "oklch(0.7 0.16 150)",
  },
];

function SelectRole() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => {
      navigate({ to: "/" });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-primary px-6 pb-10 pt-12 md:px-8 md:pt-16">
        <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-brand/8" />
        <div className="absolute right-0 bottom-0 h-36 w-36 rounded-full bg-brand/6" />

        <div className="relative mx-auto max-w-[420px]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand shadow-pop">
              <Zap className="h-5 w-5 text-brand-foreground" strokeWidth={3} />
            </span>
            <span className="text-xl font-bold tracking-tight text-primary-foreground">
              UniDrop
            </span>
          </div>

          <h1 className="mt-8 text-3xl font-bold text-primary-foreground md:text-4xl">
            How will you use<br />UniDrop? 🤔
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/60">
            You can always change this later in settings
          </p>
        </div>
      </div>

      {/* Role cards */}
      <div className="relative -mt-5 mx-auto max-w-[420px] px-4 pb-8">
        <div className="space-y-3">
          {ROLES.map((role) => {
            const active = selected === role.id;
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                className="w-full rounded-3xl border-2 bg-card p-4 text-left shadow-card transition-all md:p-5"
                style={{
                  borderColor: active ? role.borderActive : "var(--color-border)",
                  transform: active ? "scale(1.02)" : "scale(1)",
                  boxShadow: active ? "0 8px 32px -8px rgba(0,0,0,0.2)" : undefined,
                }}
              >
                <div className="flex items-start gap-3.5">
                  {/* Icon */}
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl text-white shadow-soft"
                    style={{ background: role.gradient }}
                  >
                    {role.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold">{role.title}</h3>
                      {active && (
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded-full text-white text-xs"
                          style={{ background: role.borderActive }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{role.subtitle}</p>
                  </div>
                </div>

                {/* Perks (expanded when selected) */}
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: active ? "140px" : "0px",
                    opacity: active ? 1 : 0,
                    marginTop: active ? "12px" : "0px",
                  }}
                >
                  <div className="rounded-2xl bg-background/80 p-3 space-y-2">
                    {role.perks.map((perk) => (
                      <div key={perk} className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-[10px]">
                          ✓
                        </span>
                        <span className="text-xs font-medium">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition-all hover:shadow-pop active:scale-[0.98] disabled:opacity-40"
        >
          {loading ? (
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary-foreground"
                  style={{
                    animation: "role-dot 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </span>
          ) : (
            <>
              Get started <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Step indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {["Account", "College", "Role"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{
                    background: i <= 2 ? "var(--color-primary)" : "var(--color-secondary)",
                    color: i <= 2 ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
                  }}
                >
                  {i < 2 ? "✓" : i + 1}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
              </div>
              {i < 2 && <div className="h-px w-6 bg-border" />}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes role-dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

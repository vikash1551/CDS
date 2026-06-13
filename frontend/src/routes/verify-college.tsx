import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Zap, GraduationCap, CheckCircle2, ArrowRight, Search } from "lucide-react";
import { COLLEGES } from "../lib/colleges";

export const Route = createFileRoute("/verify-college")({
  head: () => ({
    meta: [
      { title: "Verify College — UniDrop" },
      { name: "description", content: "Select your college to get started on UniDrop." },
    ],
  }),
  component: VerifyCollege,
});

function VerifyCollege() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"college" | "verified">("college");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return COLLEGES.slice(0, 20);
    return COLLEGES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 30);
  }, [search]);

  const handleContinue = () => {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => {
      setStep("verified");
      setTimeout(() => navigate({ to: "/select-role" }), 1500);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-hero px-6 pb-10 pt-12 md:px-8 md:pt-16">
        <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-primary/8" />
        <div className="relative mx-auto max-w-[420px]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand shadow-pop">
              <Zap className="h-5 w-5 text-brand-foreground" strokeWidth={3} />
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground">
              UniDrop
            </span>
          </div>

          <h1 className="mt-8 text-3xl font-bold text-foreground md:text-4xl">
            {step === "college" && <>Select your college 🎓</>}
            {step === "verified" && <>You're all set ✅</>}
          </h1>
          <p className="mt-2 text-sm text-foreground/60">
            {step === "college" && `${COLLEGES.length}+ colleges across India`}
            {step === "verified" && "Welcome to the campus network!"}
          </p>
        </div>
      </div>

      {/* Content card */}
      <div className="relative -mt-5 mx-auto max-w-[420px] px-4 pb-8">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-pop md:p-7">

          {/* College selection */}
          {step === "college" && (
            <>
              {/* Search */}
              <div className="flex items-center gap-2.5 rounded-xl border border-input bg-background px-3.5 py-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search your college..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  autoFocus
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                )}
              </div>

              {search && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
                </p>
              )}

              {/* List */}
              <div className="mt-3 max-h-[340px] space-y-1.5 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                {filtered.map((c) => {
                  const active = selected === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setSelected(c.name)}
                      className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all"
                      style={{
                        borderColor: active ? "var(--color-brand)" : "var(--color-border)",
                        background: active ? "oklch(0.96 0.06 85)" : "var(--color-background)",
                      }}
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                        style={{ background: active ? "var(--color-brand)" : "var(--color-secondary)" }}
                      >
                        <GraduationCap
                          className="h-4.5 w-4.5"
                          style={{ color: active ? "var(--color-brand-foreground)" : "var(--color-foreground)" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{c.name}</p>
                        {c.city && <p className="text-[11px] text-muted-foreground">{c.city}</p>}
                      </div>
                      {active && (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-brand" />
                      )}
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No college found — try a different name
                  </div>
                )}
              </div>

              {/* Continue */}
              <button
                onClick={handleContinue}
                disabled={!selected || loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-bold text-brand-foreground shadow-soft transition-all hover:shadow-pop active:scale-[0.98] disabled:opacity-40"
              >
                {loading ? <LoadingDots /> : (<>Continue <ArrowRight className="h-4 w-4" /></>)}
              </button>
            </>
          )}

          {/* Verified */}
          {step === "verified" && (
            <div className="flex flex-col items-center py-8">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15"
                style={{ animation: "pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
              >
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h2 className="mt-4 text-xl font-bold">College Selected!</h2>
              <p className="mt-1 text-sm text-muted-foreground">{selected}</p>
              <div className="mt-4 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-brand"
                    style={{
                      animation: "verify-dot 1.2s ease-in-out infinite",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Setting up your account...</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes verify-dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-brand-foreground"
          style={{
            animation: "verify-dot 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </span>
  );
}

import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { MobileShell } from "@/components/MobileShell";
import { lendItems } from "@/lib/data";
import { Star, Shield, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/store";
import { api } from "@/lib/api";

export const Route = createFileRoute("/lend-item/$id")({
  component: LendDetail,
});

function LendDetail() {
  const { id } = useParams({ from: "/lend-item/$id" });
  const l = lendItems.find((x) => x.id === id) ?? lendItems[0];
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleBorrow = async () => {
    setIsLoading(true);
    try {
      // Call real backend API to create a lending request
      const res = await api.post('/request-item', {
        requester_id: user?.email || 'demo_user',
        item: l.title,
        category: 'academic',
        pickup: 'Library',
        duration: '2 hours',
        reward: 50,
      });

      const match = res.data.match;
      const reqId = res.data.request?.request_id || `req_${Date.now()}`;
      
      // Save active request to store
      import("@/lib/store").then(m => m.runnerActions.setActiveLendRequestId(reqId));
      
      // Navigate to lend-track page with real match info from backend
      navigate({
        to: '/lend-track',
        search: {
          requestId: reqId,
          lender: match?.lender || l.by,
          distance: match?.distance || l.distance,
          rating: match?.rating || l.rating
        }
      });
      toast.success("Request successful! Matching...");
    } catch (err: any) {
      // Fallback: still navigate even if backend is down
      const fallbackReqId = `req_${Date.now()}`;
      import("@/lib/store").then(m => m.runnerActions.setActiveLendRequestId(fallbackReqId));
      navigate({
        to: '/lend-track',
        search: {
          requestId: fallbackReqId,
          lender: l.by,
          distance: l.distance,
          rating: l.rating
        }
      });
      toast.success("Request placed (offline mode)");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileShell>
      <TopBar title={l.tag === "Lend" ? "Lending offer" : "Open request"} />
      <div className="md:grid md:grid-cols-2 md:gap-8">
      <div className="flex aspect-[4/3] items-center justify-center text-[120px] md:rounded-3xl md:aspect-square" style={{ background: l.bg }}>
        {l.emoji}
      </div>

      <div className="px-4 py-4 md:px-0 md:py-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${l.tag === "Lend" ? "bg-success/15 text-success" : "bg-warning/25 text-warning-foreground"}`}>
            {l.tag === "Lend" ? "LENDING NOW" : "URGENT NEED"}
          </span>
          {l.status === "online" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> online
            </span>
          )}
        </div>
        <h1 className="mt-2 text-2xl font-bold">{l.title}</h1>
        <p className="text-xs text-muted-foreground">{l.distance} away · {l.posted}</p>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-2xl">{l.avatar}</div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{l.by}</p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Star className="h-3 w-3 fill-warning text-warning" /> {l.rating} · 38 lends · CSE 3rd yr
            </p>
          </div>
          <button 
            onClick={() => navigate({ to: '/chat/$id', params: { id: l.by } })}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Price" value={`₹${l.pricePerHr}/hr`} />
          <Stat label="Min" value="1 hr" />
          <Stat label="Deposit" value="₹0" />
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-bold flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> Campus protected</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Verified by college email. Live tracking during handover. Auto-refund if item not returned.
          </p>
        </div>

        <div className="mt-4">
          <p className="text-sm font-bold">Reviews</p>
          <div className="mt-2 space-y-2">
            {[
              { n: "Meera P.", t: "On time and super polite. Calculator was clean.", r: 5 },
              { n: "Arjun T.", t: "Saved my exam. Met me right at the library entrance.", r: 5 },
            ].map((r, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">{r.n}</p>
                  <p className="flex items-center gap-0.5 text-[11px] text-warning"><Star className="h-3 w-3 fill-current" /> {r.r}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-[9999] mx-auto w-full max-w-[480px] pointer-events-auto border-t border-border bg-card px-4 py-3 md:sticky md:bottom-6 md:mt-6 md:max-w-none md:rounded-2xl md:border md:px-5 md:py-4 md:shadow-pop"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))", pointerEvents: "auto" }}
      >
        <button
          type="button"
          onClick={() => setShowConfirmModal(true)}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-pop disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Processing...
            </>
          ) : (
            "Request Item"
          )}
        </button>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/50 px-4 py-8 sm:items-center">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl">
            <h3 className="text-xl font-bold">Confirm Request</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to place a request for <strong>{l.title}</strong>? We will notify nearby lenders immediately.
            </p>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-xl bg-secondary py-3 text-sm font-bold text-secondary-foreground shadow-soft active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowConfirmModal(false);
                  handleBorrow();
                }}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-pop active:scale-95 transition-transform"
              >
                Yes, Request
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}

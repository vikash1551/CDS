import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MobileShell } from "@/components/MobileShell";
import { TopBar } from "@/components/TopBar";
import { lendItems, LendItem } from "@/lib/data";
import { Star, Plus } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/lend")({
  head: () => ({
    meta: [
      { title: "Lend & Buy — Live student exchange" },
      { name: "description", content: "Borrow, buy, or list campus gear with fellow students in real-time." },
    ],
  }),
  component: Lend,
});

function Lend() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"all" | "Lend" | "Need">("all");
  const [items, setItems] = useState<LendItem[]>(lendItems);
  const [showListModal, setShowListModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState<number>(15);
  const [newTag, setNewTag] = useState<"Lend" | "Need">("Lend");

  // Fetch listings from backend on mount
  useEffect(() => {
    api.get('/lend-requests')
      .then((res) => {
        const backendItems = res.data.requests as LendItem[];
        if (backendItems && backendItems.length > 0) {
          setItems(backendItems);
        }
      })
      .catch(() => {
        // Fallback: keep using the local mock data
      });
  }, []);

  const list = tab === "all" ? items : items.filter((x) => x.tag === tab);

  const openListModal = (tag: "Lend" | "Need") => {
    setNewTag(tag);
    setShowListModal(true);
  };

  const handleCreateListing = async () => {
    if (!newTitle.trim()) {
      toast.error("Enter a valid title for your item");
      return;
    }

    const newItem: LendItem = {
      id: `l${Date.now()}`,
      title: newTitle.trim(),
      by: "You",
      avatar: newTag === "Lend" ? "🧑‍🎓" : "🛒",
      rating: 5,
      distance: "Campus",
      pricePerHr: newPrice,
      emoji: newTag === "Lend" ? "🧳" : "🛒",
      bg: newTag === "Lend" ? "oklch(0.93 0.08 200)" : "oklch(0.94 0.09 30)",
      tag: newTag,
      posted: "Just now",
      status: "online",
    };

    // Optimistic UI update
    setItems([newItem, ...items]);
    setShowListModal(false);
    setNewTitle("");
    setNewPrice(15);
    setNewTag("Lend");
    toast.success("Your item has been listed!");

    // Persist to backend
    try {
      await api.post('/create-listing', newItem);
    } catch {
      // Already added locally, so no rollback needed for demo
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setItems(items.filter((x) => x.id !== itemId));
    toast.success("Item removed");
    try {
      await api.delete(`/delete-listing/${itemId}`);
    } catch {
      // Already removed locally
    }
  };

  return (
    <MobileShell>
      <TopBar title="Lend & Buy" subtitle="42 active listings · campus-wide" />

      <div className="px-4 py-3">
        <div className="flex gap-2">
          {(["all", "Lend", "Need"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 rounded-xl border py-2 text-xs font-bold capitalize transition"
              style={{
                background: tab === t ? "var(--color-primary)" : "var(--color-card)",
                color: tab === t ? "var(--color-primary-foreground)" : "var(--color-foreground)",
                borderColor: tab === t ? "var(--color-primary)" : "var(--color-border)",
              }}
            >
              {t === "all" ? "All" : t === "Lend" ? "Lend" : "Buy"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 px-4 pb-6 sm:grid-cols-2 md:grid-cols-2 md:gap-4 md:px-0 lg:grid-cols-3">
        {list.map((l) => (
          <div
            key={l.id}
            onClick={() => navigate({ to: "/lend-item/$id", params: { id: l.id } })}
            className="block cursor-pointer rounded-2xl border border-border bg-card p-3 shadow-card transition hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl" style={{ background: l.bg }}>
                {l.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${l.tag === "Lend" ? "bg-success/15 text-success" : "bg-warning/25 text-warning-foreground"}`}>
                    {l.tag === "Lend" ? "LENDING" : "REQUESTING"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{l.posted}</span>
                  {l.status === "online" && <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" /> online
                  </span>}
                </div>
                <p className="mt-1 line-clamp-1 text-sm font-semibold">{l.title}</p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{l.avatar} {l.by}</span>
                  <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" />{l.rating}</span>
                  <span>· {l.distance}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-bold">₹{l.pricePerHr}<span className="text-[10px] font-normal text-muted-foreground">/hr</span></p>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(l.id);
                      }}
                      className="rounded-full bg-destructive/10 px-3 py-1 text-[11px] font-bold text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Remove
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({ to: "/lend-item/$id", params: { id: l.id } });
                      }}
                      className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground transition hover:brightness-110"
                    >
                      {l.tag === "Lend" ? "Borrow" : "Lend"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => openListModal("Lend")}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-5 z-50 pointer-events-auto flex h-14 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-soft transition-transform active:scale-95 hover:scale-105 md:left-8"
        style={{ pointerEvents: "auto" }}
      >
        <Plus className="h-5 w-5" strokeWidth={3} />
        List item
      </button>

      <button
        type="button"
        onClick={() => openListModal("Need")}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-5 z-50 pointer-events-auto flex h-14 items-center gap-2 rounded-full bg-brand px-5 text-brand-foreground shadow-pop md:right-8 transition-transform active:scale-95 hover:scale-105"
        style={{ pointerEvents: "auto" }}
      >
        <Plus className="h-5 w-5" strokeWidth={3} />
        Post request
      </button>

      {showListModal ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 px-4 py-6 sm:items-center sm:px-6">
          <div className="w-full max-w-xl rounded-3xl bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{newTag === "Lend" ? "List your item" : "Post a buy request"}</p>
                <h2 className="mt-2 text-xl font-bold">{newTag === "Lend" ? "List an item to lend" : "Request an item"}</h2>
              </div>
              <button onClick={() => setShowListModal(false)} className="rounded-full p-2 text-muted-foreground transition hover:text-foreground">
                ×
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <label className="block text-sm font-semibold">Item title</label>
              <input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder={newTag === "Lend" ? "e.g. Scientific calculator" : "e.g. Reference book"}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <label className="block text-sm font-semibold">Price per hour</label>
              <input
                type="number"
                min={1}
                value={newPrice}
                onChange={(event) => setNewPrice(Number(event.target.value))}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setNewTag("Lend")}
                  className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${newTag === "Lend" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}`}
                >
                  Lend
                </button>
                <button
                  onClick={() => setNewTag("Need")}
                  className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${newTag === "Need" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}`}
                >
                  Buy
                </button>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleCreateListing}
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:brightness-110"
              >
                {newTag === "Lend" ? "List item" : "Post request"}
              </button>
              <button
                type="button"
                onClick={() => setShowListModal(false)}
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </MobileShell>
  );
}

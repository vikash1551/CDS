import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { TopBar } from "@/components/TopBar";
import { Bell, Package, Repeat2, Star, Zap, Bike, Gift, Clock, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { socketService } from "@/lib/socket";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — UniDrop" },
      { name: "description", content: "Stay updated with order statuses, lend requests, and campus alerts." },
    ],
  }),
  component: Notifications,
});

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  emoji: string;
  link?: string;
};

const FALLBACK: Notif[] = [
  { id: "n1", type: "order", title: "Order delivered! 🎉", body: "Your Masala Maggi + Cold Coffee has arrived. Rate Aarav!", time: "2 min ago", read: false, emoji: "📦", link: "/orders" },
  { id: "n2", type: "runner", title: "New delivery request", body: "Samosa × 4 from Tuck Shop → Block C. ₹25 earnings.", time: "5 min ago", read: false, emoji: "🚴" },
  { id: "n3", type: "lend", title: "Borrow request accepted", body: "Priya K. accepted your Scientific Calculator request.", time: "12 min ago", read: false, emoji: "🤝", link: "/lend" },
  { id: "n4", type: "reward", title: "Badge unlocked: Speed Demon 🚀", body: "You completed 10 deliveries under 8 minutes!", time: "1 hr ago", read: true, emoji: "🏆", link: "/leaderboard" },
  { id: "n5", type: "promo", title: "Weekend special!", body: "Free delivery on all orders above ₹100 this Saturday.", time: "3 hr ago", read: true, emoji: "🎁" },
];

function mapBackendNotif(n: any, index: number): Notif {
  const typeStr = (n.type || "").toLowerCase();
  let type = "order";
  let emoji = "🔔";
  let link: string | undefined;

  if (typeStr.includes("delivery") || typeStr.includes("order")) { type = "order"; emoji = "📦"; link = "/orders"; }
  else if (typeStr.includes("lend") || typeStr.includes("item")) { type = "lend"; emoji = "🤝"; link = "/lend"; }
  else if (typeStr.includes("courier") || typeStr.includes("runner")) { type = "runner"; emoji = "🚴"; link = "/track"; }
  else if (typeStr.includes("badge") || typeStr.includes("xp") || typeStr.includes("reward")) { type = "reward"; emoji = "🏆"; link = "/leaderboard"; }

  const time = n.created_at ? formatTime(n.created_at) : "just now";

  return {
    id: n.notification_id || `n${index}`,
    type,
    title: n.message?.slice(0, 50) || "Notification",
    body: n.message || "",
    time,
    read: n.read ?? false,
    emoji,
    link,
  };
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch { return "recently"; }
}

function Notifications() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then((res) => {
        const data = (res.data.notifications || []).map(mapBackendNotif);
        setNotifs(data.length > 0 ? data : FALLBACK);
      })
      .catch(() => setNotifs(FALLBACK))
      .finally(() => setLoading(false));

    // Realtime notifications via Socket.IO
    const socket = socketService.connect();
    socket.on('notification', (data: any) => {
      const newNotif = mapBackendNotif(data, Date.now());
      setNotifs((prev) => [newNotif, ...prev]);
      toast(data.message || "New notification", { icon: "🔔" });
    });

    return () => { socket.off('notification'); };
  }, []);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    api.post('/notifications/read', { user_id: 'demo_user' }).catch(() => {});
    toast.success("All notifications marked as read");
  };

  const markRead = (id: string) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "order": return <Package className="h-4 w-4" />;
      case "lend": return <Repeat2 className="h-4 w-4" />;
      case "reward": return <Star className="h-4 w-4" />;
      case "promo": return <Gift className="h-4 w-4" />;
      case "runner": return <Bike className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const typeBg = (type: string) => {
    switch (type) {
      case "order": return "bg-primary/15 text-primary";
      case "lend": return "bg-brand/15 text-brand";
      case "reward": return "bg-warning/15 text-warning-foreground";
      case "promo": return "bg-success/15 text-success";
      case "runner": return "bg-accent text-accent-foreground";
      default: return "bg-secondary text-foreground";
    }
  };

  return (
    <MobileShell>
      <TopBar
        title="Notifications"
        right={
          unreadCount > 0 ? (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-primary transition-transform active:scale-95"
            >
              <Check className="h-3 w-3" /> Read all
            </button>
          ) : undefined
        }
      />

      <div className="px-4 pt-2 pb-6">
        {/* Unread count */}
        {unreadCount > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-primary/5 border border-primary/20 px-4 py-3">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">
              You have <span className="font-bold text-primary">{unreadCount}</span> unread notifications
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.map((n) => {
              const Wrapper = n.link ? Link : "div";
              const wrapperProps = n.link ? { to: n.link } : {};
              return (
                <Wrapper
                  key={n.id}
                  {...(wrapperProps as any)}
                  onClick={() => markRead(n.id)}
                  className={`flex gap-3 rounded-2xl border p-3.5 transition-all cursor-pointer ${
                    n.read
                      ? "border-border bg-card"
                      : "border-primary/20 bg-primary/5 shadow-sm"
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${typeBg(n.type)}`}>
                    {typeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-tight ${!n.read ? "text-foreground" : ""}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                    <p className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                      <Clock className="h-3 w-3" /> {n.time}
                    </p>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        )}
      </div>
    </MobileShell>
  );
}

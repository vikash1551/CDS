import { create } from "zustand";
import { socketService } from "@/lib/socket";

export type NotificationType = "order" | "borrow" | "community" | "courier";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  desc: string;
  time: string;
  emoji: string;
  isUrgent?: boolean;
  extraInfo?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, "id" | "time">) => void;
  removeNotification: (id: string) => void;
  initNotificationListeners: () => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => {
  let isListening = false;

  const initNotificationListeners = () => {
    if (isListening) return;
    const socket = socketService.connect();

    socket?.on("store_status_changed", (data) => {
      if (data.is_open) {
        get().addNotification({
          type: "community",
          title: "Hostel Canteen is Open! 🎉",
          desc: "The campus store is now accepting orders. Get your snacks now!",
          emoji: "🏪"
        });
      }
    });

    socket?.on("product_added", (data) => {
      get().addNotification({
        type: "community",
        title: "New Item Available!",
        desc: `${data.product.name} is now available at the Hostel Canteen.`,
        emoji: data.product.emoji || "✨"
      });
    });

    socket?.on("delivery_status", (data) => {
      get().addNotification({
        type: "order",
        title: `Order ${data.status}`,
        desc: `Your order is now ${data.status.replace("_", " ")}.`,
        emoji: "📦"
      });
    });

    isListening = true;
  };

  return {
    notifications: [],
    addNotification: (notif) => {
      const newNotif: AppNotification = {
        ...notif,
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        time: "Just now"
      };
      set((state) => ({ notifications: [newNotif, ...state.notifications] }));
    },
    removeNotification: (id) => {
      set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) }));
    },
    initNotificationListeners
  };
});

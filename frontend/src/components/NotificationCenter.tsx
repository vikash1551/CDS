import React, { useState, useEffect } from "react";
import { X, Bell, Package, Repeat2, Users, Navigation, Zap } from "lucide-react";
import { toast } from "sonner";
import { useNotificationStore } from "@/store/notificationStore";

type TabType = "All" | "Orders" | "Borrowing" | "Community" | "Courier";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { notifications, initNotificationListeners } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<TabType>("All");

  useEffect(() => {
    initNotificationListeners();
  }, [initNotificationListeners]);

  const tabs: TabType[] = ["All", "Orders", "Borrowing", "Community", "Courier"];

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "All") return true;
    if (activeTab === "Orders" && n.type === "order") return true;
    if (activeTab === "Borrowing" && n.type === "borrow") return true;
    if (activeTab === "Community" && n.type === "community") return true;
    if (activeTab === "Courier" && n.type === "courier") return true;
    return false;
  });

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-over Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-[101] w-full max-w-sm transform bg-[#FAF7F3] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E7E5E4] bg-white px-5 py-5 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
              Campus Activity <Bell className="h-5 w-5 text-[#A84B22]" fill="#A84B22" />
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Stay updated with what's happening around you.</p>
          </div>
          <button 
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white border-b border-[#E7E5E4] px-4 py-3">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex shrink-0 items-center rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  activeTab === tab
                    ? "bg-[#A84B22] text-white shadow-sm"
                    : "bg-[#F5F0EB] text-[#6B7280] hover:bg-[#E7E5E4]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n) => (
              <div 
                key={n.id} 
                className={`relative flex gap-3 rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
                  n.isUrgent ? 'border-[#A84B22]/30 animate-[pulse_3s_infinite]' : 'border-[#E7E5E4]'
                }`}
              >
                {/* Special Highlight for Urgent Requests */}
                {n.isUrgent && (
                  <div className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 shadow-sm animate-pulse" />
                )}

                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${n.isUrgent ? 'bg-[#FFF0E0]' : 'bg-[#F5F0EB]'}`}>
                  {n.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-bold line-clamp-2 ${n.isUrgent ? 'text-[#A84B22]' : 'text-[#1F2937]'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap pt-0.5">
                      {n.time}
                    </span>
                  </div>
                  
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {n.desc}
                  </p>
                  
                  {n.extraInfo && (
                    <p className="mt-1.5 text-[11px] font-semibold text-[#A84B22] flex items-center gap-1">
                      {n.type === 'courier' ? <Zap className="h-3 w-3" /> : <Navigation className="h-3 w-3" />} 
                      {n.extraInfo}
                    </p>
                  )}

                  <div className="mt-3">
                    <button 
                      onClick={() => {
                        if (n.isUrgent) onClose();
                      }}
                      className={`rounded-full px-4 py-1.5 text-xs font-bold transition-transform active:scale-95 ${
                        n.isUrgent 
                          ? 'bg-[#A84B22] text-white shadow-sm hover:bg-[#A84B22]/90' 
                          : 'border border-[#E7E5E4] bg-white text-[#1F2937] hover:bg-gray-50'
                      }`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm mb-4">
                <span className="text-4xl">🍃</span>
              </div>
              <h3 className="text-lg font-bold text-[#1F2937]">You're all caught up</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-[200px]">
                No new campus activity right now. Enjoy the peace!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

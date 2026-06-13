import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { socketService } from "@/lib/socket";
import { MerchantShell } from "@/components/MerchantShell";
import { TopBar } from "@/components/TopBar";
import { Phone, MessageCircle, Star, Navigation, Layers, Clock, Package } from "lucide-react";
import MapContainer, { type TileStyle } from "@/components/MapContainer";
import type { Map as LeafletMap } from "leaflet";

export const Route = createFileRoute("/merchant-tracking")({
  component: MerchantTracking,
});

const deliveries = [
  { id: "#231", items: "Maggi × 2, Coffee", runner: "Aarav S.", to: "Library Block", stage: 2, emoji: "🍜", eta: "4 min" },
  { id: "#229", items: "Coffee × 3", runner: "Priya K.", to: "CSE Lab 4", stage: 3, emoji: "☕", eta: "2 min" },
  { id: "#228", items: "Notes Printout", runner: "Rohan M.", to: "Admin Office", stage: 1, emoji: "🖨️", eta: "7 min" },
];

const ROUTE: [number, number][] = [
  [19.1334, 72.9133], [19.1338, 72.914], [19.1345, 72.9148], [19.1352, 72.9155],
  [19.136, 72.9158], [19.1368, 72.9162], [19.1375, 72.917], [19.138, 72.9178],
  [19.1386, 72.9185], [19.1392, 72.919], [19.1398, 72.9195],
];
const CENTER: [number, number] = [19.1365, 72.916];
const stages = ["Accepted", "Picking Up", "On The Way", "Near Dest.", "Delivered"];

function MerchantTracking() {
  const [selected, setSelected] = useState(deliveries[0]);
  const [tileStyle, setTileStyle] = useState<TileStyle>("streets");
  const [currentStage, setCurrentStage] = useState(selected.stage);
  const mapRef = useRef<LeafletMap | null>(null);
  const runnerRef = useRef<unknown>(null);

  // Animate stage progress (Simulation fallback)
  useEffect(() => {
    setCurrentStage(selected.stage);
    
    // Connect socket
    const socket = socketService.connect();
    
    const handleDeliveryStatus = (data: any) => {
      if (data.order_id === selected.id) {
        // Map backend status to 0-4 stage
        const stageMap: Record<string, number> = {
          "pending": 0, "accepted": 1, "picked_up": 2, "arriving": 3, "delivered": 4
        };
        if (stageMap[data.status] !== undefined) {
          setCurrentStage(stageMap[data.status]);
        }
      }
    };
    
    const handleLiveLocation = (data: any) => {
      if (data.order_id === selected.id || !data.order_id) { // sometimes order_id might not be strictly filtered
        if (runnerRef.current) {
          // @ts-expect-error marker setLatLng
          runnerRef.current.setLatLng([data.lat, data.lng]);
        }
      }
    };

    socket?.on('delivery_status', handleDeliveryStatus);
    socket?.on('live_location', handleLiveLocation);
    
    return () => {
      socket?.off('delivery_status', handleDeliveryStatus);
      socket?.off('live_location', handleLiveLocation);
    };
  }, [selected]);

  const handleMapReady = useCallback(async (map: LeafletMap) => {
    mapRef.current = map;
    const L = await import("leaflet");
    const bounds = L.latLngBounds(ROUTE);
    map.fitBounds(bounds, { padding: [50, 50] });

    L.polyline(ROUTE, { color: "#ef4444", weight: 4, opacity: 0.6, dashArray: "8, 12", lineCap: "round" }).addTo(map);

    const shopIcon = L.divIcon({ className: "", html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,0.2);font-size:18px">🏪</div>`, iconSize: [36, 36], iconAnchor: [18, 18] });
    L.marker(ROUTE[0], { icon: shopIcon }).addTo(map);

    const destIcon = L.divIcon({ className: "", html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:#ef4444;box-shadow:0 2px 12px rgba(239,68,68,0.4);font-size:18px;color:#fff">📍</div>`, iconSize: [36, 36], iconAnchor: [18, 18] });
    L.marker(ROUTE[ROUTE.length - 1], { icon: destIcon }).addTo(map);

    const runnerIcon = L.divIcon({
      className: "",
      html: `<div style="position:relative;width:44px;height:44px"><div style="position:absolute;inset:0;border-radius:50%;background:#ef4444;opacity:0.3;animation:pulse-ring 1.8s ease infinite"></div><div style="position:absolute;inset:6px;border-radius:50%;background:#ef4444;box-shadow:0 4px 12px rgba(239,68,68,0.4);display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid #fff">🚴</div></div>`,
      iconSize: [44, 44], iconAnchor: [22, 22],
    });
    const rm = L.marker(ROUTE[4], { icon: runnerIcon, zIndexOffset: 1000 }).addTo(map);
    runnerRef.current = rm;
  }, []);

  return (
    <MerchantShell>
      <TopBar title="Live Tracking" back={false} />

      {/* Delivery Picker */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2">
        {deliveries.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelected(d)}
            className={`shrink-0 flex items-center gap-2 rounded-2xl border px-3 py-2 text-left transition-all ${
              selected.id === d.id ? "border-red-500 bg-red-500/5 shadow-sm" : "border-border bg-card"
            }`}
          >
            <span className="text-lg">{d.emoji}</span>
            <div>
              <p className="text-[11px] font-bold">{d.id} · {d.runner}</p>
              <p className="text-[10px] text-muted-foreground">{d.to}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="relative mx-4 h-[300px] overflow-hidden rounded-2xl md:h-[400px]">
        <MapContainer center={CENTER} zoom={16} tileStyle={tileStyle} hideZoomControl className="h-full w-full" onMapReady={handleMapReady} />
        <button
          onClick={() => setTileStyle((s) => (s === "streets" ? "dark" : "streets"))}
          className="absolute right-3 top-3 z-[1000] flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-pop"
        >
          <Layers className="h-4 w-4" />
        </button>
      </div>

      {/* Delivery Sheet */}
      <div className="px-4 pt-4 pb-6">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground">{selected.id}</p>
              <p className="text-base font-bold mt-0.5">{selected.items}</p>
              <p className="text-xs text-muted-foreground mt-0.5">→ {selected.to}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-muted-foreground">ETA</p>
              <p className="text-lg font-bold text-red-500">{selected.eta}</p>
            </div>
          </div>

          {/* Stage Progress */}
          <div className="mt-4 flex items-center gap-1">
            {stages.map((s, i) => (
              <div key={s} className="flex-1 text-center">
                <div className={`h-2 rounded-full mb-1 transition-all ${currentStage >= i ? "bg-gradient-to-r from-red-500 to-rose-600" : "bg-border"}`} />
                <span className={`text-[8px] font-bold ${currentStage >= i ? "text-red-500" : "text-muted-foreground"}`}>{s}</span>
              </div>
            ))}
          </div>

          {/* Runner Card */}
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-secondary p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-xl">🧑‍🎓</span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{selected.runner}</p>
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.9 · 124 drops
              </p>
            </div>
            <button onClick={() => {}} className="flex h-9 w-9 items-center justify-center rounded-full bg-card"><MessageCircle className="h-4 w-4" /></button>
            <button onClick={() => {}} className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white"><Phone className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </MerchantShell>
  );
}

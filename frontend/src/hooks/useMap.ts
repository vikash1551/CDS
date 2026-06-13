import { useRef, useCallback } from "react";
import type { Map as LeafletMap, Marker, LatLngExpression } from "leaflet";

/**
 * Hook for common Leaflet map operations.
 *
 * Usage:
 * ```tsx
 * const { mapRef, setMapRef, addMarker, flyTo, fitBounds } = useMap();
 * <MapContainer onMapReady={setMapRef} />
 * ```
 */
export function useMap() {
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  const setMapRef = useCallback((map: LeafletMap) => {
    mapRef.current = map;
  }, []);

  const addMarker = useCallback(
    async (
      position: LatLngExpression,
      options?: { popup?: string; draggable?: boolean },
    ) => {
      const L = await import("leaflet");
      if (!mapRef.current) return null;

      const marker = L.marker(position, {
        draggable: options?.draggable,
      }).addTo(mapRef.current);

      if (options?.popup) {
        marker.bindPopup(options.popup);
      }

      markersRef.current.push(marker);
      return marker;
    },
    [],
  );

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  const flyTo = useCallback(
    (position: LatLngExpression, zoom?: number) => {
      mapRef.current?.flyTo(position, zoom ?? mapRef.current.getZoom(), {
        duration: 1.5,
      });
    },
    [],
  );

  const fitBounds = useCallback(
    async (positions: LatLngExpression[]) => {
      const L = await import("leaflet");
      if (!mapRef.current || positions.length === 0) return;
      const bounds = L.latLngBounds(positions);
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    },
    [],
  );

  return {
    mapRef,
    setMapRef,
    addMarker,
    clearMarkers,
    flyTo,
    fitBounds,
  };
}

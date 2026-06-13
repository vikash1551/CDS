import { useEffect, useRef, useState } from "react";
import type {
  Map as LeafletMap,
  LatLngExpression,
  MapOptions,
  TileLayer,
} from "leaflet";

export type TileStyle =
  | "streets"     // CartoDB Voyager — clean, colourful, Google-Maps-like
  | "light"       // CartoDB Positron — minimalist monochrome light
  | "dark"        // CartoDB Dark Matter — sleek dark mode
  | "satellite"   // Esri World Imagery
  | "watercolor"  // Stadia Watercolor — artistic / hand-drawn
  | "toner"       // Stadia Toner — high-contrast B&W
  | "osm";        // plain OpenStreetMap (fallback)

const TILE_URLS: Record<TileStyle, { url: string; attribution: string; maxZoom?: number }> = {
  streets: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20,
  },
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20,
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar, USDA, USGS, AeroGRID',
    maxZoom: 18,
  },
  watercolor: {
    url: "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia</a> &copy; <a href="https://stamen.com/">Stamen</a>',
    maxZoom: 16,
  },
  toner: {
    url: "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia</a> &copy; <a href="https://stamen.com/">Stamen</a>',
    maxZoom: 20,
  },
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
};

export interface MapContainerProps {
  /** Initial center coordinates [lat, lng] */
  center?: LatLngExpression;
  /** Initial zoom level (1-18) */
  zoom?: number;
  /** CSS class for the container div */
  className?: string;
  /** Map tile style — defaults to "streets" (CartoDB Voyager) */
  tileStyle?: TileStyle;
  /** Hide zoom +/- buttons */
  hideZoomControl?: boolean;
  /** Hide attribution text */
  hideAttribution?: boolean;
  /** Additional Leaflet map options */
  mapOptions?: Omit<MapOptions, "center" | "zoom">;
  /** Callback with the Leaflet map instance once ready */
  onMapReady?: (map: LeafletMap) => void;
  /** Children rendered inside the map container (e.g. custom overlays) */
  children?: React.ReactNode;
}

/**
 * Client-only Leaflet map with premium tile styles.
 *
 * Dynamically imports `leaflet` so it never runs during SSR.
 * Defaults to CartoDB Voyager which looks clean and modern.
 */
export default function MapContainer({
  center = [20.5937, 78.9629],
  zoom = 5,
  className = "",
  tileStyle = "streets",
  hideZoomControl = false,
  hideAttribution = false,
  mapOptions = {},
  onMapReady,
  children,
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileRef = useRef<TileLayer | null>(null);
  const [ready, setReady] = useState(false);

  // Initialise map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      // Fix default marker icons for Vite bundling
      // @ts-expect-error — patching internal Leaflet icon paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const tile = TILE_URLS[tileStyle] ?? TILE_URLS.streets;

      const map = L.map(containerRef.current, {
        center,
        zoom,
        zoomControl: !hideZoomControl,
        attributionControl: !hideAttribution,
        ...mapOptions,
      });

      const layer = L.tileLayer(tile.url, {
        attribution: tile.attribution,
        maxZoom: tile.maxZoom ?? 19,
      }).addTo(map);

      tileRef.current = layer;
      mapRef.current = map;
      setReady(true);
      onMapReady?.(map);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap tile layer when tileStyle changes
  useEffect(() => {
    if (!mapRef.current || !tileRef.current || !ready) return;

    (async () => {
      const L = await import("leaflet");
      const tile = TILE_URLS[tileStyle] ?? TILE_URLS.streets;

      tileRef.current!.remove();
      tileRef.current = L.tileLayer(tile.url, {
        attribution: tile.attribution,
        maxZoom: tile.maxZoom ?? 19,
      }).addTo(mapRef.current!);
    })();
  }, [tileStyle, ready]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ minHeight: "300px" }}
      />
      {ready && children}
    </div>
  );
}

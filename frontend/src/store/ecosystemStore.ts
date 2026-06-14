import { create } from "zustand";
import { api } from "@/lib/api";
import { socketService } from "@/lib/socket";

export interface EcosystemProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  available: boolean;
  emoji: string;
  category: string;
  popularity: number;
  eta: string;
  promotion?: string;
  shop?: string;
}

interface EcosystemState {
  isStoreOpen: boolean;
  products: EcosystemProduct[];
  fetchInitialState: () => Promise<void>;
  updateStoreStatus: (isOpen: boolean) => void;
  addProduct: (product: any) => void;
  updateProduct: (id: string, updates: any) => void;
  deleteProduct: (id: string) => void;
}

const mapCategory = (backendCat: string): string => {
  if (!backendCat) return "more";
  const cat = backendCat.toLowerCase().trim();
  if (cat.includes("food") || cat.includes("snack") || cat.includes("beverage") || cat.includes("drink")) return "food";
  if (cat.includes("electronic") || cat.includes("tech")) return "electronics";
  if (cat.includes("book") || cat.includes("note") || cat.includes("study")) return "books";
  if (cat.includes("stationery") || cat.includes("pen") || cat.includes("paper")) return "stationery";
  if (cat.includes("service") || cat.includes("repair") || cat.includes("print")) return "services";
  return "more";
};

export const useEcosystemStore = create<EcosystemState>()((set, get) => {
  let isInitialized = false;

  const initSocket = () => {
    if (isInitialized) return;
    const socket = socketService.connect();
    
    socket?.on("store_status_changed", (data) => {
      set({ isStoreOpen: data.is_open });
    });

    socket?.on("product_added", (data) => {
      const p = data.product;
      get().addProduct({
        id: p.product_id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        available: p.is_active,
        emoji: p.emoji || "📦",
        category: mapCategory(p.category),
        popularity: Math.floor(Math.random() * 100),
        eta: p.ETA || "5 min",
        promotion: p.promotion,
        shop: "Hostel Canteen"
      });
    });

    socket?.on("product_updated", (data) => {
      get().updateProduct(data.product_id, {
        name: data.updates.name,
        price: data.updates.price,
        stock: data.updates.stock,
        available: data.updates.is_active,
        emoji: data.updates.emoji,
        promotion: data.updates.promotion,
        category: data.updates.category ? mapCategory(data.updates.category) : undefined
      });
    });

    socket?.on("product_deleted", (data) => {
      get().deleteProduct(data.product_id);
    });

    isInitialized = true;
  };

  return {
    isStoreOpen: true,
    products: [],
    
    fetchInitialState: async () => {
      try {
        const [statusRes, productsRes] = await Promise.all([
          api.get("/merchant/status"),
          api.get("/merchant/products")
        ]);
        
        const mappedProducts = (productsRes.data.products || []).map((p: any) => ({
          id: p.product_id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          available: p.is_active !== false,
          emoji: p.emoji || "📦",
          category: mapCategory(p.category),
          popularity: Math.floor(Math.random() * 100),
          eta: p.ETA || "5 min",
          promotion: p.promotion,
          shop: "Hostel Canteen"
        }));

        set({ isStoreOpen: statusRes.data.is_open, products: mappedProducts });
        initSocket();
      } catch (e) {
        console.error("Failed to fetch ecosystem state", e);
      }
    },

    updateStoreStatus: (isOpen) => set({ isStoreOpen: isOpen }),
    
    addProduct: (product) => set((state) => ({ 
      products: [product, ...state.products] 
    })),
    
    updateProduct: (id, updates) => set((state) => ({
      products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
    })),
    
    deleteProduct: (id) => set((state) => ({
      products: state.products.filter(p => p.id !== id)
    }))
  };
});

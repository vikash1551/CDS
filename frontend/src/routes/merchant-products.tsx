import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { MerchantShell } from "@/components/MerchantShell";
import { TopBar } from "@/components/TopBar";
import { Plus, Search, Edit3, Trash2, TrendingUp, Package, Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/merchant-products")({
  component: MerchantProducts,
});

type MenuItem = {
  id: string; name: string; price: number; stock: number; available: boolean;
  emoji: string; category: string; popularity: number; eta: string;
};

const initialMenu: MenuItem[] = [
  { id: "m1", name: "Masala Maggi Cup", price: 35, stock: 24, available: true, emoji: "🍜", category: "snacks", popularity: 92, eta: "8 min" },
  { id: "m2", name: "Veg Sandwich", price: 40, stock: 15, available: true, emoji: "🥪", category: "snacks", popularity: 78, eta: "6 min" },
  { id: "m3", name: "Cold Coffee", price: 60, stock: 30, available: true, emoji: "🧋", category: "drinks", popularity: 88, eta: "5 min" },
  { id: "m4", name: "Water Bottle", price: 20, stock: 50, available: true, emoji: "💧", category: "drinks", popularity: 65, eta: "2 min" },
  { id: "m5", name: "Ball Pen (Blue)", price: 10, stock: 100, available: true, emoji: "✏️", category: "stationery", popularity: 45, eta: "2 min" },
  { id: "m6", name: "Notes Printout", price: 5, stock: 0, available: false, emoji: "🖨️", category: "stationery", popularity: 72, eta: "10 min" },
  { id: "m7", name: "Samosa (2 pcs)", price: 20, stock: 40, available: true, emoji: "🥟", category: "snacks", popularity: 85, eta: "4 min" },
  { id: "m8", name: "Lemon Iced Tea", price: 40, stock: 18, available: true, emoji: "🧃", category: "drinks", popularity: 60, eta: "5 min" },
];

const cats = ["all", "snacks", "drinks", "stationery"];

function MerchantProducts() {
  const [menu, setMenu] = useState<MenuItem[]>(initialMenu);
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmoji, setFormEmoji] = useState("📦");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/merchant/products");
      if (res.data.products) {
        const mapped = res.data.products.map((p: any) => ({
          id: p.product_id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          available: p.is_available,
          emoji: p.emoji || (p.category === "snacks" ? "🥟" : p.category === "drinks" ? "🧋" : "📦"),
          category: p.category || "snacks",
          popularity: Math.floor(Math.random() * 100),
          eta: "5 min"
        }));
        setMenu(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = menu
    .filter((m) => cat === "all" || m.category === cat)
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const toggleAvailability = async (id: string) => {
    const item = menu.find((m) => m.id === id);
    if (!item) return;
    
    // Optimistic update
    setMenu((prev) => prev.map((m) => (m.id === id ? { ...m, available: !m.available } : m)));
    try {
      await api.put(`/merchant/update-product/${id}`, { 
        name: item.name,
        price: Number(item.price),
        stock: Number(item.stock),
        is_available: !item.available 
      });
    } catch (err) {
      console.warn("Backend sync failed, keeping local state", err);
    }
    toast.success(item.available ? `${item.name} marked out of stock` : `${item.name} is available`);
  };

  const deleteItem = async (id: string) => {
    const item = menu.find((m) => m.id === id);
    setMenu((prev) => prev.filter((m) => m.id !== id)); // Optimistic
    try {
      await api.delete(`/merchant/delete-product/${id}`);
    } catch (err) {
      console.warn("Backend sync failed, keeping local state", err);
    }
    toast.success(`${item?.name} removed`);
  };

  const openAdd = () => { setFormName(""); setFormPrice(""); setFormStock(""); setFormEmoji("📦"); setEditItem(null); setShowAdd(true); };
  const openEdit = (item: MenuItem) => { setFormName(item.name); setFormPrice(String(item.price)); setFormStock(String(item.stock)); setFormEmoji(item.emoji); setEditItem(item); setShowAdd(true); };

  const generateEmoji = async () => {
    if (!formName.trim()) {
      toast.error("Please enter an item name first!");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await api.post("/merchant/generate-emoji", { name: formName });
      if (res.data.emoji) {
        setFormEmoji(res.data.emoji);
        toast.success(`Generated: ${res.data.emoji}`);
      }
    } catch (err) {
      toast.error("Failed to generate emoji");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveItem = async () => {
    if (!formName || !formPrice) return;
    try {
      if (editItem) {
        await api.put(`/merchant/update-product/${editItem.id}`, {
          name: formName, price: Number(formPrice), stock: Number(formStock), emoji: formEmoji
        });
      } else {
        await api.post("/merchant/add-product", {
          name: formName, price: Number(formPrice), stock: Number(formStock) || 0,
          category: "snacks", description: "", is_available: true, emoji: formEmoji
        });
      }
    } catch (err) {
      console.warn("Backend sync failed, keeping local state", err);
    }
    
    // Always update local state for a smooth UI experience
    if (editItem) {
      setMenu(prev => prev.map(m => m.id === editItem.id ? { ...m, name: formName, price: Number(formPrice), stock: Number(formStock), emoji: formEmoji } : m));
      toast.success(`${formName} updated`);
    } else {
      const newItem = { id: `m${Date.now()}`, name: formName, price: Number(formPrice), stock: Number(formStock) || 0, available: true, emoji: formEmoji, category: "snacks", popularity: 0, eta: "5 min" };
      setMenu(prev => [newItem, ...prev]);
      toast.success(`${formName} added to menu`);
    }
    
    setShowAdd(false);
  };

  return (
    <MerchantShell>
      <TopBar title="Product Menu" back={false} right={
        <button onClick={openAdd} className="flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-rose-600 px-3 py-1.5 text-[11px] font-bold text-white active:scale-95">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      } />

      <div className="px-4 pt-2 pb-6">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5 mb-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search menu items..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 mb-4">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full px-3 py-1.5 text-[11px] font-bold capitalize ${cat === c ? "bg-gradient-to-r from-red-500 to-rose-600 text-white" : "bg-secondary text-muted-foreground"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Product Cards */}
        <div className="space-y-2">
          {filtered.map((m) => (
            <div key={m.id} className={`rounded-2xl border bg-card p-3 transition-all ${!m.available ? "opacity-50 border-border" : "border-border"}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-2xl">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold line-clamp-1">{m.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">₹{m.price}</span>
                    <span>Stock: {m.stock}</span>
                    <span>ETA: {m.eta}</span>
                  </div>
                  {/* Popularity bar */}
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-600" style={{ width: `${m.popularity}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5" />{m.popularity}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-4">
                  {/* Toggle */}
                  <button onClick={() => toggleAvailability(m.id)} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${m.available ? "bg-green-500" : "bg-muted"}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${m.available ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                  </button>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => openEdit(m)} className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => deleteItem(m.id)} className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="mx-auto h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm font-semibold">No items found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-[480px] rounded-t-3xl bg-card p-5 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <h3 className="text-base font-bold mb-4">{editItem ? "Edit Item" : "Add New Item"}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Item Name</label>
                <div className="flex gap-2">
                  <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Masala Maggi" className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-rose-500" />
                  <div className="flex flex-col mt-1 w-16 relative group">
                    <input value={formEmoji} onChange={(e) => setFormEmoji(e.target.value)} className="w-full h-full rounded-xl border border-input bg-background text-center text-xl outline-none focus:border-rose-500" />
                    <button onClick={generateEmoji} disabled={isGenerating} className="absolute -top-6 -right-2 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-600 p-1.5 text-white shadow-soft transition-transform active:scale-90 hover:scale-110 disabled:opacity-50" title="Auto-generate AI Emoji">
                      {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Price (₹)</label>
                  <input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="35" className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Stock</label>
                  <input type="number" value={formStock} onChange={(e) => setFormStock(e.target.value)} placeholder="50" className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-rose-500" />
                </div>
              </div>
              <button onClick={saveItem} className="w-full rounded-xl bg-gradient-to-r from-red-500 to-rose-600 py-3 text-sm font-bold text-white active:scale-[0.98]">
                {editItem ? "Save Changes" : "Add to Menu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MerchantShell>
  );
}

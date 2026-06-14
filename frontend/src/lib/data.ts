export type Product = {
  id: string;
  name: string;
  shop: string;
  price: number;
  mrp?: number;
  unit: string;
  emoji: string;
  bg: string;
  category: string;
  eta: string;
};

export const categories = [
  { id: "food", name: "Food", emoji: "🍔", bg: "#FFF0E0" },
  { id: "electronics", name: "Electronics", emoji: "🔌", bg: "#E0EEFF" },
  { id: "books", name: "Books", emoji: "📚", bg: "#EDE0FF" },
  { id: "stationery", name: "Stationery", emoji: "✏️", bg: "#FFE0E8" },
  { id: "services", name: "Services", emoji: "🛠️", bg: "#DFFFEA" },
  { id: "more", name: "More", emoji: "🔍", bg: "#F0F0F0" },
];

export const products: Product[] = [
  { id: "p1", name: "Masala Maggi Cup", shop: "Hostel Canteen", price: 35, mrp: 40, unit: "70g", emoji: "🍜", bg: "#FFF0E0", category: "food", eta: "8 min" },
  { id: "p2", name: "Cold Coffee", shop: "Brew Hub", price: 60, mrp: 80, unit: "300ml", emoji: "🧋", bg: "#FFF0E0", category: "food", eta: "10 min" },
  { id: "p3", name: "Veg Thali", shop: "Mess 2", price: 80, unit: "1 plate", emoji: "🍛", bg: "#FFF0E0", category: "food", eta: "15 min" },
  { id: "p4", name: "Type-C Charger", shop: "Campus Tech", price: 150, mrp: 200, unit: "1 pc", emoji: "🔌", bg: "#E0EEFF", category: "electronics", eta: "12 min" },
  { id: "p5", name: "Notebook A4", shop: "Campus Store", price: 45, mrp: 60, unit: "200 pg", emoji: "📓", bg: "#FFE0E8", category: "stationery", eta: "12 min" },
  { id: "p6", name: "DBMS Textbook", shop: "Senior", price: 200, mrp: 400, unit: "1 pc", emoji: "📚", bg: "#EDE0FF", category: "books", eta: "9 min" },
  { id: "p7", name: "Choco Donut", shop: "Sweet Spot", price: 35, emoji: "🍩", unit: "1 pc", bg: "#FFF0E0", category: "food", eta: "10 min" },
  { id: "p8", name: "Printout (B&W)", shop: "Print Shop", price: 2, mrp: 3, emoji: "🖨️", unit: "1 pg", bg: "#DFFFEA", category: "services", eta: "15 min" },
  { id: "p9", name: "Pen Kit (5 pcs)", shop: "Campus Store", price: 25, mrp: 35, unit: "5 pcs", emoji: "🖊️", bg: "#FFE0E8", category: "stationery", eta: "10 min" },
  { id: "p10", name: "Scientific Calc", shop: "Tech Spot", price: 500, mrp: 650, unit: "1 pc", emoji: "🧮", bg: "#E0EEFF", category: "electronics", eta: "10 min" },
  { id: "p11", name: "File Folder", shop: "Campus Store", price: 20, mrp: 30, unit: "1 pc", emoji: "📁", bg: "#FFE0E8", category: "stationery", eta: "10 min" },
  { id: "p12", name: "Cycle Repair", shop: "Campus Garage", price: 50, mrp: 80, unit: "Basic", emoji: "🚲", bg: "#DFFFEA", category: "services", eta: "25 min" },
  { id: "p13", name: "Physics Notes", shop: "Topper", price: 10, mrp: 15, unit: "PDF", emoji: "📄", bg: "#EDE0FF", category: "books", eta: "1 min" },
];

export type LendItem = {
  id: string;
  title: string;
  by: string;
  avatar: string;
  rating: number;
  distance: string;
  pricePerHr: number;
  emoji: string;
  bg: string;
  tag: "Lend" | "Need";
  posted: string;
  status?: "online" | "offline";
};

export const lendItems: LendItem[] = [
  { id: "l1", title: "Scientific Calculator", by: "Aarav S.", avatar: "🧑‍🎓", rating: 4.8, distance: "120 m", pricePerHr: 15, emoji: "🧮", bg: "oklch(0.93 0.08 200)", tag: "Lend", posted: "2m ago", status: "online" },
  { id: "l2", title: "Need Drafter Set (urgent)", by: "Priya K.", avatar: "👩‍🎓", rating: 4.9, distance: "Block C", pricePerHr: 25, emoji: "📐", bg: "oklch(0.94 0.09 30)", tag: "Need", posted: "Just now", status: "online" },
  { id: "l3", title: "HDMI Cable 2m", by: "Rohan M.", avatar: "🧑", rating: 4.7, distance: "Library", pricePerHr: 10, emoji: "🔌", bg: "oklch(0.93 0.06 280)", tag: "Lend", posted: "8m ago", status: "online" },
  { id: "l4", title: "Lab Coat (M)", by: "Sneha R.", avatar: "👩", rating: 4.6, distance: "Hostel A", pricePerHr: 12, emoji: "🥼", bg: "oklch(0.95 0.04 240)", tag: "Lend", posted: "20m ago", status: "offline" },
  { id: "l5", title: "Need iPad for design class", by: "Kabir J.", avatar: "🧑‍💻", rating: 4.5, distance: "Studio 3", pricePerHr: 80, emoji: "🪟", bg: "oklch(0.94 0.06 320)", tag: "Need", posted: "5m ago", status: "online" },
];

export type CourierPhase = "dashboard" | "requests" | "pickup" | "tracking" | "complete";

export interface CourierProfile {
  name: string;
  gender: "male" | "female";
  rating: number;
  drops: number;
  dept: string;
  aiMatch: number;
  todayEarnings: number;
  xp: number;
  streak: number;
}

export interface DeliveryRequest {
  id: string;
  item: string;
  emoji: string;
  pickup: string;
  drop: string;
  reward: number;
  eta: number;
  urgency: "LOW" | "MEDIUM" | "HIGH";
  customer: string;
  note?: string;
}

export const COURIER: CourierProfile = {
  name: "Rahul K.",
  gender: "male",
  rating: 4.9,
  drops: 124,
  dept: "CSE 2nd yr",
  aiMatch: 94,
  todayEarnings: 240,
  xp: 1280,
  streak: 3,
};

export const MOCK_REQUESTS: DeliveryRequest[] = [
  { id: "r1", item: "Masala Maggi + Cold Coffee", emoji: "🍜", pickup: "Main Canteen", drop: "Library Block", reward: 25, eta: 5, urgency: "HIGH", customer: "Priya S.", note: "Please hurry, class in 10 min!" },
  { id: "r2", item: "Notebook + Pen Set", emoji: "📓", pickup: "Stationery Store", drop: "Hostel B-204", reward: 15, eta: 8, urgency: "LOW", customer: "Arjun M." },
  { id: "r3", item: "Sandwich + Juice", emoji: "🥪", pickup: "Café Corner", drop: "CS Lab", reward: 30, eta: 4, urgency: "MEDIUM", customer: "Neha R.", note: "Extra napkins please" },
];

export const BADGES = [
  { name: "Speed Courier", emoji: "🏃", desc: "5 deliveries under 4 min", unlocked: true },
  { name: "Campus Hero", emoji: "🦸", desc: "50+ total deliveries", unlocked: true },
  { name: "Trusted Runner", emoji: "⭐", desc: "4.8+ avg rating", unlocked: true },
  { name: "Night Owl", emoji: "🦉", desc: "10 deliveries after 8 PM", unlocked: false },
];

export const DELIVERY_HISTORY = [
  { item: "Cold Coffee x2", from: "Canteen", to: "Hostel A", earned: 20, time: "2 hrs ago", rating: 5 },
  { item: "Notebook Bundle", from: "Store", to: "Library", earned: 15, time: "4 hrs ago", rating: 4 },
  { item: "Paratha + Chai", from: "Dhaba", to: "CS Block", earned: 25, time: "Yesterday", rating: 5 },
];

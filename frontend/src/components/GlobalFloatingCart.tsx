import { Link } from "@tanstack/react-router";
import { useCartStore } from "@/lib/store";

export function GlobalFloatingCart() {
  const { items, getTotalItems, getSubtotal } = useCartStore();
  const totalItems = getTotalItems();
  const subtotal = getSubtotal();

  if (totalItems === 0) return null;

  return (
    <>
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div
        className="fixed inset-x-0 z-50 mx-auto w-[calc(100%-2rem)] max-w-[448px] sm:max-w-[600px] md:right-8 md:left-auto md:mx-0 md:w-auto md:min-w-[280px]"
        style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Link
          to="/cart"
          className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-pop"
          style={{ animation: "fade-in-up 0.3s ease-out" }}
        >
          <div className="flex flex-col">
            <span className="text-[11px] font-medium opacity-80">{totalItems} item{totalItems > 1 ? "s" : ""}</span>
            <span className="text-sm font-bold">₹{subtotal}</span>
          </div>
          <span className="rounded-xl bg-brand px-4 py-1.5 text-xs font-bold text-brand-foreground flex items-center gap-1 hover:scale-105 active:scale-95 transition-transform">
            Checkout <span className="text-base leading-none">→</span>
          </span>
        </Link>
      </div>
    </>
  );
}


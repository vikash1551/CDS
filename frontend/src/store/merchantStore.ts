import { create } from "zustand";

interface MerchantState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  totalReceived: number;
  totalAccepted: number;
  totalPending: number;
  incrementReceived: () => void;
  incrementAccepted: () => void;
  decrementPending: () => void;
  setPending: (n: number) => void;
  setTotalReceived: (n: number) => void;
  setTotalAccepted: (n: number) => void;
}

export const useMerchantStore = create<MerchantState>((set) => ({
  isOpen: true,
  setIsOpen: (isOpen) => set({ isOpen }),
  totalReceived: 7,
  totalAccepted: 5,
  totalPending: 2,
  incrementReceived: () => set((s) => ({ totalReceived: s.totalReceived + 1 })),
  incrementAccepted: () => set((s) => ({ totalAccepted: s.totalAccepted + 1, totalPending: Math.max(0, s.totalPending - 1) })),
  decrementPending: () => set((s) => ({ totalPending: Math.max(0, s.totalPending - 1) })),
  setPending: (n) => set({ totalPending: n }),
  setTotalReceived: (n) => set({ totalReceived: n }),
  setTotalAccepted: (n) => set({ totalAccepted: n }),
}));

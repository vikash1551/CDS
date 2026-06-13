import { useState, useEffect } from 'react';
import { type Product } from './data';
import { api } from './api';

export interface CartItem extends Product {
  qty: number;
}

export interface IncomingOrder {
  id: string;
  items: string[];
  earnings: number;
  exp: number;
  pickupLocation: string;
  pickupDistance: string;
  dropoffLocation: string;
  dropoffDistance: string;
  eta: string;
}

// Global State
let cartItems: CartItem[] = [];
let isOnline = false;
let incomingOrder: IncomingOrder | null = null;
let currentUser: any = null;
let authLoading: boolean = true;
let isReceivingOrder: boolean = false;
let activeOrderId: string | null = null;
let activeLendRequestId: string | null = null;
let activeOrderType: "delivery" | "lend" | null = null;
let lendActiveStep: number = 1;
let lendLenderInfo: { name: string; distance: string; rating: number } | null = null;

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

// Actions
export const cartActions = {
  addToCart: (product: Product) => {
    const existing = cartItems.find((i) => i.id === product.id);
    if (existing) {
      cartItems = cartItems.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      cartItems = [...cartItems, { ...product, qty: 1 }];
    }
    notify();
  },
  removeFromCart: (productId: string) => {
    cartItems = cartItems.filter((i) => i.id !== productId);
    notify();
  },
  updateQty: (productId: string, qty: number) => {
    if (qty <= 0) {
      cartActions.removeFromCart(productId);
      return;
    }
    cartItems = cartItems.map((i) => (i.id === productId ? { ...i, qty } : i));
    notify();
  },
  clearCart: () => {
    cartItems = [];
    notify();
  },
  getTotalItems: () => cartItems.reduce((total, item) => total + item.qty, 0),
  getSubtotal: () => cartItems.reduce((total, item) => total + item.price * item.qty, 0),
};

export const runnerActions = {
  setOnline: (status: boolean) => {
    isOnline = status;
    notify();
  },
  setIncomingOrder: (order: IncomingOrder | null) => {
    incomingOrder = order;
    notify();
  },
  setReceivingOrder: (status: boolean) => {
    isReceivingOrder = status;
    notify();
  },
  setActiveOrderId: (id: string | null) => {
    activeOrderId = id;
    if (id) activeOrderType = "delivery";
    notify();
  },
  setActiveLendRequestId: (id: string | null) => {
    activeLendRequestId = id;
    if (id) activeOrderType = "lend";
    notify();
  },
  setLendActiveStep: (step: number) => {
    lendActiveStep = step;
    notify();
  },
  setLendLenderInfo: (info: any) => {
    lendLenderInfo = info;
    notify();
  },
  clearActiveOrder: () => {
    activeOrderId = null;
    activeLendRequestId = null;
    activeOrderType = null;
    lendActiveStep = 1;
    lendLenderInfo = null;
    notify();
  }
};

export const authActions = {
  setUser: (user: any) => {
    currentUser = user;
    authLoading = false;
    notify();
  },
  setLoading: (loading: boolean) => {
    authLoading = loading;
    notify();
  },
  logout: () => {
    localStorage.removeItem("auth_token");
    currentUser = null;
    notify();
  },
  fetchUser: async () => {
    authActions.setLoading(true);
    try {
      const res = await api.get('/auth/me'); // Assuming an endpoint exists, or decode token
      authActions.setUser(res.data.user);
    } catch {
      authActions.setUser(null);
    }
  }
};

// Hooks
export function useCartStore() {
  const [items, setItems] = useState(cartItems);

  useEffect(() => {
    const update = () => setItems([...cartItems]);
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  return {
    items,
    ...cartActions,
  };
}

export function useRunnerStore() {
  const [online, setOnlineState] = useState(isOnline);
  const [order, setOrderState] = useState(incomingOrder);
  const [receiving, setReceivingState] = useState(isReceivingOrder);
  const [activeOrder, setActiveOrderState] = useState(activeOrderId);
  const [activeLendReq, setActiveLendReqState] = useState(activeLendRequestId);
  const [orderType, setOrderTypeState] = useState(activeOrderType);
  const [lActiveStep, setLActiveStepState] = useState(lendActiveStep);
  const [lLenderInfo, setLLenderInfoState] = useState(lendLenderInfo);

  useEffect(() => {
    const update = () => {
      setOnlineState(isOnline);
      setOrderState(incomingOrder);
      setReceivingState(isReceivingOrder);
      setActiveOrderState(activeOrderId);
      setActiveLendReqState(activeLendRequestId);
      setOrderTypeState(activeOrderType);
      setLActiveStepState(lendActiveStep);
      setLLenderInfoState(lendLenderInfo);
    };
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  return {
    isOnline: online,
    incomingOrder: order,
    isReceivingOrder: receiving,
    activeOrderId: activeOrder,
    activeLendRequestId: activeLendReq,
    activeOrderType: orderType,
    lendActiveStep: lActiveStep,
    lendLenderInfo: lLenderInfo,
    ...runnerActions,
  };
}

export function useAuth() {
  const [user, setUser] = useState(currentUser);
  const [loading, setLoading] = useState(authLoading);

  useEffect(() => {
    const update = () => {
      setUser(currentUser);
      setLoading(authLoading);
    };
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  return {
    user,
    loading,
    ...authActions,
  };
}

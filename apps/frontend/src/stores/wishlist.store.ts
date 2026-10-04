import { create } from 'zustand';
import type { ProductItem } from '@/lib/api';

const STORAGE_KEY = 'rajkanwari-wishlist';
const ALT_STORAGE_KEY = 'shikkis-wishlist';

interface WishlistState {
  items: ProductItem[];
  pulseBadge: boolean;

  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: ProductItem) => void;
  addItem: (product: ProductItem) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  totalItems: number;
}

function loadInitialWishlist(): ProductItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(ALT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWishlist(items: ProductItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(items);
    localStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(ALT_STORAGE_KEY, serialized);
  } catch {
    // Ignore storage quota errors
  }
}

export const useWishlistStore = create<WishlistState>((set, get) => {
  const initialItems = loadInitialWishlist();

  return {
    items: initialItems,
    pulseBadge: false,
    totalItems: initialItems.length,

    isInWishlist: (productId: string) => {
      return get().items.some((item) => item.id === productId);
    },

    toggleWishlist: (product: ProductItem) => {
      const { items, isInWishlist } = get();
      if (isInWishlist(product.id)) {
        const nextItems = items.filter((item) => item.id !== product.id);
        saveWishlist(nextItems);
        set({
          items: nextItems,
          totalItems: nextItems.length,
        });
      } else {
        const nextItems = [product, ...items];
        saveWishlist(nextItems);
        set({
          items: nextItems,
          totalItems: nextItems.length,
          pulseBadge: true,
        });
        setTimeout(() => set({ pulseBadge: false }), 800);
      }
    },

    addItem: (product: ProductItem) => {
      const { items, isInWishlist } = get();
      if (!isInWishlist(product.id)) {
        const nextItems = [product, ...items];
        saveWishlist(nextItems);
        set({
          items: nextItems,
          totalItems: nextItems.length,
          pulseBadge: true,
        });
        setTimeout(() => set({ pulseBadge: false }), 800);
      }
    },

    removeItem: (productId: string) => {
      const { items } = get();
      const nextItems = items.filter((item) => item.id !== productId);
      saveWishlist(nextItems);
      set({
        items: nextItems,
        totalItems: nextItems.length,
      });
    },

    clearWishlist: () => {
      saveWishlist([]);
      set({
        items: [],
        totalItems: 0,
      });
    },
  };
});

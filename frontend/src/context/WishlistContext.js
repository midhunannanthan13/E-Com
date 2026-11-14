import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'shopsphere_wishlist';

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toast = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore storage errors
    }
  }, [wishlist]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some((item) => item.id === productId);
  }, [wishlist]);

  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        toast(`Removed “${product.name}” from your Wishlist`, 'info');
        return prev.filter((item) => item.id !== product.id);
      } else {
        toast(`Added “${product.name}” to your Wishlist ❤️`, 'success');
        return [...prev, product];
      }
    });
  }, [toast]);

  const removeFromWishlist = useCallback((productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const value = {
    wishlist,
    wishlistCount: wishlist.length,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}

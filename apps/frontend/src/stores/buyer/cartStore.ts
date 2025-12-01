import {create} from "zustand";
import type {CartItem, CartStore} from "~/props/stores/cartStore.props";

export const useCartStore = create<CartStore>((set) => ({
  cartItems: [],
  fetchCart: async () => {
    try {
      const res = await fetch("/api/buyer/cart");
      const data: CartItem[] = await res.json();
      set({cartItems: data});
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  },
  addToCart: async (productId: string) => {
    try {
      await fetch("/api/buyer/cart", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({productId}),
      });
      await set((state) => ({
        cartItems: [...state.cartItems, {productId, quantity: 1}],
      }));
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  },
}));

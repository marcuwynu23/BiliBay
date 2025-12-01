// --- Cart Types ---
export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartStore {
  cartItems: CartItem[];
  fetchCart: () => Promise<void>;
  addToCart: (productId: string) => Promise<void>;
}

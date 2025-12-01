import {create} from "zustand";
import type {Product, ProductStore} from "~/props/stores/productStore.props";

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  fetchProducts: async () => {
    try {
      const res = await fetch("/api/seller/products", {
        headers: {Authorization: `Bearer ${localStorage.getItem("token")}`},
      });
      const data: Product[] = await res.json();
      set({products: data});
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  },
  addProduct: async (product: Partial<Product>) => {
    try {
      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(product),
      });
      const newProduct: Product = await res.json();
      set((state) => ({products: [...state.products, newProduct]}));
    } catch (err) {
      console.error("Failed to add product:", err);
    }
  },
}));

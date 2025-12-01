// --- Product Types ---
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: "available" | "unavailable";
  isInCart: boolean;
  seller: string;
}

export interface ProductStore {
  products: Product[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: Partial<Product>) => Promise<void>;
}

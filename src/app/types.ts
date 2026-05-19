// src/app/types.ts
export interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string; // The backend might use something else, we fallback
  theme: string;
  popularity: number;
  description: string;
  stock: number;
  images: string[];
  layout: string;
  profile: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// src/app/types.ts

// Mirrors backend enums exactly
export type ProductTheme = "COLORFUL" | "RGB" | "MINIMAL" | "RETRO" | "PASTEL" | "DARK";
export type LayoutType = "LAYOUT_60" | "LAYOUT_65" | "LAYOUT_75" | "TKL" | "FULL" | "ISO" | "ANSI" | "CUSTOM";
export type KeyProfile = "CHERRY" | "OEM" | "SA" | "DSA" | "XDA" | "MT3";
export type ProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

// Matches backend ProductResponse fields
export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  images: string[];
  status: ProductStatus;
  createdAt?: string;
  theme: ProductTheme;
  layoutType: LayoutType;
  keyProfile: KeyProfile;
  // Computed aliases for component compatibility
  image: string;   // = images[0]
  stock: number;   // = stockQuantity
  layout: string;  // = layoutType display string
  profile: string; // = keyProfile display string
  popularity: number; // placeholder (no backend field yet)
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AiRecommendation {
  productId: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  theme: string;
  layoutType: string;
  keyProfile: string;
  averageRating: number | null;
  reason: string;
}

export interface AiChatResponse {
  conversationId: number;
  reply: string;
  recommendations: AiRecommendation[];
  followUpQuestions: string[];
  aiProviderAvailable: boolean;
}

export interface AiChatRequest {
  conversationId?: number | null;
  message: string;
  maxRecommendations?: number;
  minBudget?: number;
  maxBudget?: number;
}


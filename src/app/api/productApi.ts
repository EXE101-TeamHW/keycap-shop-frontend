import axiosClient from './axiosClient';
import { Product, LayoutType, KeyProfile, ProductTheme } from '../types';

// Maps backend enum values to human-readable display strings
const LAYOUT_DISPLAY: Record<LayoutType, string> = {
  LAYOUT_60: "60%", LAYOUT_65: "65%", LAYOUT_75: "75%",
  TKL: "TKL", FULL: "FULL", ISO: "ISO", ANSI: "ANSI", CUSTOM: "Custom",
};
const PROFILE_DISPLAY: Record<KeyProfile, string> = {
  CHERRY: "Cherry", OEM: "OEM", SA: "SA", DSA: "DSA", XDA: "XDA", MT3: "MT3",
};
const THEME_DISPLAY: Record<ProductTheme, string> = {
  COLORFUL: "Colorful", RGB: "RGB", MINIMAL: "Minimal",
  RETRO: "Retro", PASTEL: "Pastel", DARK: "Dark",
};

// Normalize backend ProductResponse → frontend Product (fills computed aliases)
export function mapProduct(raw: any): Product {
  const images: string[] = Array.isArray(raw.images) ? raw.images : [];
  return {
    ...raw,
    images,
    image: images[0] || "",
    stock: raw.stockQuantity ?? 0,
    layout: LAYOUT_DISPLAY[raw.layoutType as LayoutType] || raw.layoutType || "",
    profile: PROFILE_DISPLAY[raw.keyProfile as KeyProfile] || raw.keyProfile || "",
    popularity: 0, // backend doesn't expose this yet
  };
}

export const productApi = {
  getAll: (): Promise<{ data: Product[] }> =>
    axiosClient.get('/products').then((res: any) => ({
      ...res,
      data: Array.isArray(res.data) ? res.data.map(mapProduct) : [],
    })),
  getById: (id: string): Promise<{ data: Product }> =>
    axiosClient.get(`/products/${id}`).then((res: any) => ({
      ...res,
      data: res.data ? mapProduct(res.data) : null,
    })),
};

// Display label helpers (re-exported so AdminPanel can use them)
export { LAYOUT_DISPLAY, PROFILE_DISPLAY, THEME_DISPLAY };


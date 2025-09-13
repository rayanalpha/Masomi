export type Material = "yellow" | "rose" | "white";

export type Karat = 14 | 18 | 21 | 22 | 24;

export type StoneType = "diamond" | "emerald" | "ruby" | "sapphire" | "zircon" | "none";

export interface Stone {
  type: StoneType;
  carat?: number; // سنگ‌ها (اگر داشته باشد)
  count?: number;
}

export interface Product {
  id: string;
  slug: string;
  sku?: string;
  title: string;
  category: string; // انگشتر، دستبند، گردنبند، گوشواره، نیم‌ست، ...
  collection?: string; // کالکشن‌ها مثل Classic، Modern، Bridal
  tags?: string[];
  material: Material;
  karat: Karat;
  weight?: number; // گرم
  gender?: "women" | "men" | "unisex";
  stones?: Stone[];
  description?: string;
  heroImage: string; // مسیر در /public
  images?: string[]; // گالری
  available?: boolean;
  priority?: number; // برای مرتب‌سازی سفارشی
  createdAt?: string;
}

export interface CatalogFilters {
  q?: string;
  categories?: string[];
  materials?: Material[];
  karats?: Karat[];
  hasStone?: boolean;
  weightMin?: number;
  weightMax?: number;
}

export interface Facets {
  categories: Record<string, number>;
  materials: Record<Material, number>;
  karats: Record<Karat, number>;
  stones: Record<Exclude<StoneType, "none">, number>;
}


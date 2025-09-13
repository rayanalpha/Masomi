import Fuse from "fuse.js";
import { Product, CatalogFilters, Facets, Material, Karat, StoneType } from "@/lib/types/product";

// Mock catalog data (placeholders). Replace with CMS (Sanity) later.
export const allProducts: Product[] = [
  {
    id: "p-aurora-ring",
    slug: "aurora-ring",
    sku: "RNG-AUR-001",
    title: "انگشتر آرورا",
    category: "انگشتر",
    collection: "Classic",
    tags: ["مینیمال", "زنانه", "خاص"],
    material: "yellow",
    karat: 18,
    weight: 5.4,
    gender: "women",
    stones: [{ type: "diamond", carat: 0.2, count: 1 }],
    description: "انگشتر طلای ۱۸ با نگین الماس تک‌سنگ، طراحی ظریف برای استفاده روزمره و مهمانی.",
    heroImage: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    available: true,
    priority: 10,
    createdAt: "2024-07-12",
  },
  {
    id: "p-royale-necklace",
    slug: "royale-necklace",
    sku: "NCK-ROY-002",
    title: "گردنبند رویال",
    category: "گردنبند",
    collection: "Royal",
    tags: ["سنگ زمرد", "لوکس"],
    material: "yellow",
    karat: 18,
    weight: 12.8,
    gender: "women",
    stones: [{ type: "emerald", carat: 1.1, count: 1 }],
    description: "گردنبند لوکس با سنگ زمرد طبیعی و تراش بیضی.",
    heroImage: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    available: true,
    priority: 9,
    createdAt: "2024-06-03",
  },
  {
    id: "p-helix-bracelet",
    slug: "helix-bracelet",
    sku: "BRC-HEL-003",
    title: "دستبند هِلیکس",
    category: "دستبند",
    collection: "Modern",
    tags: ["مدرن", "مردانه"],
    material: "white",
    karat: 18,
    weight: 16.2,
    gender: "men",
    stones: [{ type: "none" }],
    description: "دستبند مردانه با طرح مارپیچ و پرداخت مات و براق.",
    heroImage: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    available: true,
    priority: 8,
    createdAt: "2024-04-22",
  },
  {
    id: "p-venus-earrings",
    slug: "venus-earrings",
    sku: "EAR-VEN-004",
    title: "گوشواره ونوس",
    category: "گوشواره",
    collection: "Bridal",
    tags: ["عروس", "درخشان"],
    material: "rose",
    karat: 18,
    weight: 7.5,
    gender: "women",
    stones: [{ type: "zircon", count: 24 }],
    description: "گوشواره طلا رزگلد با نگین‌های زیرکن، مناسب برای مجالس رسمی.",
    heroImage: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    available: true,
    priority: 7,
    createdAt: "2024-03-15",
  },
  {
    id: "p-zenith-set",
    slug: "zenith-set",
    sku: "SET-ZEN-005",
    title: "نیم‌ست زِنیت",
    category: "نیم‌ست",
    collection: "Signature",
    tags: ["مینیمال", "پرفروش"],
    material: "yellow",
    karat: 18,
    weight: 21.0,
    gender: "women",
    stones: [{ type: "diamond", carat: 0.5, count: 12 }],
    description: "نیم‌ست کلاسیک شامل گردنبند و گوشواره با ظرافت مثال‌زدنی.",
    heroImage: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    available: true,
    priority: 10,
    createdAt: "2024-08-01",
  },
  {
    id: "p-cuff-urban",
    slug: "urban-cuff",
    sku: "BRC-URB-006",
    title: "کاف اوربان",
    category: "دستبند",
    collection: "Urban",
    tags: ["یونیسکس", "معاصر"],
    material: "yellow",
    karat: 21,
    weight: 14.3,
    gender: "unisex",
    stones: [{ type: "none" }],
    description: "دستبند کاف یونیسکس با خطوط تمیز و پرداخت ساتن.",
    heroImage: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    available: false,
    priority: 6,
    createdAt: "2024-02-10",
  },
  {
    id: "p-heritage-ring",
    slug: "heritage-ring",
    sku: "RNG-HER-007",
    title: "انگشتر هریتیج",
    category: "انگشتر",
    collection: "Heritage",
    tags: ["دستی", "طرح سنتی"],
    material: "yellow",
    karat: 22,
    weight: 9.1,
    gender: "women",
    stones: [{ type: "ruby", carat: 0.6, count: 1 }],
    description: "انگشتر دست‌ساز با سنگ یاقوت و نقوش الهام‌گرفته از معماری ایرانی.",
    heroImage: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    available: true,
    priority: 9,
    createdAt: "2024-05-09",
  },
  {
    id: "p-orbit-necklace",
    slug: "orbit-necklace",
    sku: "NCK-ORB-008",
    title: "گردنبند اوربیت",
    category: "گردنبند",
    collection: "Modern",
    tags: ["مدرن", "مینیمال"],
    material: "white",
    karat: 18,
    weight: 11.2,
    gender: "women",
    stones: [{ type: "none" }],
    description: "گردنبند مدرن با حلقه‌های هم‌مرکز و جلوه مینیمال.",
    heroImage: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    available: true,
    priority: 6,
    createdAt: "2024-01-28",
  },
  {
    id: "p-nova-earrings",
    slug: "nova-earrings",
    sku: "EAR-NOV-009",
    title: "گوشواره نُوا",
    category: "گوشواره",
    collection: "Classic",
    tags: ["روزمره"],
    material: "rose",
    karat: 18,
    weight: 4.8,
    gender: "women",
    stones: [{ type: "zircon", count: 8 }],
    description: "گوشواره میخی سبک با درخشش دلربا.",
    heroImage: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    available: true,
    priority: 5,
    createdAt: "2024-09-02",
  },
  {
    id: "p-atlas-chain",
    slug: "atlas-chain",
    sku: "NCK-ATL-010",
    title: "زنجیر اطلس",
    category: "گردنبند",
    collection: "Essentials",
    tags: ["اسنشیال", "یونیسکس"],
    material: "yellow",
    karat: 18,
    weight: 18.6,
    gender: "unisex",
    stones: [{ type: "none" }],
    description: "زنجیر طلای ساده و پرکاربرد برای هر موقعیت.",
    heroImage: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    available: true,
    priority: 7,
    createdAt: "2024-07-30",
  },
  {
    id: "p-luna-bracelet",
    slug: "luna-bracelet",
    sku: "BRC-LUN-011",
    title: "دستبند لونا",
    category: "دستبند",
    collection: "Classic",
    tags: ["زنانه", "ظریف"],
    material: "yellow",
    karat: 18,
    weight: 6.2,
    gender: "women",
    stones: [{ type: "none" }],
    description: "دستبند ظریف با جلوه زنانه و کلاسیک.",
    heroImage: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    available: true,
    priority: 6,
    createdAt: "2024-11-10",
  },
  {
    id: "p-orion-set",
    slug: "orion-set",
    sku: "SET-ORI-012",
    title: "نیم‌ست اُریون",
    category: "نیم‌ست",
    collection: "Bridal",
    tags: ["عروس", "درخشان", "خاص"],
    material: "white",
    karat: 18,
    weight: 24.0,
    gender: "women",
    stones: [{ type: "diamond", carat: 0.8, count: 18 }],
    description: "نیم‌ست درخشان مناسب مراسم عروسی با درخشش قابل‌توجه.",
    heroImage: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    available: true,
    priority: 10,
    createdAt: "2024-12-18",
  },
];

const fuse = new Fuse(allProducts, {
  includeScore: false,
  threshold: 0.35,
  shouldSort: true,
  ignoreLocation: true,
  keys: [
    { name: "title", weight: 0.6 },
    { name: "tags", weight: 0.3 },
    { name: "category", weight: 0.1 },
  ],
});

export function getAllProducts() {
  return allProducts.slice().sort(sorter);
}

export function getProductBySlug(slug: string) {
  return allProducts.find((p) => p.slug === slug) || null;
}

function sorter(a: Product, b: Product) {
  const pa = a.priority ?? 0;
  const pb = b.priority ?? 0;
  if (pa !== pb) return pb - pa;
  const da = a.createdAt ? Date.parse(a.createdAt) : 0;
  const db = b.createdAt ? Date.parse(b.createdAt) : 0;
  return db - da;
}

export function computeFacets(products: Product[]): Facets {
  const categories: Record<string, number> = {};
  const materials: Record<Material, number> = { yellow: 0, rose: 0, white: 0 };
  const karats: Record<Karat, number> = { 14: 0, 18: 0, 21: 0, 22: 0, 24: 0 };
  const stones: Record<Exclude<StoneType, "none">, number> = {
    diamond: 0,
    emerald: 0,
    ruby: 0,
    sapphire: 0,
    zircon: 0,
  };
  for (const p of products) {
    categories[p.category] = (categories[p.category] ?? 0) + 1;
    materials[p.material] += 1;
    karats[p.karat] += 1;
    for (const s of p.stones ?? []) {
      if (s.type !== "none") stones[s.type] += 1;
    }
  }
  return { categories, materials, karats, stones };
}

export function filterProducts(filters: CatalogFilters) {
  let base = getAllProducts();

  // Text search
  if (filters.q && filters.q.trim()) {
    const res = fuse.search(filters.q.trim()).map((r) => r.item);
    base = res;
  }

  // Facets
  if (filters.categories?.length) {
    base = base.filter((p) => filters.categories!.includes(p.category));
  }
  if (filters.materials?.length) {
    base = base.filter((p) => filters.materials!.includes(p.material));
  }
  if (filters.karats?.length) {
    base = base.filter((p) => filters.karats!.includes(p.karat));
  }
  if (filters.hasStone != null) {
    base = base.filter((p) => (filters.hasStone ? (p.stones?.[0]?.type ?? "none") !== "none" : (p.stones?.[0]?.type ?? "none") === "none"));
  }
  if (typeof filters.weightMin === "number") {
    base = base.filter((p) => (p.weight ?? 0) >= (filters.weightMin as number));
  }
  if (typeof filters.weightMax === "number") {
    base = base.filter((p) => (p.weight ?? Infinity) <= (filters.weightMax as number));
  }

  const facets = computeFacets(base);
  return { items: base, facets };
}


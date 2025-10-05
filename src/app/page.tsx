import Link from "next/link";
import { fetchProducts } from "@/lib/server-data";
import ProductRail from "@/components/home/ProductRail";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PriceTicker from "@/components/shared/PriceTicker";
import { getSliderImageUrl } from "@/lib/image-utils";

// Disable caching for serverless
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  return (
    <div>
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[var(--gold-500)]/10 blur-3xl" />
          <div className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-[var(--gold-400)]/10 blur-3xl" />
          {/* particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute h-1.5 w-1.5 rounded-full bg-[var(--gold-500)]/60 blur-[1px]"
              style={{
                right: `${Math.random()*100}%`,
                top: `${Math.random()*100}%`,
                animation: `float ${8 + Math.random()*6}s ease-in-out ${Math.random()*5}s infinite alternate`,
                opacity: .5 + Math.random()*0.5
              }} />
          ))}
        </div>
        <div className="container relative">
          <div className="text-center mb-6">
            <h1 className="lux-h1">
              <span className="text-gold-gradient">گالری معصومی</span>
            </h1>
            <p className="text-gold-400 font-medium text-lg mt-2">مجموعه‌ای از بهترین طلا و جواهرات</p>
          </div>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-foreground/80">
            با بیش از دو دهه تجربه در زمینه طلا و جواهرات، گالری معصومی ارائه‌دهنده بهترین و باکیفیت‌ترین محصولات طلا و جواهرات است. مجموعه‌ای منتخب از طلا و جواهرات لوکس — نمایش هنرمندانه، بدون فروش آنلاین.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 items-center">
            <Link href="/catalog" className="rounded-full bg-[var(--gold-500)] text-[var(--color-brand-foreground)] px-5 py-2 text-sm font-semibold shadow hover:opacity-95 transition">
              مشاهده کاتالوگ
            </Link>
            <Link href="/about" className="rounded-full border border-white/15 px-5 py-2 text-sm hover:border-white/25 transition">
              درباره ما
            </Link>
            <form action="/catalog" className="ms-auto flex items-center gap-2 text-sm">
              <label htmlFor="cat" className="text-foreground/70">انتخاب دسته:</label>
              <select id="cat" name="category" className="rounded-md border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-brand">
                <option value="">همه</option>
                <option value="rings">انگشتر</option>
                <option value="necklaces">گردنبند</option>
                <option value="bracelets">دستبند</option>
                <option value="earrings">گوشواره</option>
                <option value="sets">نیم‌ست</option>
              </select>
              <button className="rounded-md border border-white/15 px-3 py-2 hover:border-white/25">اعمال</button>
            </form>
          </div>
          {/* Product rail: 10 random items, looping */}
          {await (async () => {
            try {
              // Use serverless-safe data fetching
              const products = await fetchProducts({
                status: 'PUBLISHED',
                visibility: 'PUBLIC',
                take: 100
              });
              
              const pool = await Promise.all(
                products
                  .filter((p) => p.images.length)
                  .map(async (p) => ({
                    slug: p.slug,
                    name: p.name,
                    image: await getSliderImageUrl(p.images[0].url),
                  }))
              );
              
              // Shuffle and take maximum 8 products for slider
              for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
              }
              const sample = pool.slice(0, 8); // حداکثر 8 محصول
              if (!sample.length) return null;
              return <ProductRail items={sample} />;
            } catch (e) {
              console.error("HOME_RAIL_DB_ERROR", e);
              return null;
            }
          })()}
        </div>
      </section>
      {/* Price Ticker Section */}
      <section className="py-16 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <PriceTicker />
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts />
    </div>
  );
}

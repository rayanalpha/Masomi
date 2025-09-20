import Link from "next/link";
import { fetchProducts } from "@/lib/server-data";
import ProductRail from "@/components/home/ProductRail";

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
          <h1 className="lux-h1">
            <span className="text-gold-gradient">گالری طلا لوکس</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-foreground/80">
            ویترین آنلاین مجموعه‌ای منتخب از طلا و جواهرات لوکس — نمایش هنرمندانه، بدون فروش آنلاین.
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
              
              const pool = products
                .filter((p) => p.images.length)
                .map((p) => ({
                  slug: p.slug,
                  name: p.name,
                  image: p.images[0].url.startsWith("/uploads/") ? p.images[0].url.replace("/uploads/", "/uploads/_thumbs/").replace(/\.[^.]+$/, ".jpg") : p.images[0].url,
                }));
              // Shuffle and take 10
              for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
              }
              const sample = pool.slice(0, 10);
              if (!sample.length) return null;
              return <ProductRail items={sample} />;
            } catch (e) {
              console.error("HOME_RAIL_DB_ERROR", e);
              return null;
            }
          })()}
        </div>
      </section>
      <section className="py-16">
        <div className="container">
          <h2 className="text-xl font-bold mb-6">کالکشن‌های برجسته</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Classic", href: "/catalog?category=انگشتر" },
              { title: "Modern", href: "/catalog?category=دستبند" },
              { title: "Bridal", href: "/catalog?category=نیم‌ست" },
            ].map((c) => (
              <Link key={c.title} href={c.href} className="group block rounded-2xl border-gold p-6 shadow-elegant hover:shadow-elegant-lg transition">
                <div className="lux-h3">{c.title}</div>
                <div className="mt-2 text-sm text-foreground/70">مشاهده محصولات کالکشن {c.title}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

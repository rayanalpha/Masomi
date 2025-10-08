import Link from "next/link";
import { fetchProducts } from "@/lib/server-data";
import ProductRail from "@/components/home/ProductRail";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import LivePrices from "@/components/home/LivePrices";
import { getSliderImageUrl } from "@/lib/image-utils";

// Disable caching for serverless
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  return (
    <div>
      <section className="relative overflow-hidden py-24 min-h-[80vh] flex items-center">
        {/* Enhanced Luxury Background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Luxury gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold-900)]/40 via-black/60 to-[var(--gold-800)]/30" />
          
          {/* Luxury geometric patterns */}
          <div className="absolute top-20 left-20 w-96 h-96 border border-[var(--gold-500)]/10 rounded-full animate-luxury-spin-slow" />
          <div className="absolute bottom-20 right-20 w-72 h-72 border border-[var(--gold-400)]/10 rounded-full animate-luxury-spin-reverse" />
          
          {/* Enhanced blur effects */}
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[var(--gold-500)]/20 blur-3xl animate-luxury-pulse" />
          <div className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-[var(--gold-400)]/20 blur-3xl animate-luxury-pulse-delay" />
          
          {/* Enhanced particles */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="absolute h-1.5 w-1.5 rounded-full bg-[var(--gold-500)]/80 blur-[1px] animate-luxury-float"
              style={{
                right: `${Math.random()*100}%`,
                top: `${Math.random()*100}%`,
                animation: `luxury-float ${8 + Math.random()*6}s ease-in-out ${Math.random()*5}s infinite alternate`,
                opacity: .6 + Math.random()*0.4,
                boxShadow: '0 0 4px var(--gold-400)'
              }} />
          ))}
          
          {/* Parallax background pattern */}
          <div className="absolute inset-0 opacity-5 animate-luxury-slide" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4af37' fill-opacity='0.4'%3E%3Cpath d='m20 20 20-20v20zm0 0v20l-20-20z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container relative z-10">
          <div className="text-center mb-8 animate-luxury-fade-in">
            <h1 className="lux-h1 animate-luxury-title-reveal">
              <span className="text-gold-gradient relative">
                گالری معصومی
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--gold-500)]/20 to-[var(--gold-400)]/20 blur-lg -z-10 animate-luxury-glow" />
              </span>
            </h1>
            <p className="text-gold-400 font-medium text-xl mt-4 animate-luxury-subtitle-reveal">
              مجموعه‌ای از بهترین طلا و جواهرات لوکس
            </p>
          </div>
          
          <p className="mt-6 max-w-3xl mx-auto text-center text-base md:text-lg text-foreground/90 leading-relaxed animate-luxury-description-reveal">
            با بیش از دو دهه تجربه در زمینه طلا و جواهرات، گالری معصومی ارائه‌دهنده بهترین و باکیفیت‌ترین محصولات طلا و جواهرات است. مجموعه‌ای منتخب از طلا و جواهرات لوکس — نمایش هنرمندانه، بدون فروش آنلاین.
          </p>
          
          <div className="mt-10 flex flex-wrap gap-4 items-center justify-center animate-luxury-cta-reveal">
            <Link href="/catalog" className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-600)] text-black px-8 py-3 text-sm font-bold shadow-luxury hover:shadow-luxury-xl transform hover:scale-105 transition-all duration-300">
              <span className="relative z-10">مشاهده کاتالوگ</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--gold-400)] to-[var(--gold-500)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            
            <Link href="/about" className="group relative overflow-hidden rounded-full border-2 border-[var(--gold-500)]/50 px-8 py-3 text-sm font-semibold text-[var(--gold-100)] hover:border-[var(--gold-400)] hover:text-[var(--gold-400)] hover:bg-[var(--gold-500)]/10 transform hover:scale-105 transition-all duration-300">
              <span className="relative z-10">درباره ما</span>
              <div className="absolute inset-0 bg-[var(--gold-500)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
          

          {/* Live Prices Section */}
          <div className="mt-8">
            <LivePrices />
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
                    price: p.price,
                    categories: p.categories,
                    isSpecial: !!(p.stock && p.stock < 5), // محصولاتی با موجودی کم را "ویژه" در نظر بگیریم
                    isNew: new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // محصولات جدیدتر از 30 روز
                  }))
              );
              
              // Shuffle and take maximum 12 products for better infinite scroll
              for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
              }
              const sample = pool.slice(0, Math.min(12, pool.length)); // حداکثر 12 محصول یا همه محصولات موجود
              if (!sample.length) return null;
              return <ProductRail items={sample} />;
            } catch (e) {
              console.error("HOME_RAIL_DB_ERROR", e);
              return null;
            }
          })()}
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts />
    </div>
  );
}

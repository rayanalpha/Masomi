import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types/product";
import TiltCard from "@/components/ui/TiltCard";

export function ProductCard({ p }: { p: Product }) {
  return (
    <TiltCard className="glow sheen-on-hover">
      <Link
        href={`/product/${p.slug}`}
        className="group block overflow-hidden rounded-2xl border-gold shadow-elegant hover:shadow-elegant-lg transition-shadow"
      >
        <div className="relative aspect-[4/3]">
          <Image
            src={p.heroImage}
            alt={p.title}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            priority={false}
          />
          {p.available === false && (
            <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white shadow-inset-soft">ناموجود</span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-bold tracking-tight text-foreground/95">
              {p.title}
            </h3>
            <span className="text-xs rounded-full border-gold px-2 py-0.5 text-[var(--gold-500)]">
              {p.karat} عیار
            </span>
          </div>
          <div className="mt-1 text-xs text-foreground/70">
            {p.category} • {materialLabel(p.material)}
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}

function materialLabel(m: Product["material"]) {
  switch (m) {
    case "yellow":
      return "طلای زرد";
    case "rose":
      return "طلای رزگلد";
    case "white":
      return "طلای سفید";
  }
}


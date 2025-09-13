import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="container py-8 md:py-12 grid gap-8 md:grid-cols-3">
        <div className="space-y-3">
          <div className="text-xl font-extrabold tracking-tight">
            <span className="text-gold-gradient">
              گالری طلا لوکس
            </span>
          </div>
          <p className="text-sm text-foreground/70 leading-7">
            نمایش مجموعه‌ای از طلا و جواهرات خاص و دست‌چین‌شده؛ تمرکز بر کیفیت، طراحی و تجربه بصری لوکس.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-3 text-sm">
          <Link className="hover:underline" href="/catalog">کاتالوگ</Link>
          <Link className="hover:underline" href="/collections">کالکشن‌ها</Link>
          <Link className="hover:underline" href="/about">درباره ما</Link>
          <Link className="hover:underline" href="/contact">تماس</Link>
        </nav>
        <div className="text-sm text-foreground/60 md:text-left text-right">
          © {new Date().getFullYear()} همه حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}


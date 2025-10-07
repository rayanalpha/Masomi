import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* برند و توضیحات */}
          <div className="space-y-4">
            <div className="text-xl font-extrabold tracking-tight">
              <span className="text-gold-gradient">
                گالری معصومی
              </span>
            </div>
            <p className="text-sm text-foreground/70 leading-7">
              با بیش از دو دهه تجربه در زمینه طلا و جواهرات، گالری معصومی ارائه‌دهنده بهترین و باکیفیت‌ترین محصولات طلا و جواهرات است.
            </p>
          </div>

          {/* لینک‌های سریع */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">دسترسی سریع</h3>
            <nav className="grid grid-cols-1 gap-2 text-sm">
              <Link className="hover:underline text-foreground/70 hover:text-foreground" href="/catalog">کاتالوگ محصولات</Link>
              <Link className="hover:underline text-foreground/70 hover:text-foreground" href="/about">درباره ما</Link>
              <Link className="hover:underline text-foreground/70 hover:text-foreground" href="/contact">تماس با ما</Link>
            </nav>
          </div>

          {/* اطلاعات تماس */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">اطلاعات تماس</h3>
            <div className="space-y-3 text-sm text-foreground/70">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gold-400" />
                <span>تهران، خیابان ولیعصر، پلاک 123</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gold-400" />
                <span>021-12345678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gold-400" />
                <span>info@masoomi-gallery.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gold-400" />
                <span>شنبه تا پنج‌شنبه: 9:00 - 18:00</span>
              </div>
            </div>
          </div>

        </div>

        {/* کپی رایت */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/60">
            <div>
              © {new Date().getFullYear()} گالری معصومی. همه حقوق محفوظ است.
            </div>
            <div className="flex items-center gap-2">
              <span>طراحی و برنامه‌نویسی:</span>
              <span className="text-gold-400 font-medium">Aryan Hamidi</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


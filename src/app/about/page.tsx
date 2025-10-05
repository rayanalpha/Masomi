import { Award, Users, Clock, Star } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container py-10">
      {/* هدر صفحه */}
      <div className="text-center mb-12">
        <div className="text-center mb-6">
          <h1 className="lux-h1 text-gold-gradient">درباره گالری معصومی</h1>
        </div>
        <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
          با بیش از دو دهه تجربه در زمینه طلا و جواهرات، گالری معصومی یکی از معتبرترین و محبوب‌ترین گالری‌های طلا و جواهرات در تهران است.
        </p>
      </div>

      {/* آمار و دستاوردها */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="section-card p-6 text-center">
          <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-gold-500" />
          </div>
          <div className="text-2xl font-bold text-gold-500 mb-1">20+</div>
          <div className="text-sm text-foreground/70">سال تجربه</div>
        </div>
        <div className="section-card p-6 text-center">
          <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-gold-500" />
          </div>
          <div className="text-2xl font-bold text-gold-500 mb-1">5000+</div>
          <div className="text-sm text-foreground/70">مشتری راضی</div>
        </div>
        <div className="section-card p-6 text-center">
          <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 text-gold-500" />
          </div>
          <div className="text-2xl font-bold text-gold-500 mb-1">50+</div>
          <div className="text-sm text-foreground/70">جایزه و گواهی</div>
        </div>
        <div className="section-card p-6 text-center">
          <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-gold-500" />
          </div>
          <div className="text-2xl font-bold text-gold-500 mb-1">4.9</div>
          <div className="text-sm text-foreground/70">امتیاز مشتریان</div>
        </div>
      </div>

      {/* داستان ما */}
      <div className="section-card p-8 mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">داستان ما</h2>
        <div className="space-y-4 text-foreground/80 leading-8">
          <p>
            گالری معصومی در سال ۱۳۸۰ با هدف ارائه بهترین و باکیفیت‌ترین محصولات طلا و جواهرات تأسیس شد. از همان ابتدا، تمرکز ما بر روی کیفیت، اصالت و رضایت مشتریان بوده است.
          </p>
          <p>
            طی این سال‌ها، ما موفق شده‌ایم به یکی از معتبرترین و محبوب‌ترین گالری‌های طلا و جواهرات در تهران تبدیل شویم. مجموعه ما شامل بهترین و باکیفیت‌ترین محصولات طلا و جواهرات از برندهای معتبر داخلی و خارجی است.
          </p>
          <p>
            ما معتقدیم که هر قطعه طلا و جواهر باید داستان خاص خود را داشته باشد و به همین دلیل، تمام محصولات ما با دقت و وسواس خاصی انتخاب و ارائه می‌شوند.
          </p>
        </div>
      </div>

      {/* ارزش‌های ما */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="section-card p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">ارزش‌های ما</h3>
          <ul className="space-y-3 text-foreground/80">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>کیفیت بی‌نظیر در تمام محصولات</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>خدمات مشتری‌محور و حرفه‌ای</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>اصالت و تضمین کیفیت</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>طراحی‌های منحصر به فرد و زیبا</span>
            </li>
          </ul>
        </div>

        <div className="section-card p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">تعهدات ما</h3>
          <ul className="space-y-3 text-foreground/80">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>ارائه بهترین قیمت‌ها در بازار</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>پشتیبانی کامل پس از فروش</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>مشاوره تخصصی و رایگان</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>تضمین اصالت تمام محصولات</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}


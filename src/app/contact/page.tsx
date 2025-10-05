import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container py-10">
      {/* هدر صفحه */}
      <div className="text-center mb-12">
        <div className="text-center mb-6">
          <h1 className="lux-h1 text-gold-gradient">تماس با گالری معصومی</h1>
        </div>
        <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
          ما آماده پاسخگویی به سوالات و ارائه مشاوره تخصصی در زمینه طلا و جواهرات هستیم.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* اطلاعات تماس */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">اطلاعات تماس</h2>
          
          <div className="section-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-gold-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">آدرس گالری</h3>
                <p className="text-foreground/80">
                  تهران، خیابان ولیعصر، پلاک 123<br />
                  طبقه همکف، گالری معصومی
                </p>
              </div>
            </div>
          </div>

          <div className="section-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-gold-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">تلفن تماس</h3>
                <p className="text-foreground/80">
                  <a href="tel:02112345678" className="hover:text-gold-500 transition">021-12345678</a><br />
                  <a href="tel:09123456789" className="hover:text-gold-500 transition">0912-345-6789</a>
                </p>
              </div>
            </div>
          </div>

          <div className="section-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-gold-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">ایمیل</h3>
                <p className="text-foreground/80">
                  <a href="mailto:info@masoomi-gallery.com" className="hover:text-gold-500 transition">info@masoomi-gallery.com</a><br />
                  <a href="mailto:sales@masoomi-gallery.com" className="hover:text-gold-500 transition">sales@masoomi-gallery.com</a>
                </p>
              </div>
            </div>
          </div>

          <div className="section-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-gold-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">ساعات کاری</h3>
                <p className="text-foreground/80">
                  شنبه تا پنج‌شنبه: 9:00 - 18:00<br />
                  جمعه: 10:00 - 16:00<br />
                  <span className="text-sm text-foreground/60">(تعطیلات رسمی بسته است)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* فرم تماس */}
        <div className="section-card p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">ارسال پیام</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">نام و نام خانوادگی</label>
                <input 
                  className="input-lux w-full" 
                  placeholder="نام و نام خانوادگی خود را وارد کنید" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">شماره تماس</label>
                <input 
                  className="input-lux w-full" 
                  placeholder="شماره تماس خود را وارد کنید" 
                  type="tel"
                  required 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">ایمیل</label>
              <input 
                className="input-lux w-full" 
                placeholder="ایمیل خود را وارد کنید" 
                type="email"
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">موضوع</label>
              <select className="input-lux w-full" required>
                <option value="">انتخاب موضوع</option>
                <option value="consultation">مشاوره خرید</option>
                <option value="repair">تعمیر و نگهداری</option>
                <option value="custom">سفارش خاص</option>
                <option value="other">سایر موارد</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">پیام</label>
              <textarea 
                className="input-lux w-full min-h-32" 
                placeholder="پیام خود را اینجا بنویسید..."
                required 
              />
            </div>
            
            <button type="submit" className="btn btn-gold w-full flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              ارسال پیام
            </button>
          </form>
        </div>
      </div>

      {/* نقشه و اطلاعات اضافی */}
      <div className="mt-12">
        <div className="section-card p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">دسترسی آسان</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="font-semibold text-foreground mb-2">مترو</h3>
              <p className="text-foreground/80">ایستگاه ولیعصر - خط 1</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">اتوبوس</h3>
              <p className="text-foreground/80">ایستگاه ولیعصر - خطوط 1، 2، 3</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">پارکینگ</h3>
              <p className="text-foreground/80">پارکینگ رایگان در محل</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


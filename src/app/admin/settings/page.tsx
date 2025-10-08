export default function AdminSettingsPage() {
  const settingsSections = [
    {
      id: 'general',
      title: 'تنظیمات عمومی',
      description: 'اطلاعات پایه و تنظیمات کلی فروشگاه',
      icon: '🏪',
      items: [
        { label: 'نام فروشگاه', value: 'گالری معصومی', type: 'text' },
        { label: 'شعار فروشگاه', value: 'نگین‌های درخشان، کیفیت بی‌نظیر', type: 'text' },
        { label: 'آدرس ایمیل', value: 'info@gallery-masoumi.com', type: 'email' },
        { label: 'شماره تلفن', value: '021-88776655', type: 'tel' },
      ]
    },
    {
      id: 'payment',
      title: 'تنظیمات پرداخت',
      description: 'درگاه‌های پرداخت و تنظیمات مالی',
      icon: '💳',
      items: [
        { label: 'درگاه پرداخت اصلی', value: 'پارسیان', type: 'select' },
        { label: 'واحد پول', value: 'تومان', type: 'select' },
        { label: 'حداقل مبلغ سفارش', value: '100,000', type: 'number' },
        { label: 'هزینه ارسال', value: '50,000', type: 'number' },
      ]
    },
    {
      id: 'seo',
      title: 'تنظیمات SEO',
      description: 'بهینه‌سازی برای موتورهای جست‌وجو',
      icon: '🔍',
      items: [
        { label: 'عنوان سایت', value: 'گالری معصومی - جواهرات لوکس', type: 'text' },
        { label: 'توضیحات متا', value: 'بهترین جواهرات و طلا با کیفیت برتر', type: 'textarea' },
        { label: 'کلمات کلیدی', value: 'جواهرات, طلا, نقره, گوشواره', type: 'text' },
      ]
    },
    {
      id: 'notification',
      title: 'تنظیمات اطلاع‌رسانی',
      description: 'ایمیل و پیامک خودکار',
      icon: '📧',
      items: [
        { label: 'اطلاع‌رسانی سفارش جدید', value: 'فعال', type: 'toggle' },
        { label: 'اطلاع‌رسانی موجودی کم', value: 'فعال', type: 'toggle' },
        { label: 'ایمیل پذیرایی', value: 'فعال', type: 'toggle' },
        { label: 'پیامک تأیید سفارش', value: 'فعال', type: 'toggle' },
      ]
    },
  ];

  return (
    <div className="space-y-8">
      <div className="admin-header-section rounded-2xl p-4 sm:p-6 lg:p-8">
        <h1 className="lux-h2 text-gold-gradient mb-2 text-xl sm:text-2xl lg:text-3xl">⚙️ تنظیمات سیستم</h1>
        <p className="text-foreground/60 text-sm sm:text-base">مدیریت تنظیمات عمومی و پیکربندی فروشگاه</p>
      </div>

      <div className="grid gap-6">
        {settingsSections.map((section) => (
          <div key={section.id} className="admin-card p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="text-xl sm:text-2xl">{section.icon}</div>
              <div className="flex-1">
                <h3 className="lux-h4 text-gold-gradient text-base sm:text-lg">{section.title}</h3>
                <p className="text-xs sm:text-sm text-foreground/60 mt-1">{section.description}</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {section.items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5 gap-2 sm:gap-0">
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm sm:text-base">{item.label}</div>
                  </div>
                  <div className="flex-1 sm:max-w-md w-full">
                    {item.type === 'toggle' ? (
                      <div className="flex items-center justify-start sm:justify-end">
                        <div className="bg-green-500/20 text-green-300 border border-green-500/30 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                          {item.value}
                        </div>
                      </div>
                    ) : (
                      <div className="text-right">
                        <input 
                          type={item.type === 'number' ? 'text' : item.type}
                          defaultValue={item.value}
                          className="bg-white/[0.02] border border-white/10 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm w-full text-right focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 transition-all"
                          readOnly
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 flex justify-center sm:justify-end">
              <button className="btn-admin-primary w-full sm:w-auto text-sm">
                <span>💾</span> ذخیره تغییرات
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card p-4 sm:p-6 text-center border-dashed border-2 border-gold-500/20">
        <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🚧</div>
        <h3 className="lux-h4 mb-2 text-gold-gradient text-base sm:text-lg">در حال توسعه</h3>
        <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
          این بخش در حال توسعه است. به‌زودی قابلیت‌های جدیدی مانند:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-foreground/70">
          <div>📊 تنظیمات آمارگیری</div>
          <div>🔐 تنظیمات امنیتی</div>
          <div>🌐 تنظیمات چندزبانه</div>
          <div>📱 تنظیمات موبایل</div>
        </div>
      </div>
    </div>
  );
}


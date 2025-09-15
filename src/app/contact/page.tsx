export default function ContactPage() {
  return (
    <div className="container py-10">
      <h1 className="lux-h1 mb-6 text-gold-gradient">تماس</h1>
      <form className="section-card p-6 space-y-4 max-w-xl">
        <input className="input-lux" placeholder="نام" />
        <input className="input-lux" placeholder="ایمیل" />
        <textarea className="input-lux min-h-32" placeholder="پیام" />
        <button className="btn btn-gold">ارسال</button>
      </form>
    </div>
  );
}


"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

export default function NewCouponPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [type, setType] = useState("PERCENT");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, type, amount: Number(amount) }),
      });
      if (!res.ok) {
        setError("ثبت کوپن با خطا مواجه شد");
        return;
      }
      router.push("/admin/coupons");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="lux-h2 text-gold-gradient">کوپن جدید</h1>
      <form onSubmit={onSubmit} className="max-w-xl space-y-4 section-card p-6">
        <label className="block text-sm">
          <span className="mb-1 block">کد</span>
          <input className="input-lux" value={code} onChange={(e) => setCode(e.target.value)} required />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">نوع</span>
          <select className="input-lux" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="PERCENT">درصدی</option>
            <option value="FIXED">ثابت</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">مقدار</span>
          <input type="number" step="0.01" className="input-lux ltr" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-gold disabled:opacity-60">{loading ? "در حال ذخیره..." : "ذخیره"}</button>
      </form>
    </div>
  );
}


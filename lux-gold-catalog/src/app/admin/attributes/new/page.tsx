"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

export default function NewAttributePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      if (!res.ok) {
        setError("ثبت ویژگی با خطا مواجه شد");
        return;
      }
      router.push("/admin/attributes");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="lux-h2 text-gold-gradient">ویژگی جدید</h1>
      <form onSubmit={onSubmit} className="max-w-xl space-y-4 section-card p-6">
        <label className="block text-sm">
          <span className="mb-1 block">نام</span>
          <input className="input-lux" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">Slug</span>
          <input className="input-lux ltr" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-gold disabled:opacity-60">{loading ? "در حال ذخیره..." : "ذخیره"}</button>
      </form>
    </div>
  );
}


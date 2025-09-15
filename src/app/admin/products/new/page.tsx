"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState<string>("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [available, setAvailable] = useState(true);
  const [stock, setStock] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Upload image first if provided
      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        fd.append("name", slug || name);
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        if (!up.ok) throw new Error("آپلود تصویر ناموفق بود");
        const { url } = await up.json();
        imageUrl = url as string;
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          price: price ? Number(price) : undefined,
          sku: sku || undefined,
          description: description || undefined,
          categorySlug: category || undefined,
          status: "PUBLISHED",
          visibility: "PUBLIC",
          imageUrl,
          stock: available ? (stock ? Number(stock) : 1) : 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ? "اعتبارسنجی نامعتبر" : "خطا در ایجاد محصول");
        return;
      }
      router.push("/admin/products");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">محصول جدید</h1>
      <form onSubmit={onSubmit} className="max-w-3xl space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block">نام</span>
            <input
              className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-brand"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">Slug</span>
            <input
              className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">SKU (اختیاری)</span>
            <input
              className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">قیمت (اختیاری)</span>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">دسته (slug اختیاری برای اتصال)</span>
            <input
              className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand"
              placeholder="مثلاً rings"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">تصویر شاخص (اختیاری)</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
            موجود است؟
          </label>
          {available ? (
            <label className="block text-sm">
              <span className="mb-1 block">موجودی</span>
              <input
                type="number"
                min={0}
                className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </label>
          ) : null}
        </div>

        <label className="block text-sm">
          <span className="mb-1 block">توضیحات (اختیاری)</span>
          <textarea
            className="w-full min-h-32 rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-brand"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="rounded-md bg-brand px-3 py-2 text-brand-foreground disabled:opacity-60">
            {loading ? "در حال ذخیره..." : "ذخیره"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-md border border-zinc-700 px-3 py-2">
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}


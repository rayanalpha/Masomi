"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  visibility: "PUBLIC" | "PRIVATE";
  sku: string | null;
  stock: number | null;
};

export default function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [price, setPrice] = useState<string>(product.price?.toString() ?? "");
  const [status, setStatus] = useState<Product["status"]>(product.status);
  const [visibility, setVisibility] = useState<Product["visibility"]>(product.visibility);
  const [sku, setSku] = useState(product.sku ?? "");
  const [available, setAvailable] = useState<boolean>(((product.stock ?? 0) as number) > 0);
  const [stock, setStock] = useState<string>(product.stock != null ? String(product.stock) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          price: price ? Number(price) : null,
          status,
          visibility,
          sku: sku || null,
          stock: available ? (stock ? Number(stock) : 1) : 0,
        }),
      });
      if (!res.ok) {
        setError("ذخیره‌سازی با خطا مواجه شد");
        return;
      }
      router.push("/admin/products");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
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
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-1 block">قیمت</span>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">SKU</span>
          <input
            className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-1 block">وضعیت</span>
          <select
            className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-brand"
            value={status}
            onChange={(e) => setStatus(e.target.value as Product["status"])}
          >
            <option value="DRAFT">پیش‌نویس</option>
            <option value="PUBLISHED">انتشار یافته</option>
            <option value="ARCHIVED">آرشیو</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">نمایش</span>
          <select
            className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-brand"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Product["visibility"])}
          >
            <option value="PUBLIC">عمومی</option>
            <option value="PRIVATE">خصوصی</option>
          </select>
        </label>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded-md bg-brand px-3 py-2 text-brand-foreground disabled:opacity-60">
          {saving ? "در حال ذخیره..." : "ذخیره"}
        </button>
      </div>
    </form>
  );
}


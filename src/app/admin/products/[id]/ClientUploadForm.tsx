"use client";

import { useState, FormEvent } from "react";

export default function ClientUploadForm({ productId }: { productId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [alt, setAlt] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", name || "image");
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      if (!up.ok) throw new Error("upload failed");
      const { url } = await up.json();

      const res = await fetch(`/api/products/${productId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, alt: alt || null }),
      });
      if (!res.ok) throw new Error("attach failed");
      location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2 text-sm">
      <input name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="نام فایل" className="w-32 rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-brand" />
      <input name="alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="متن ALT" className="w-40 rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-brand" />
      <input name="file" type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="text-xs" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <button disabled={loading} className="rounded-md bg-brand px-3 py-2 text-brand-foreground disabled:opacity-60">{loading ? "در حال افزودن..." : "افزودن تصویر"}</button>
    </form>
  );
}


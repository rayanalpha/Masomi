"use client";

import { useMemo, useState } from "react";

type Img = { id: string; url: string; alt: string | null };

export default function ClientReorderGallery({ productId, images: initial }: { productId: string; images: Img[] }) {
  const [items, setItems] = useState<Img[]>(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  function onDragStart(e: React.DragEvent, id: string) {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    const draggedIndex = items.findIndex(i => i.id === dragId);
    const overIndex = items.findIndex(i => i.id === overId);
    if (draggedIndex < 0 || overIndex < 0) return;
    // Only reorder visually; persist happens on save
    const next = items.slice();
    const [moved] = next.splice(draggedIndex, 1);
    next.splice(overIndex, 0, moved);
    setItems(next);
    setDirty(true);
  }
  async function onDragEnd() {
    const hadDrag = !!dragId;
    setDragId(null);
    if (hadDrag && dirty) {
      await saveOrder();
      setDirty(false);
    }
  }

  async function saveOrder() {
    setSaving(true);
    try {
      const ids = items.map(i => i.id);
      const res = await fetch(`/api/products/${productId}/images/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("reorder failed");
      location.reload();
    } finally {
      setSaving(false);
    }
  }

  async function setAsCover(id: string) {
    const idx = items.findIndex(i => i.id === id);
    if (idx < 0) return;
    const next = items.slice();
    const [moved] = next.splice(idx, 1);
    next.unshift(moved);
    setItems(next);
    setDirty(true);
    await saveOrder();
  }

  return (
    <div className="mt-4 rounded-xl border border-zinc-800 p-3">
      <div className="mb-2 text-sm font-medium">مرتب‌سازی (درگ و دراپ) و انتخاب تصویر شاخص</div>
      <div className="flex flex-wrap gap-3">
        {items.map((img) => {
          const thumb = img.url.replace("/uploads/", "/uploads/_thumbs/");
          return (
            <figure
              key={img.id}
              draggable
              onDragStart={(e) => onDragStart(e, img.id)}
              onDragOver={(e) => onDragOver(e, img.id)}
              onDragEnd={onDragEnd}
              className="w-32 cursor-move"
              title="برای تغییر ترتیب بکشید"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb} alt={img.alt ?? ""} className="h-24 w-32 rounded-md object-cover border border-zinc-700" />
              <div className="mt-1 flex items-center justify-between">
                <figcaption className="truncate text-xs text-zinc-400">{img.alt ?? ""}</figcaption>
                <button type="button" onClick={() => setAsCover(img.id)} className="text-xs text-brand hover:opacity-80">شاخص</button>
              </div>
            </figure>
          );
        })}
      </div>
      <div className="mt-3">
        <button onClick={saveOrder} disabled={saving} className="rounded-md border border-zinc-700 px-3 py-2 text-sm hover:border-zinc-500 disabled:opacity-60">
          {saving ? "در حال ذخیره ترتیب..." : "ذخیره ترتیب (تصویر شاخص = اولین)"}
        </button>
      </div>
    </div>
  );
}

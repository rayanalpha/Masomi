"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Img = { url: string; alt?: string | null };

export default function ProductGallery({ images }: { images: Img[] }) {
  const imgs = useMemo<Required<Img>[]>(() => {
    const safe = (images && images.length ? images : [{ url: "/file.svg", alt: "" }]) as Img[];
    return safe.map((i) => ({ url: i.url, alt: i.alt ?? "" }));
  }, [images]);

  const thumbs = useMemo(() => imgs.map((i) => (i.url.startsWith("/uploads/") ? i.url.replace("/uploads/", "/uploads/_thumbs/").replace(/\.[^.]+$/, ".jpg") : i.url)), [imgs]);

  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);

  function prev() {
    setIndex((i) => (i > 0 ? i - 1 : imgs.length - 1));
  }
  function next() {
    setIndex((i) => (i + 1) % imgs.length);
  }
  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (startX.current == null) return;
    deltaX.current = e.touches[0].clientX - startX.current;
  }
  function onTouchEnd() {
    const dx = deltaX.current;
    startX.current = null;
    deltaX.current = 0;
    const threshold = 50;
    if (dx > threshold) {
      // swipe right -> previous
      prev();
    } else if (dx < -threshold) {
      // swipe left -> next
      next();
    }
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="space-y-3 select-none">
      {/* Main image */}
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl border-gold shadow-elegant"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onDoubleClick={() => setOpen(true)}
        onClick={() => setOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgs[index].url} alt={imgs[index].alt ?? ""} className="h-full w-full object-cover" />
        {imgs.length > 1 ? (
          <>
            <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 shadow-elegant">
              <ChevronRight size={18} />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 shadow-elegant">
              <ChevronLeft size={18} />
            </button>
          </>
        ) : null}
      </div>

      {/* Thumbs rail */}
      {imgs.length > 1 ? (
        <div className="no-scrollbar flex gap-2 overflow-x-auto py-1">
          {thumbs.map((t, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`relative h-14 w-16 md:h-16 md:w-20 flex-shrink-0 overflow-hidden rounded-md border ${i === index ? "border-[var(--gold-500)]" : "border-white/10"}`}
              title={imgs[i].alt ?? ""}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t} alt={imgs[i].alt ?? ""} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {/* Lightbox */}
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/90" onClick={() => setOpen(false)}>
          <button type="button" onClick={() => setOpen(false)} className="absolute left-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
            <X size={20} />
          </button>
          {imgs.length > 1 ? (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20">
                <ChevronRight size={24} />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20">
                <ChevronLeft size={24} />
              </button>
            </>
          ) : null}
          <div
            className="flex h-full w-full items-center justify-center p-6"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgs[index].url} alt={imgs[index].alt ?? ""} className="max-h-full max-w-full object-contain" />
          </div>
          {imgs.length > 1 ? (
            <div className="absolute bottom-4 left-0 right-0 mx-auto max-w-full overflow-x-auto py-2">
              <div className="mx-auto flex w-max gap-2 px-4">
                {thumbs.map((t, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                    className={`relative h-14 w-16 md:h-16 md:w-20 overflow-hidden rounded-md border ${i === index ? "border-[var(--gold-500)]" : "border-white/20"}`}
                    title={imgs[i].alt ?? ""}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t} alt={imgs[i].alt ?? ""} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import SearchImage from "./SearchImage";

interface ResultItem { slug: string; name: string; image: string; }

export default function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function openHandler() { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }
    function closeHandler() { setOpen(false); setQ(""); setResults([]); }
    window.addEventListener("open-search", openHandler as any);
    window.addEventListener("close-search", closeHandler as any);
    return () => {
      window.removeEventListener("open-search", openHandler as any);
      window.removeEventListener("close-search", closeHandler as any);
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (timer.current !== undefined) clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      if (!q.trim()) { setResults([]); return; }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        const items: ResultItem[] = (data.items || []).map((p: any) => ({
          slug: p.slug,
          name: p.name,
          image: p.image,
        }));
        setResults(items);
      } finally {
        setLoading(false);
      }
    }, 250);
  }, [q, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="mx-auto mt-16 max-w-2xl px-4" onClick={(e) => e.stopPropagation()}>
        <div className="glass glow rounded-2xl border border-white/10 p-3 shadow-elegant">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-foreground/70" />
            <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو بین محصولات..." className="w-full bg-transparent outline-none placeholder:text-foreground/50" />
            <button onClick={() => setOpen(false)} className="rounded-md border border-white/10 p-1 text-foreground/70 hover:text-foreground"><X size={16} /></button>
          </div>
        </div>
        <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02]">
          {loading ? (
            <div className="p-4 text-sm text-foreground/70">در حال جستجو...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-foreground/70">نتیجه‌ای یافت نشد.</div>
          ) : (
            <ul className="divide-y divide-white/10">
              {results.map((r) => (
                <li key={r.slug}>
                  <Link href={`/product/${r.slug}`} className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors" onClick={() => setOpen(false)}>
                    <div className="relative h-12 w-16 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                      <SearchImage 
                        src={r.image} 
                        alt={r.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{r.name}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

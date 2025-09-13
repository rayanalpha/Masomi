"use client";

import { useEffect, useState } from "react";

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const scrolled = (h.scrollTop || document.body.scrollTop);
      const height = h.scrollHeight - h.clientHeight;
      const p = height > 0 ? (scrolled / height) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, p)));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5">
      <div
        className="h-full bg-gradient-to-l from-[var(--gold-300)] via-[var(--gold-500)] to-[var(--gold-700)] shadow-[0_0_20px_rgba(212,175,55,.35)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

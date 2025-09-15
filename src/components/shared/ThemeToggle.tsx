"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    setLight(el.getAttribute("data-theme") === "light");
  }, []);
  function toggle() {
    const el = document.documentElement;
    const isLight = el.getAttribute("data-theme") === "light";
    if (isLight) el.removeAttribute("data-theme"); else el.setAttribute("data-theme", "light");
    setLight(!isLight);
  }
  return (
    <button onClick={toggle} className="inline-flex items-center justify-center rounded-md border border-white/15 p-2 text-foreground/80 hover:text-foreground">
      {light ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}

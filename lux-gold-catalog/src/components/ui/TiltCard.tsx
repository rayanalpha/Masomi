"use client";

import { useRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // degrees
  glare?: boolean;
};

export default function TiltCard({ children, className = "", maxTilt = 10, glare = true }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -maxTilt; // tilt X
    const ry = ((x / rect.width) - 0.5) * maxTilt; // tilt Y
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    if (glare) {
      el.style.setProperty("--px", `${(x / rect.width) * 100}%`);
      el.style.setProperty("--py", `${(y / rect.height) * 100}%`);
    }
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt-card ${glare ? "tilt-glare" : ""} ${className}`}
      style={{ transform: "perspective(900px)" }}
    >
      {children}
    </div>
  );
}

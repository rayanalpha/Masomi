"use client";

import React, { useRef } from "react";

export default function Ripple({ children, className = "", as: Tag = "button", ...props }: any) {
  const ref = useRef<HTMLElement | null>(null);
  function onClick(e: React.MouseEvent) {
    const host: any = ref.current;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const span = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    span.style.position = "absolute";
    span.style.width = span.style.height = `${size}px`;
    span.style.left = `${e.clientX - rect.left - size / 2}px`;
    span.style.top = `${e.clientY - rect.top - size / 2}px`;
    span.style.borderRadius = "50%";
    span.style.pointerEvents = "none";
    span.style.background = "radial-gradient(circle, rgba(255,255,255,.45) 0%, rgba(255,255,255,0) 60%)";
    span.style.transform = "scale(0)";
    span.style.opacity = "0.7";
    span.style.transition = "transform .6s ease, opacity .8s ease";
    host.style.position = "relative";
    host.style.overflow = "hidden";
    host.appendChild(span);
    requestAnimationFrame(() => {
      span.style.transform = "scale(1)";
      span.style.opacity = "0";
    });
    setTimeout(() => span.remove(), 800);
    props.onClick?.(e);
  }
  return (
    <Tag ref={ref as any} className={className} {...props} onClick={onClick}>
      {children}
    </Tag>
  );
}

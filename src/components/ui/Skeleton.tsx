"use client";

import React from "react";
import clsx from "clsx";

export type SkeletonProps = {
  className?: string;
  muted?: boolean;
  as?: React.ElementType;
};

export default function Skeleton({ className = "", muted = false, as: Tag = "div" }: SkeletonProps) {
  const Comp: React.ElementType = Tag as React.ElementType;
  return <Comp className={clsx("skeleton", muted && "skeleton-muted", className)} />;
}

"use client";

import { useState, useRef } from "react";

export default function ClientGalleryUploader({ productId }: { productId: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function onUpload() {
    if (!files.length) return;
    setUploading(true);
    setProgress({ done: 0, total: files.length });
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // 1) upload file
        const fd = new FormData();
        fd.append("file", file);
        fd.append("name", file.name.replace(/\.[^.]+$/, ""));
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        if (!up.ok) throw new Error("upload failed");
        const { url /*, thumbUrl*/ } = await up.json();
        // 2) attach to product images
        const res = await fetch(`/api/products/${productId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, alt: file.name }),
        });
        if (!res.ok) throw new Error("attach failed");
        setProgress({ done: i + 1, total: files.length });
      }
      location.reload();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-zinc-800 p-3">
      <div className="text-sm font-medium mb-2">آپلود گالری (چند فایل)</div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/avif"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        <button
          onClick={onUpload}
          disabled={uploading || files.length === 0}
          className="rounded-md bg-brand px-3 py-2 text-brand-foreground disabled:opacity-60"
        >
          {uploading ? `در حال آپلود ${progress.done}/${progress.total}` : "آپلود"}
        </button>
        {files.length > 0 ? <span className="text-zinc-400">{files.length} فایل انتخاب شده</span> : null}
      </div>
    </div>
  );
}

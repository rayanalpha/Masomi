"use client";

export default function DeleteImageButton({ productId, imageId }: { productId: string; imageId: string }) {
  async function onDelete() {
    if (!confirm("این تصویر حذف شود؟")) return;
    const res = await fetch(`/api/products/${productId}/images/${imageId}`, { method: "DELETE" });
    if (res.ok) location.reload();
  }
  return (
    <button onClick={onDelete} className="mt-1 text-xs text-red-400 hover:text-red-300">حذف</button>
  );
}

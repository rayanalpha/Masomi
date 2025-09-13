import prisma from "@/lib/prisma";
import ClientUploadForm from "./ClientUploadForm";
import ClientGalleryUploader from "./ClientGalleryUploader";
import DeleteImageButton from "./DeleteImageButton";
import ClientReorderGallery from './ClientReorderGallery';

export default async function ProductImagesPanel({ productId }: { productId: string }) {
  const images = await prisma.productImage.findMany({ where: { productId }, orderBy: { sort: "asc" } });
  return (
    <section className="rounded-xl border border-zinc-800 p-4 space-y-3">
      <h2 className="font-semibold">تصاویر محصول</h2>
      <div className="flex flex-wrap gap-3">
        {images.map((img) => {
          const thumb = img.url.replace("/uploads/", "/uploads/_thumbs/");
          return (
            <figure key={img.id} className="w-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb} alt={img.alt ?? ""} className="h-24 w-32 rounded-md object-cover" />
              <figcaption className="mt-1 truncate text-xs text-zinc-400">{img.alt ?? ""}</figcaption>
              {/* Client delete button */}
              <DeleteImageButton productId={productId} imageId={img.id} />
            </figure>
          );
        })}
      </div>
      {/* Client-side upload form */}
      <ClientUploadForm productId={productId} />
      {/* Client-side multi upload */}
      <ClientGalleryUploader productId={productId} />
      {/* Reorder and set cover */}
      <ClientReorderGallery productId={productId} images={images.map(i => ({ id: i.id, url: i.url, alt: i.alt }))} />
    </section>
  );
}


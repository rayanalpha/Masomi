import prisma from "@/lib/prisma";
import EditProductForm from "./EditProductForm";
import Link from "next/link";
import ProductImagesPanel from "./ProductImagesPanel";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return (
      <div className="space-y-4">
        <p>محصول یافت نشد.</p>
        <Link className="text-brand" href="/admin/products">بازگشت به لیست</Link>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ویرایش محصول</h1>
      <EditProductForm product={product} />
      {/* تصاویر محصول */}
      <ProductImagesPanel productId={product.id} />
    </div>
  );
}


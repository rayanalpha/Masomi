import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return (
      <div className="space-y-4">
        <p>دسته یافت نشد.</p>
        <Link className="text-brand" href="/admin/categories">بازگشت</Link>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <h1 className="lux-h2 text-gold-gradient">ویرایش دسته</h1>
      <form action={`/api/categories/${id}`} method="post" className="max-w-xl space-y-4 section-card p-6">
        <input type="hidden" name="_method" value="PATCH" />
        <label className="block text-sm">
          <span className="mb-1 block">نام</span>
          <input name="name" defaultValue={category.name} className="input-lux" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">Slug</span>
          <input name="slug" defaultValue={category.slug} className="input-lux ltr" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">شناسه والد</span>
          <input name="parentId" defaultValue={category.parentId ?? ""} className="input-lux ltr" />
        </label>
        <div className="flex gap-2">
          <button formAction={`/api/categories/${id}`} className="rounded-md bg-brand px-3 py-2 text-brand-foreground">ذخیره</button>
        </div>
      </form>
    </div>
  );
}


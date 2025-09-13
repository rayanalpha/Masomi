import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function ManageAttributePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const attribute = await prisma.attribute.findUnique({ where: { id }, include: { values: true } });
  if (!attribute) {
    return (
      <div className="space-y-4">
        <p>ویژگی یافت نشد.</p>
        <Link className="text-brand" href="/admin/attributes">بازگشت</Link>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">مدیریت ویژگی: {attribute.name}</h1>
      <section className="rounded-xl border border-zinc-800 p-4">
        <h2 className="mb-3 font-semibold">مقادیر</h2>
        <ul className="list-disc pr-6 space-y-1">
          {attribute.values.map((v) => (
            <li key={v.id} className="text-sm">
              <span className="font-medium">{v.value}</span>
              <span className="text-zinc-400 mr-2">({v.slug})</span>
            </li>
          ))}
        </ul>
        <ValueForm attributeId={attribute.id} />
      </section>
    </div>
  );
}

function ValueForm({ attributeId }: { attributeId: string }) {
  return (
    <form action={`/api/attributes/${attributeId}/values`} method="post" className="mt-4 flex flex-wrap items-end gap-2 text-sm">
      <input name="value" placeholder="عنوان مقدار" className="w-40 rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-brand" />
      <input name="slug" placeholder="slug" className="w-40 rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand" />
      <button formAction={`/api/attributes/${attributeId}/values`} className="rounded-md bg-brand px-3 py-2 text-brand-foreground">افزودن مقدار</button>
    </form>
  );
}


import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function ProductVariationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      attributes: { include: { attribute: { include: { values: true } } } },
      attrValues: { include: { attributeValue: true } },
      variations: { include: { options: { include: { attribute: true, attributeValue: true } } } },
    },
  });
  if (!product) return <div>محصول یافت نشد.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">تنوع‌های محصول: {product.name}</h1>
        <Link className="text-brand" href={`/admin/products/${id}`}>بازگشت به محصول</Link>
      </div>

      <NewVariationForm productId={id} attributes={product.attributes.map(a => ({
        id: a.attributeId,
        name: a.attribute.name,
        values: product.attrValues
          .filter(v => v.attributeValue.attributeId === a.attributeId)
          .map(v => ({ id: v.attributeValueId, label: `${v.attributeValue.value} (${v.attributeValue.slug})` })),
      }))} />

      <div className="rounded-xl border border-zinc-800">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-900/50 text-zinc-400">
            <tr>
              <th className="px-3 py-2 text-right">SKU</th>
              <th className="px-3 py-2 text-right">گزینه‌ها</th>
              <th className="px-3 py-2 text-right">قیمت</th>
              <th className="px-3 py-2 text-right">موجودی</th>
              <th className="px-3 py-2 text-right">وضعیت</th>
              <th className="px-3 py-2 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {product.variations.map((v) => (
              <tr key={v.id} className="border-t border-zinc-800">
                <td className="px-3 py-2">{v.sku ?? "-"}</td>
                <td className="px-3 py-2 text-zinc-400">{v.options.map(o => `${o.attribute.name}: ${o.attributeValue.value}`).join("، ")}</td>
                <td className="px-3 py-2">{v.price ?? "-"}</td>
                <td className="px-3 py-2">{v.stock}</td>
                <td className="px-3 py-2">{v.status ? "فعال" : "غیرفعال"}</td>
                <td className="px-3 py-2"><DeleteVariationButton id={v.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeleteVariationButton({ id }: { id: string }) {
  async function onDelete() {
    if (!confirm("حذف شود؟")) return;
    await fetch(`/api/variations/${id}`, { method: "DELETE" });
    location.reload();
  }
  return <button onClick={onDelete} className="text-red-400">حذف</button>;
}

function NewVariationForm({ productId, attributes }: { productId: string; attributes: { id: string; name: string; values: { id: string; label: string }[] }[] }) {
  async function onCreate(formData: FormData) {
    const entries: { attributeId: string; attributeValueId: string }[] = [];
    for (const attr of attributes) {
      const val = formData.get(`attr_${attr.id}`);
      if (val) entries.push({ attributeId: attr.id, attributeValueId: String(val) });
    }
    const res = await fetch(`/api/products/${productId}/variations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: formData.get("sku") || undefined,
        price: formData.get("price") ? Number(formData.get("price")) : null,
        salePrice: formData.get("salePrice") ? Number(formData.get("salePrice")) : null,
        stock: formData.get("stock") ? Number(formData.get("stock")) : 0,
        options: entries,
      }),
    });
    if (res.ok) location.reload();
  }

  return (
    <form action={onCreate} className="rounded-xl border border-zinc-800 p-4 text-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-1 block">SKU</span>
          <input name="sku" className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand" />
        </label>
        <label className="block">
          <span className="mb-1 block">قیمت</span>
          <input name="price" type="number" step="0.01" className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand" />
        </label>
        <label className="block">
          <span className="mb-1 block">قیمت حراج</span>
          <input name="salePrice" type="number" step="0.01" className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand" />
        </label>
        <label className="block">
          <span className="mb-1 block">موجودی</span>
          <input name="stock" type="number" className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand" defaultValue={0} />
        </label>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {attributes.map((a) => (
          <label key={a.id} className="block">
            <span className="mb-1 block">{a.name}</span>
            <select name={`attr_${a.id}`} className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-brand">
              <option value="">— انتخاب —</option>
              {a.values.map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="mt-4">
        <button className="rounded-md bg-brand px-3 py-2 text-brand-foreground">افزودن تنوع</button>
      </div>
    </form>
  );
}


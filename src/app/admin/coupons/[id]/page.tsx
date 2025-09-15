import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return <div>کوپن یافت نشد.</div>;

  async function action(formData: FormData) {
    const res = await fetch(`/api/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: formData.get("code") || undefined,
        type: formData.get("type") || undefined,
        amount: formData.get("amount") ? Number(formData.get("amount")) : undefined,
        active: formData.get("active") === "on",
      }),
    });
    if (res.ok) location.reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ویرایش کوپن</h1>
        <Link className="text-brand" href="/admin/coupons">بازگشت</Link>
      </div>
      <form action={action} className="max-w-xl space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block">کد</span>
          <input name="code" defaultValue={coupon.code} className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-brand" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">نوع</span>
          <select name="type" defaultValue={coupon.type} className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-brand">
            <option value="PERCENT">درصدی</option>
            <option value="FIXED">ثابت</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">مقدار</span>
          <input name="amount" type="number" step="0.01" defaultValue={coupon.amount?.toString()} className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="active" type="checkbox" defaultChecked={coupon.active} /> فعال
        </label>
        <button className="rounded-md bg-brand px-3 py-2 text-brand-foreground">ذخیره</button>
      </form>
    </div>
  );
}


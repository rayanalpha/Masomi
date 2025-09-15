"use client";

import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.ok) {
        const callbackUrl = params?.get("callbackUrl") ?? "/admin";
        router.push(callbackUrl);
      } else {
        setError("ایمیل یا کلمه عبور نادرست است.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-6"
    >
      <h1 className="text-xl font-bold">ورود مدیر</h1>
      <label className="block text-sm">
        <span className="mb-1 block">ایمیل</span>
        <input
          type="email"
          className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-brand"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block">کلمه عبور</span>
        <input
          type="password"
          className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-brand"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brand px-3 py-2 font-medium text-brand-foreground disabled:opacity-60"
      >
        {loading ? "در حال ورود..." : "ورود"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <Suspense fallback={<div className="text-sm text-foreground/70">...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}


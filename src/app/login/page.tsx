"use client";

import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
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
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 section-card p-6">
      <h1 className="lux-h2 text-gold-gradient">ورود</h1>
      <label className="block text-sm">
        <span className="mb-1 block">ایمیل</span>
        <input
          type="email"
          className="input-lux"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block">کلمه عبور</span>
        <input
          type="password"
          className="input-lux"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-gold w-full disabled:opacity-60">
        {loading ? "در حال ورود..." : "ورود"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-sm text-foreground/70">...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}


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
  const [debugMode, setDebugMode] = useState(false);
  const [debugResult, setDebugResult] = useState<string | null>(null);

  async function debugLogin() {
    if (!email || !password) {
      setError("لطفاً ایمیل و کلمه عبور را وارد کنید");
      return;
    }
    
    setLoading(true);
    setDebugResult(null);
    
    try {
      const res = await fetch('/api/debug/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      setDebugResult(JSON.stringify(data, null, 2));
      
      if (!data.success) {
        setError(data.error || 'مشکل در تست لاگین');
      }
    } catch (error) {
      setError(`خطا در debug login: ${error}`);
      setDebugResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  async function recreateAdmin() {
    if (!email || !password) {
      setError("لطفاً ایمیل و کلمه عبور را وارد کنید");
      return;
    }
    
    setLoading(true);
    setDebugResult(null);
    
    try {
      const res = await fetch('/api/debug/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, force: true })
      });
      
      const data = await res.json();
      setDebugResult(JSON.stringify(data, null, 2));
      
      if (data.success) {
        setError(null);
      } else {
        setError(data.error || 'مشکل در ایجاد ادمین');
      }
    } catch (error) {
      setError(`خطا در recreate admin: ${error}`);
      setDebugResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }

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
      
      <div className="space-y-2">
        <button type="submit" disabled={loading} className="btn btn-gold w-full disabled:opacity-60">
          {loading ? "در حال ورود..." : "ورود"}
        </button>
        
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={() => setDebugMode(!debugMode)} 
            className="text-xs bg-blue-600 px-2 py-1 rounded text-white"
          >
            {debugMode ? 'مخفی کردن Debug' : 'نمایش Debug'}
          </button>
          
          {debugMode && (
            <>
              <button 
                type="button" 
                onClick={debugLogin}
                disabled={loading}
                className="text-xs bg-green-600 px-2 py-1 rounded text-white disabled:opacity-60"
              >
                تست لاگین
              </button>
              <button 
                type="button" 
                onClick={recreateAdmin}
                disabled={loading}
                className="text-xs bg-orange-600 px-2 py-1 rounded text-white disabled:opacity-60"
              >
                بازسازی ادمین
              </button>
            </>
          )}
        </div>
      </div>
      
      {debugMode && debugResult && (
        <div className="mt-4">
          <h3 className="text-xs font-bold mb-2">نتیجه Debug:</h3>
          <pre className="text-xs bg-gray-900 p-2 rounded overflow-auto max-h-64 text-left">
            {debugResult}
          </pre>
        </div>
      )}
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


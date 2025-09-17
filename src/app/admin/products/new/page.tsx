"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState<string>("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [available, setAvailable] = useState(true);
  const [stock, setStock] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDebugLog([]); // Clear previous logs
    
    try {
      addLog("Starting form submission...");
      // Upload image first if provided
      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        addLog(`Uploading image: ${imageFile.name}`);
        const fd = new FormData();
        fd.append("file", imageFile);
        fd.append("name", slug || name);
        
        addLog('Calling /api/upload...');
        const up = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
        addLog(`Upload response: ${up.status} ${up.statusText}`);
        
        if (!up.ok) {
          const errorText = await up.text().catch(() => "Unknown error");
          addLog(`Upload error: ${errorText}`);
          throw new Error(`آپلود تصویر ناموفق بود: ${errorText}`);
        }
        
        const uploadResult = await up.json();
        imageUrl = uploadResult.url as string;
        addLog(`Image uploaded successfully: ${imageUrl}`);
      }

      const productData = {
        name,
        slug,
        price: price ? Number(price) : undefined,
        sku: sku || undefined,
        description: description || undefined,
        categorySlug: category || undefined,
        status: "PUBLISHED",
        visibility: "PUBLIC",
        imageUrl,
        stock: available ? (stock ? Number(stock) : 1) : 0,
      };
      addLog(`Sending product data: ${JSON.stringify(productData)}`);
      
      addLog('Calling /api/products...');
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(productData),
      });
      
      addLog(`Product creation response: ${res.status} ${res.statusText}`);
      
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        addLog(`Product creation error: ${JSON.stringify(data)}`);
        
        if (res.status === 401) {
          const errorMsg = "خطای احراز هویت. لطفاً مجدد وارد شوید.";
          setError(errorMsg);
          addLog(`401 Unauthorized: ${errorMsg}`);
        } else if (data?.error) {
          const errorMsg = `خطای اعتبارسنجی: ${JSON.stringify(data.error)}`;
          setError(errorMsg);
          addLog(`Validation error: ${errorMsg}`);
        } else {
          const errorMsg = `خطا در ایجاد محصول (${res.status})`;
          setError(errorMsg);
          addLog(`General error: ${errorMsg}`);
        }
        return;
      }
      
      addLog("Product created successfully!");
      router.push("/admin/products");
    } catch (error) {
      addLog(`Form submission error: ${error}`);
      const errorMsg = error instanceof Error ? error.message : "خطای ناشناخته";
      setError(errorMsg);
      addLog(`Setting error message: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }

  function addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[${timestamp}] ${message}`);
  }

  async function checkSession() {
    try {
      addLog('Testing session...');
      const res = await fetch('/api/debug/session', { credentials: 'include' });
      addLog(`Session response: ${res.status} ${res.statusText}`);
      const data = await res.json();
      setSessionInfo(JSON.stringify(data, null, 2));
      addLog('Session check completed');
    } catch (error) {
      const errorMsg = `Session error: ${error}`;
      setSessionInfo(errorMsg);
      addLog(errorMsg);
    }
  }

  async function testAPI() {
    try {
      addLog('Testing basic API...');
      const res = await fetch('/api/test', { credentials: 'include' });
      addLog(`Test API response: ${res.status} ${res.statusText}`);
      const data = await res.json();
      addLog(`Test API data: ${JSON.stringify(data)}`);
    } catch (error) {
      addLog(`Test API error: ${error}`);
    }
  }

  async function testNetworkConnectivity() {
    addLog('Testing network connectivity...');
    
    // Test basic endpoint
    try {
      const basicTest = await fetch('/api/test', { 
        method: 'GET',
        credentials: 'include'
      });
      addLog(`Basic GET test: ${basicTest.status}`);
    } catch (error) {
      addLog(`Basic GET failed: ${error}`);
    }
    
    // Test POST endpoint
    try {
      const postTest = await fetch('/api/test', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ test: 'data' })
      });
      addLog(`Basic POST test: ${postTest.status}`);
    } catch (error) {
      addLog(`Basic POST failed: ${error}`);
    }
    
    // Test authentication endpoints
    try {
      const authTest = await fetch('/api/products', { 
        method: 'GET',
        credentials: 'include'
      });
      addLog(`Products GET test: ${authTest.status}`);
    } catch (error) {
      addLog(`Products GET failed: ${error}`);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">محصول جدید</h1>
      <form onSubmit={onSubmit} className="max-w-3xl space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block">نام</span>
            <input
              className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-brand"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">Slug</span>
            <input
              className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">SKU (اختیاری)</span>
            <input
              className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">قیمت (اختیاری)</span>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">دسته (slug اختیاری برای اتصال)</span>
            <input
              className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand"
              placeholder="مثلاً rings"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">تصویر شاخص (اختیاری)</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
            موجود است؟
          </label>
          {available ? (
            <label className="block text-sm">
              <span className="mb-1 block">موجودی</span>
              <input
                type="number"
                min={0}
                className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 ltr outline-none focus:border-brand"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </label>
          ) : null}
        </div>

        <label className="block text-sm">
          <span className="mb-1 block">توضیحات (اختیاری)</span>
          <textarea
            className="w-full min-h-32 rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-brand"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        
        {/* Debug Section */}
        <div className="border border-zinc-700 rounded-md p-3 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={checkSession} className="text-xs bg-blue-600 px-2 py-1 rounded">
              بررسی Session
            </button>
            <button type="button" onClick={testAPI} className="text-xs bg-green-600 px-2 py-1 rounded">
              تست API
            </button>
            <button type="button" onClick={testNetworkConnectivity} className="text-xs bg-purple-600 px-2 py-1 rounded">
              تست شبکه
            </button>
            <button type="button" onClick={() => setDebugLog([])} className="text-xs bg-gray-600 px-2 py-1 rounded">
              پاک کردن لاگ
            </button>
          </div>
          
          {/* Session Info */}
          {sessionInfo && (
            <div>
              <h4 className="text-xs font-bold mb-1">اطلاعات Session:</h4>
              <pre className="text-xs bg-zinc-900 p-2 rounded overflow-auto max-h-32">
                {sessionInfo}
              </pre>
            </div>
          )}
          
          {/* Debug Logs */}
          {debugLog.length > 0 && (
            <div>
              <h4 className="text-xs font-bold mb-1">لاگها:</h4>
              <pre className="text-xs bg-zinc-900 p-2 rounded overflow-auto max-h-48">
                {debugLog.join('\n')}
              </pre>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="rounded-md bg-brand px-3 py-2 text-brand-foreground disabled:opacity-60">
            {loading ? "در حال ذخیره..." : "ذخیره"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-md border border-zinc-700 px-3 py-2">
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}


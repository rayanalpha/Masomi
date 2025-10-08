'use client';

import { useState } from 'react';
import Link from 'next/link';
import DeleteProductModal from './DeleteProductModal';

interface Product {
  id: string;
  name: string;
  slug: string;
  status: string;
  price: number | null;
  categories: Array<{ id: string; name: string }>;
}

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
  }>({
    isOpen: false,
    productId: '',
    productName: '',
  });

  const handleDeleteClick = (productId: string, productName: string) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName,
    });
  };

  const handleCloseModal = () => {
    setDeleteModal({
      isOpen: false,
      productId: '',
      productName: '',
    });
  };

  return (
    <>
      <div className="admin-table overflow-x-auto rounded-2xl">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm">نام محصول</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm hidden sm:table-cell">شناسه</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm">وضعیت</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm">قیمت</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm hidden lg:table-cell">دسته‌بندی</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm">
                  <div className="max-w-[150px] sm:max-w-none truncate">{p.name}</div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                  <code className="text-xs bg-white/10 px-2 py-1 rounded text-foreground/60">
                    {p.slug}
                  </code>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  {p.price ? (
                    <span className="font-semibold text-gold-gradient text-xs sm:text-sm">
                      {p.price.toLocaleString('fa-IR')} <span className="hidden sm:inline">تومان</span>
                    </span>
                  ) : (
                    <span className="text-foreground/40">-</span>
                  )}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {p.categories.slice(0, 2).map((cat) => (
                      <span 
                        key={cat.id} 
                        className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full"
                      >
                        {cat.name}
                      </span>
                    ))}
                    {p.categories.length > 2 && (
                      <span className="text-xs text-foreground/40">
                        +{p.categories.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex gap-1 flex-wrap">
                    <Link 
                      className="btn btn-admin-secondary px-2 sm:px-3 py-1 text-xs" 
                      href={`/admin/products/${p.id}`}
                    >
                      <span className="sm:hidden">✏️</span>
                      <span className="hidden sm:inline">✏️ ویرایش</span>
                    </Link>
                    <Link 
                      className="btn btn-outline px-2 sm:px-3 py-1 text-xs border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10" 
                      href={`/product/${p.slug}`}
                      target="_blank"
                    >
                      <span className="sm:hidden">👁️</span>
                      <span className="hidden sm:inline">👁️ مشاهده</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(p.id, p.name)}
                      className="btn btn-outline px-2 sm:px-3 py-1 text-xs border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      <span className="sm:hidden">🗑️</span>
                      <span className="hidden sm:inline">🗑️ حذف</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 sm:px-6 py-8 sm:py-12 text-center text-foreground/60">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📦</div>
                  <div className="text-base sm:text-lg font-medium mb-2">هیچ محصولی یافت نشد</div>
                  <div className="text-xs sm:text-sm">برای شروع اولین محصول خود را اضافه کنید</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      <DeleteProductModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseModal}
        productId={deleteModal.productId}
        productName={deleteModal.productName}
      />
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    PUBLISHED: { 
      label: 'منتشر شده', 
      className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
    },
    DRAFT: { 
      label: 'پیش‌نویس', 
      className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' 
    },
    ARCHIVED: { 
      label: 'بایگانی شده', 
      className: 'bg-gray-500/20 text-gray-300 border-gray-500/30' 
    }
  } as const;

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;

  return (
    <span className={`text-xs px-3 py-1 rounded-full border font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
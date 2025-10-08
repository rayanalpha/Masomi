'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { secureApiRequest } from '@/lib/csrf-client';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export default function DeleteProductModal({ 
  isOpen, 
  onClose, 
  productId, 
  productName 
}: DeleteProductModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await secureApiRequest(`/api/admin/products/${productId}/delete`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'خطا در حذف محصول');
      }

      // بستن مودال و رفرش صفحه
      onClose();
      router.refresh();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف محصول');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-background border border-white/10 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">🗑️</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">حذف محصول</h3>
                  <p className="text-sm text-foreground/70">این عمل غیرقابل برگشت است</p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-foreground mb-3">
                  آیا از حذف کامل محصول زیر اطمینان دارید؟
                </p>
                <div className="font-semibold text-gold-gradient">
                  {productName}
                </div>
                <p className="text-xs text-red-400 mt-3">
                  ⚠️ تمام تصاویر و اطلاعات مرتبط با این محصول نیز حذف خواهد شد.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="flex-1 btn btn-outline border-white/20 text-foreground/80 hover:bg-white/5 disabled:opacity-50"
                >
                  انصراف
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 btn bg-red-600 hover:bg-red-700 text-white border-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      در حال حذف...
                    </div>
                  ) : (
                    <>🗑️ حذف کامل</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
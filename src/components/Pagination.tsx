import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  if (totalItems <= 12 && pageSize === 12) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate visible page numbers
  const pages: number[] = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border-t border-stone-200/80 text-xs text-stone-600 w-full">
      {/* Left Info & Page Size */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto text-center">
        <span>
          Menampilkan <strong className="text-stone-900 font-semibold">{startItem}</strong> -{' '}
          <strong className="text-stone-900 font-semibold">{endItem}</strong> dari{' '}
          <strong className="text-stone-900 font-semibold">{totalItems}</strong> model
        </span>

        <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-stone-200">
          <span className="text-[11px] text-stone-400">Tampilkan:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-700 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-amber-500 min-h-[38px] touch-manipulation"
          >
            <option value={12}>12 / hal</option>
            <option value={24}>24 / hal</option>
            <option value={48}>48 / hal</option>
          </select>
        </div>
      </div>

      {/* Right Pagination Buttons (>=40px touch targets) */}
      <div className="flex items-center gap-1.5 justify-center">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="min-w-[40px] min-h-[40px] rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer touch-manipulation"
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {startPage > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="min-w-[40px] min-h-[40px] rounded-xl border border-stone-200 bg-white text-stone-700 font-semibold hover:bg-stone-50 transition-colors flex items-center justify-center cursor-pointer touch-manipulation"
            >
              1
            </button>
            {startPage > 2 && <span className="px-1 text-stone-400">...</span>}
          </>
        )}

        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-[40px] min-h-[40px] rounded-xl font-bold text-xs transition-colors flex items-center justify-center cursor-pointer touch-manipulation ${
                isActive
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {p}
            </button>
          );
        })}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1 text-stone-400">...</span>}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="min-w-[40px] min-h-[40px] rounded-xl border border-stone-200 bg-white text-stone-700 font-semibold hover:bg-stone-50 transition-colors flex items-center justify-center cursor-pointer touch-manipulation"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="min-w-[40px] min-h-[40px] rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer touch-manipulation"
          aria-label="Halaman Selanjutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

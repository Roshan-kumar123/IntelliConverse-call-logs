import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number; // 0-indexed
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function Pagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState('');

  const displayPage = currentPage + 1; // 1-indexed for display
  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  function handleJump() {
    const page = parseInt(jumpValue, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page - 1);
      setJumpValue('');
    }
  }

  function getPageNumbers(): (number | 'ellipsis-left' | 'ellipsis-right')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [];
    const current = displayPage;

    pages.push(1);

    if (current > 4) pages.push('ellipsis-left');

    const start = Math.max(2, current - 2);
    const end = Math.min(totalPages - 1, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < totalPages - 3) pages.push('ellipsis-right');

    pages.push(totalPages);

    return pages;
  }

  const pageNumbers = getPageNumbers();

  const btnBase =
    'w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors';
  const btnActive = 'bg-blue-600 text-white shadow-sm';
  const btnDefault = 'text-gray-600 hover:bg-gray-100';
  const btnDisabled = 'text-gray-300 cursor-not-allowed';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-1">
      {/* Left: info + page size */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          Showing{' '}
          <span className="font-medium text-gray-700">{startItem}–{endItem}</span>
          {' '}of{' '}
          <span className="font-medium text-gray-700">{totalElements.toLocaleString()}</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: page controls */}
      <div className="flex items-center gap-0.5">
        {/* First */}
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          className={`${btnBase} ${currentPage === 0 ? btnDisabled : btnDefault}`}
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={`${btnBase} ${currentPage === 0 ? btnDisabled : btnDefault}`}
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-0.5">
          {pageNumbers.map((p, idx) =>
            p === 'ellipsis-left' || p === 'ellipsis-right' ? (
              <span key={`${p}-${idx}`} className="w-7 h-8 flex items-center justify-center text-gray-400 text-sm">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange((p as number) - 1)}
                className={`${btnBase} ${displayPage === p ? btnActive : btnDefault}`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className={`${btnBase} ${currentPage >= totalPages - 1 ? btnDisabled : btnDefault}`}
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last */}
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          className={`${btnBase} ${currentPage >= totalPages - 1 ? btnDisabled : btnDefault}`}
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>

        {/* Jump to page */}
        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-200">
          <span className="text-sm text-gray-500 whitespace-nowrap">Go to</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJump()}
            placeholder="..."
            className="w-14 px-2 py-1 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleJump}
            className="px-2.5 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';
import React from 'react';

interface PaginateProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Paginate: React.FC<PaginateProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  const range: (number | '...')[] = [];
  let last: number | null = null;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      if (last && i - last > 1) {
        range.push('...');
      }
      range.push(i);
      last = i;
    }
  }

  return (
    <div className="flex justify-center items-center px-6 py-4 border-t gap-2">
      {/* Prev */}
      <button
        disabled={page === 1}
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        &lt;
      </button>

      {/* Pages */}
      {range.map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded ${
              page === p
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        &gt;
      </button>
    </div>
  );
};

export default Paginate;

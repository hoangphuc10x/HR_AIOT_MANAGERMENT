'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, options?: Record<string, any>) => string;
}

const PaginationClient: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  t,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
      {/* display range */}
      <div className="text-sm text-gray-700">
        {t('pagination.showing', {
          from: startIndex,
          to: endIndex,
          total: totalItems,
        })}
      </div>

      {/* Pagination buttons */}
      <div className="flex items-center gap-2">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Page numbers */}
        <div className="flex gap-1">
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default PaginationClient;

'use client';

import { useTranslation } from 'react-i18next';
import PaginationEllipsis from './PaginationEllipsis';
import PaginationItem from './PaginationItem';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';

type PaginationProps = {
  totalItems: number;
  currentPage: number;
  pageSize?: number;
  onChangePage?: (page: number) => void;
};

export default function Pagination({
  totalItems,
  currentPage,
  pageSize = 10,
  onChangePage,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const pageItems: (number | '...')[] = [];

  pageItems.push(1);

  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);
  const { t } = useTranslation();

  if (startPage > 2) {
    pageItems.push('...');
  }

  for (let i = startPage; i <= endPage; i++) {
    pageItems.push(i);
  }

  if (endPage < totalPages - 1) {
    pageItems.push('...');
  }

  if (totalPages > 1 && pageItems[pageItems.length - 1] !== totalPages) {
    pageItems.push(totalPages);
  }

  // Calculate the range of items currently displayed
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex gap-2 items-center mt-8 justify-between">
      <div className="text-sm text-gray-700">
        {t('pagination.showing', { from, to, total: totalItems })}
      </div>
      <div className="flex gap-2 items-center justify-end">
        <PaginationItem
          isDisable={currentPage === 1}
          onClick={() => onChangePage?.(1)}
        >
          <ChevronDoubleLeftIcon className="w-4 h-4" />
        </PaginationItem>

        <PaginationItem
          isDisable={currentPage === 1}
          onClick={() => onChangePage?.(currentPage - 1)}
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </PaginationItem>

        {pageItems.map((item, index) =>
          item === '...' ? (
            <PaginationEllipsis key={`ellipsis-${index}`} />
          ) : (
            <PaginationItem
              key={`page-${item}-${index}`}
              isDisable={false}
              isActive={item === currentPage}
              onClick={() => onChangePage?.(item)}
            >
              {item}
            </PaginationItem>
          ),
        )}

        <PaginationItem
          isDisable={currentPage === totalPages}
          onClick={() => onChangePage?.(currentPage + 1)}
        >
          <ChevronRightIcon className="w-4 h-4" />
        </PaginationItem>

        <PaginationItem
          isDisable={currentPage === totalPages}
          onClick={() => onChangePage?.(totalPages)}
        >
          <ChevronDoubleRightIcon className="w-4 h-4" />
        </PaginationItem>
      </div>
    </div>
  );
}

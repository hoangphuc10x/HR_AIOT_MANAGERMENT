'use client';

import { PaginateProps } from '@/types/department/department.interface';

export default function PaginateItem(props: PaginateProps) {
  const { totalPages, page, setPage } = props;

  return (
    <div className="flex gap-2 place-content-center mt-5">
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => setPage(i + 1)}
          className={`px-3 py-1 border rounded ${page === i + 1 ? 'bg-gray-300 font-bold' : 'hover:bg-gray-200'}`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

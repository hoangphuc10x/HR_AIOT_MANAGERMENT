import { ReactNode } from 'react';

export type PaginationItemProps = {
  children: ReactNode;
  isDisable?: boolean;
  isActive?: boolean;
  onClick?: () => void;
};

export default function PaginationItem({
  children,
  isDisable,
  isActive,
  onClick,
}: PaginationItemProps) {
  return (
    <button
      onClick={isDisable ? undefined : onClick}
      disabled={isDisable}
      className={`w-10 h-10 p-2 border flex items-center justify-center transition-all duration-300 rounded
        ${isDisable ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-blue-400 cursor-pointer'}
        ${isActive ? 'bg-orange-400 text-white' : ''}`}
    >
      {children}
    </button>
  );
}

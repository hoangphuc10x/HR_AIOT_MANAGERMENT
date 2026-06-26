import { ReactNode } from 'react';

export function StatBox({
  label,
  value,
  color,
  textColor,
  icon,
  subLabel,
  onClick,
}: {
  label: string;
  value: number | string;
  color: string;
  textColor: string;
  icon?: ReactNode;
  subLabel?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-6 shadow-sm border border-gray-300 transition-shadow duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
          {subLabel && <p className={`text-sm ${textColor}`}>{subLabel}</p>}
        </div>
        {icon && <div className={`${color} p-3 rounded-full`}>{icon}</div>}
      </div>
    </div>
  );
}

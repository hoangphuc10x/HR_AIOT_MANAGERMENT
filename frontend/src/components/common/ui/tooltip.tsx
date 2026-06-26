import { CustomTooltipProps } from '@/types/dashboard.type';
import { useTranslation } from 'react-i18next';

// Custom tooltip for bar chart
export const CustomBarTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  const { t } = useTranslation();

  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name === 'absences'
              ? t('dashboard.absences')
              : t('dashboard.absenceRate')}
            : {entry.value}
            {entry.name === 'rate' ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom tooltip for line chart
export const CustomLineTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  const { t } = useTranslation();

  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.dataKey === 'absences'
              ? t('dashboard.absences')
              : t('dashboard.workingDays')}
            : {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

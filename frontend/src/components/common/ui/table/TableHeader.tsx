import { useTranslation } from 'react-i18next';

export default function TableHeader() {
  const { t } = useTranslation();

  return (
    <thead className="bg-gray-200">
      <tr>
        <th className="w-[60px] px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
          {t('common.no')}
        </th>
        <th className="w-[220px] px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
          {t('employee.name')}
        </th>
        <th className="w-[220px] px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
          {t('employee.email')}
        </th>
        <th className="w-[130px] px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center text-nowrap">
          {t('employee.phone')}
        </th>
        <th className="w-[120px] px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center text-nowrap">
          {t('employee.status')}
        </th>
        <th className="w-[100px] px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center text-nowrap">
          {t('employee.sex')}
        </th>
        <th className="w-[100px] px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
          {t('employee.role')}
        </th>
        <th className="w-[120px] px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center text-nowrap">
          {t('common.actions')}
        </th>
      </tr>
    </thead>
  );
}

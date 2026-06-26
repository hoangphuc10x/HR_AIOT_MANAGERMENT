'use client';

import { ApiResponse } from '@/types/department/api-response.interface';
import { DepOverview } from '@/types/department/department.interface';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatBox } from '../common/ui/box';
import { useRouter } from 'next/navigation';
import { Building2, Users, Building, Trash2 } from 'lucide-react';

export default function DepartmentOverview({
  onFilter,
}: {
  onFilter?: (filter: { type: 'STATUS'; value: string | null }) => void;
}) {
  const { t, i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [data, setData] = useState<null | DepOverview>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && i18n.isInitialized) {
      setIsReady(true);
      fetchData();
    }
  }, [i18n.isInitialized]);

  const fetchData = async () => {
    try {
      const res = await axios.get<ApiResponse<DepOverview>>(
        `${process.env.NEXT_PUBLIC_API_URL}/departments/CardData`,
      );
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  if (!isReady) return null;

  return (
    <div>
      {data ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6">
          <StatBox
            label={t('common.departments').toUpperCase()}
            value={data.totalDepartment}
            color="bg-indigo-100"
            textColor="text-indigo-700"
            icon={<Building2 className="h-6 w-6 text-indigo-700" />}
            onClick={() => onFilter?.({ type: 'STATUS', value: null })}
          />

          <StatBox
            label={t('common.employees').toUpperCase()}
            value={data.totalEmployee}
            color="bg-green-100"
            textColor="text-green-700"
            icon={<Users className="h-6 w-6 text-green-700" />}
            onClick={() => router.push('/employee')}
          />

          <StatBox
            label={t('department.activeDepartments').toUpperCase()}
            value={data.totalActive}
            color="bg-blue-100"
            textColor="text-blue-700"
            icon={<Building className="h-6 w-6 text-blue-700" />}
            onClick={() => onFilter?.({ type: 'STATUS', value: '1' })}
          />

          <StatBox
            label={t('department.inactiveDepartments').toUpperCase()}
            value={data.totalInactive}
            color="bg-red-100"
            textColor="text-red-700"
            icon={<Building className="h-6 w-6 text-red-700" />}
            onClick={() => onFilter?.({ type: 'STATUS', value: '2' })}
          />

          <StatBox
            label={t('department.deleteDepartment').toUpperCase()}
            value={data.totalDeleted}
            color="bg-gray-100"
            textColor="text-gray-700"
            icon={<Trash2 className="h-6 w-6 text-gray-700" />}
            onClick={() => router.push('department/deleted')}
          />
        </div>
      ) : (
        <div className="text-gray-500 text-center">Loading data...</div>
      )}
    </div>
  );
}

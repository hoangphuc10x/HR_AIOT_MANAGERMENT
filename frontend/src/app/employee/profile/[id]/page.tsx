'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import axios from '@/lib/axios';
import { toast } from 'react-toastify';
import EmployeeDetail from '@/components/employee/EmployeeDetail';
import { User } from '@/types/employee/users.interface';

export default function EmployeeProfilePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<User | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`/users/${id}`);
        if (response.status === 200) {
          setEmployee(response.data.data);
        } else {
          throw new Error('Failed to fetch employee data');
        }
      } catch (err) {
        console.error(err);
        toast.error(t('common.failToFetchEmployee'));
        router.push('/employees'); // Redirect to employees list on error
      }
    };

    if (id) {
      fetchEmployee();
    }
  }, [id, t, router]);

  const handleClose = () => {
    router.push('/employee'); // Redirect to employees list on close
  };

  if (!employee) {
    return (
      <div className="flex justify-center items-center h-screen">
        {t('common.loading')}
      </div>
    );
  }

  return <EmployeeDetail employee={employee} onClose={handleClose} />;
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Department } from '@/types/department/department.interface';
import axios from '@/lib/axios';
import DepartmentDetailModal from '@/components/department/departmentDetailModal';

export default function DepartmentDetailPage() {
  const { id } = useParams();
  const [department, setDepartment] = useState<Department | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const res = await axios.get(`/departments/dep_id/${id}`);
        setDepartment(res.data.data);
        console.log('department data: ', res.data.data);
      } catch (err) {
        console.error('Failed to load department:', err);
      }
    };
    fetchDepartment();
  }, [id]);

  const onClose = () => {
    router.push('/department');
  };

  if (!department) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <DepartmentDetailModal
        department={department}
        index={1}
        onClose={() => {
          onClose();
        }}
        onReload={() => {}}
      />
    </div>
  );
}

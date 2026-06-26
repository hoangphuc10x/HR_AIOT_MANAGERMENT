'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Employee } from '@/types/common/common.type';
import EmployeeDetailGet from '@/components/employee/EmployeeDetailGet';
import { useParams } from 'next/navigation';

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const [employeeInfo, setEmployeeInfo] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await axios.get(`users/${id}`);
        setEmployeeInfo(res.data.data);
      } catch (error) {
        console.error('Error fetching employee data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-gray-200 p-6 min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!employeeInfo) {
    return (
      <div className="bg-gray-200 p-6 min-h-screen flex items-center justify-center">
        <div className="text-red-600">Employee not found</div>
      </div>
    );
  }

  return <EmployeeDetailGet employeeInfo={employeeInfo} />;
}

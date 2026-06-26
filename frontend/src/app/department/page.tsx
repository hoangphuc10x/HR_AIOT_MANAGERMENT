'use client';

import React, { useEffect, useState } from 'react';
import { t } from 'i18next';
import { toast } from 'react-toastify';
import axios from '@/lib/axios';
import DepartmentHeader from '@/components/department/departmentHeader';
import DepartmentOverview from '@/components/department/departmentOverview';
import { DepartmentTable } from '@/components/department/departmentTable';
import { ApiResponse } from '@/types/department/api-response.interface';
import { DepListData } from '@/types/department/department.interface';

import AddDepartmentModal from '@/components/department/addDepartmentModal';
import { fetchUserPermissions } from '@/api/user-permission';
import { PermissionEnum } from '@/enums/permission.enum';
import { getDecodedToken } from '@/lib/getDecodedToken';

export default function DepartmentPage() {
  const [depList, setDepList] = useState<DepListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [userPermissions, setUserPermissions] = useState<number[]>([]);
  const [filter, setFilter] = useState<{
    type: 'STATUS';
    value: string | null;
  } | null>(null);
  const handleFilter = (newFilter: {
    type: 'STATUS';
    value: string | null;
  }) => {
    setFilter(newFilter);
  };
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get<ApiResponse<DepListData>>(
        `${process.env.NEXT_PUBLIC_API_URL}/departments?page=1`,
      );
      setDepList(res.data.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(t('department.failToFetch'));
      toast.error(t('department.failToFetch'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Fetch departments
      await fetchDepartments();

      // Fetch user permissions
      const decoded = getDecodedToken();
      const userId = decoded?.userId;
      if (userId) {
        try {
          const permissions = await fetchUserPermissions(userId);
          setUserPermissions(permissions);
        } catch (err) {
          toast.error(t('common.failToFetchPermissions'));
        }
      }
    };

    fetchData();
  }, []);

  const canCreateDepartment = userPermissions.includes(
    PermissionEnum.CREATE_DEPARTMENT,
  );

  if (loading) return <DepartmentSkeleton />;
  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">{t('common.error')}</h3>
          <p className="text-red-700">{error}</p>
          <p className="text-red-600 text-sm mt-2">{t('common.checkServer')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-5 relative p-6 h-[100%] ${
        openModal ? 'overflow-hidden' : 'overflow-auto'
      }`}
    >
      {/* Header */}
      <DepartmentHeader
        onAddDepartment={() => setOpenModal(true)}
        canCreateDepartment={canCreateDepartment}
      />

      {/* Overview Cards */}
      <DepartmentOverview onFilter={handleFilter} />

      {/* Table */}
      <DepartmentTable filter={filter} onSuccess={fetchDepartments} />

      {/* Modal Add Department */}
      {openModal && (
        <AddDepartmentModal
          dialogShow={openModal}
          setShowDialog={setOpenModal}
          onSuccess={fetchDepartments}
        />
      )}
    </div>
  );
}

function DepartmentSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Overview cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <div className="text-center">
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

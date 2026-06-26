'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '@/types/employee/users.interface';
import { Avatar } from '@/components/common/ui/avatar';
import { Input } from '@/components/common/ui/input';
import { Badge } from '@/components/common/ui/badge';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import { deleteUser } from '@/api/users';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface EmployeeTableProps {
  employees: User[];
  onEmployeeDeleted?: () => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onEmployeeDeleted,
}) => {
  const { t, i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && i18n.isInitialized) {
      setIsReady(true);
    }
  }, [i18n.isInitialized]);

  const handleViewDetail = (employee: User) => {
    router.push(`/employee/profile/${employee.userId}`);
  };

  const handleDeleteEmployee = async (employee: User) => {
    if (!confirm(t('employee.delete.confirm', { name: employee.fullName }))) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteUser(employee.userId);

      toast.success(t('employee.delete.success'));

      window.dispatchEvent(new Event('userDeleted'));
      onEmployeeDeleted?.();
    } catch (error: unknown) {
      console.error('Error deleting employee:', error);

      let message = 'An error occurred while deleting the employee.';

      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object'
      ) {
        const response = (
          error as {
            response?: { data?: { message?: string; error?: string } };
          }
        ).response;
        if (response?.data?.message) {
          message = response.data.message;
        } else if (response?.data?.error) {
          message = response.data.error;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      if (
        message.toLowerCase().includes('internal server error') ||
        message.toLowerCase().includes('department')
      ) {
        toast.error(t('employee.delete.error_department'));
      } else {
        toast.error(message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusVariant = (status: number) => {
    switch (status) {
      case 1: // ACTIVE
        return 'success';
      case 2: // INACTIVE
        return 'warning';
      case 3: // SUSPENDED
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return t('employee.statusTypes.active');
      case 2:
        return t('employee.statusTypes.inactive');
      case 3:
        return t('employee.statusTypes.suspended') || 'Suspended';
      default:
        return t('employee.statusTypes.inactive');
    }
  };

  const getSexText = (sex: number) => {
    return sex === 1 ? t('dashboard.male') : t('dashboard.female');
  };

  const getRoleText = (roles: number[]) => {
    const roleNames = roles.map((role) => {
      switch (role) {
        case 1:
          return t('employee.roles.ADMIN');
        case 2:
          return t('employee.roles.HR');
        case 3:
          return t('employee.roles.HEAD_DEPARTMENT');
        case 4:
          return t('employee.roles.STAFF');
        default:
          return 'UNKNOWN';
      }
    });
    return roleNames.join(', ');
  };

  // Don't render until ready to prevent hydration mismatch
  if (!isReady) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="w-64">
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('common.employees')}
            </h2>
            <div className="w-64">
              <Input
                placeholder={t('common.search')}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('employee.name')}
                </th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('employee.email')}
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('employee.department')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('employee.role')}
                </th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('employee.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee, index) => (
                <tr key={employee.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar
                        src={employee.avatarUrl}
                        alt={employee.fullName}
                        fallback={employee.fullName.charAt(0)}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getSexText(employee.sex)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.email}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.departments && employee.departments.length > 0
                      ? employee.departments.join(', ')
                      : t('common.noData')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getRoleText(employee.roles)}
                  </td>
                  <td className="py-4 whitespace-nowrap">
                    <Badge variant={getStatusVariant(employee.status)}>
                      {getStatusText(employee.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetail(employee)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          t('attendance.processing')
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default EmployeeTable;

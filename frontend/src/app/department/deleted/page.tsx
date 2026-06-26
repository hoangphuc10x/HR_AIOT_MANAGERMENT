'use client';

import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Building2,
  RotateCcw,
  Eye,
  AlertCircle,
  Search,
} from 'lucide-react';
import axios from '@/lib/axios';
import { DepartmentStatus } from '@/enums/department-status.enum';
import { departmentDelete } from '@/types/department/department.interface';
import { getDecodedToken } from '@/lib/getDecodedToken';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/department/ConfirmModal';

const DeletedDepartments = () => {
  const [deletedDepartments, setDeletedDepartments] = useState<
    departmentDelete[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDepartment, setSelectedDepartment] =
    useState<departmentDelete | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const decoded = getDecodedToken();
  const userId = decoded?.userId;
  const router = useRouter();
  const { t } = useTranslation();
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchDeletedDepartments();
  }, []);

  const fetchDeletedDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/departments/deleted/dep`);
      if (res.data.statusCode == 200) {
        setDeletedDepartments(res.data.data);
      } else {
        setError(t('deletedDepartments.errorLoad'));
        toast.error(t('deletedDepartments.errorLoad'));
      }
    } catch (err) {
      setError(t('deletedDepartments.errorLoad'));
      toast.error(t('deletedDepartments.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusName = (status: DepartmentStatus) => {
    return t(`departmentStatus.${status}`);
  };

  const getStatusColor = (status: DepartmentStatus) => {
    const colors = {
      1: 'text-green-600 bg-green-50',
      2: 'text-red-600 bg-red-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getLevelName = (level: number) => {
    return t(`departmentLevels.${level}`, { defaultValue: `Level ${level}` });
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRestore = async (id: number) => {
    try {
      await axios.patch(`/departments/${id}/restore/${userId}`);
      setDeletedDepartments((prev) => prev.filter((dept) => dept.id !== id));
      setShowRestoreModal(false);
      setSelectedDepartment(null);
      toast.success(t('deletedDepartments.restoreSuccess'));
    } catch (err) {
      toast.error(t('deletedDepartments.restoreFail'));
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (window.confirm(t('deletedDepartments.confirmDelete'))) {
      try {
        await axios.delete(`/departments/${id}/hard-delete/${userId}`);
        setDeletedDepartments((prev) => prev.filter((dept) => dept.id !== id));
        toast.success(t('deletedDepartments.deleteSuccess'));
      } catch (err) {
        toast.error(t('deletedDepartments.deleteFail'));
      }
    }
  };

  const handleNavigateBack = () => {
    router.push('/department');
  };
  // Filter departments based on search term
  const filteredDepartments = deletedDepartments.filter((dept) =>
    dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {t('deletedDepartments.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDeletedDepartments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('deletedDepartments.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="my-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('deletedDepartments.title')}
              </h1>
              <p className="text-gray-600">
                {t('deletedDepartments.description')}
              </p>
            </div>
            <button
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={handleNavigateBack}
            >
              {t('deletedDepartments.back')}
            </button>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder={t('deletedDepartments.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredDepartments.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm
                  ? t('deletedDepartments.notFound')
                  : t('deletedDepartments.empty')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th>{t('common.no')}</th>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th>{t('deletedDepartments.name')}</th>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th>{t('deletedDepartments.level')}</th>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th>{t('deletedDepartments.status')}</th>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th>{t('deletedDepartments.createdAt')}</th>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th>{t('deletedDepartments.deletedAt')}</th>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th>{t('deletedDepartments.actions')}</th>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDepartments.map((department, index) => (
                    <tr key={department.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-100">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {department.departmentName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {department.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {getLevelName(department.level)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(department.status)}`}
                        >
                          {getStatusName(department.status)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(department.createdAt)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(department.deletedAt)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedDepartment(department);
                              setShowRestoreModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                            title={t('deletedDepartments.restore')}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDepartment(department);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title={t('deletedDepartments.deleteForever')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Restore Modal */}
        {showRestoreModal && selectedDepartment && (
          <ConfirmModal
            title={t('deletedDepartments.restoreTitle')}
            message={t('deletedDepartments.restoreConfirm')}
            confirmText={t('deletedDepartments.restore')}
            confirmColor="bg-blue-600"
            onClose={() => {
              setShowRestoreModal(false);
              setSelectedDepartment(null);
            }}
            onConfirm={() => handleRestore(selectedDepartment.id)}
          />
        )}

        {showDeleteModal && selectedDepartment && (
          <ConfirmModal
            title={t('deletedDepartments.deleteForever')}
            message={t('deletedDepartments.confirmDelete')}
            confirmText={t('deletedDepartments.deleteForever')}
            confirmColor="bg-red-600"
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedDepartment(null);
            }}
            onConfirm={() => handlePermanentDelete(selectedDepartment.id)}
          />
        )}
      </div>
    </div>
  );
};

export default DeletedDepartments;

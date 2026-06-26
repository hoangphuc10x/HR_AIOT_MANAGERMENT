'use client';

import React, { useState, useEffect } from 'react';
import {
  Trash2,
  User,
  Calendar,
  Clock,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import axios from '@/lib/axios';
import {
  LeaveType,
  RequestStatus,
} from '@/enums/leaveRequest-RequestStatus.enum';
import { LeaveRequestDelete } from '@/types/leave-request/leave-request.interface';
import { getDecodedToken } from '@/lib/getDecodedToken';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/leave-request/ConfirmModal';

const DeletedLeaveRequests = () => {
  // Define the LeaveRequest type if not already imported
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletedRequests, setDeletedRequests] = useState<LeaveRequestDelete[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] =
    useState<LeaveRequestDelete | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const { t } = useTranslation();
  const decoded = getDecodedToken();
  const userId = decoded?.userId;
  useEffect(() => {
    fetchDeletedRequests();
  }, []);

  const fetchDeletedRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/leave-request/deleted`);
      console.log('res leave delete: ', res);

      setTimeout(() => {
        if (res.data.message) {
          setDeletedRequests(res.data.data);
        } else {
          setError('Không thể tải dữ liệu');
        }
        setLoading(false);
      }, 1000);
    } catch (err) {
      toast.error(t('deletedLeave.restoreFail'));
      setLoading(false);
    }
  };

  const getStatusColor = (status: RequestStatus) => {
    const colors = {
      1: 'text-yellow-600 bg-yellow-50',
      2: 'text-green-600 bg-green-50',
      3: 'text-red-600 bg-red-50',
      4: 'text-red-600 bg-orange-50',
      5: 'text-red-600 bg-pink-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getDate() - start.getDate());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const handleRestore = async (id: number) => {
    try {
      // Call API restore
      await axios.patch(`/leave-request/${id}/restore/${userId}`);
      console.log(`Khôi phục leave request ID: ${id}`);

      // Update state
      setDeletedRequests((prev) => prev.filter((req) => req.id !== id));
      setShowRestoreModal(false);
      setSelectedRequest(null);
      toast.success(t('deletedLeave.restoreSuccess'));
    } catch (err) {
      toast.error(t('deletedLeave.restoreFail'));
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (window.confirm(t('deletedLeave.confirmDelete'))) {
      try {
        await axios.delete(`/leave-request/${id}/hard-delete/${userId}`);
        // Update state
        setDeletedRequests((prev) => prev.filter((req) => req.id !== id));
        toast.success(t('deletedLeave.deleteSuccess'));
      } catch (err) {
        toast.error(t('deletedLeave.deleteFail'));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('deletedLeave.loading')}</p>
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
            onClick={fetchDeletedRequests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('deletedLeave.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('deletedLeave.title')}
              </h1>
              <p className="text-gray-600">{t('deletedLeave.description')}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('deletedLeave.total-deleted')}
                </h3>
                <p className="text-2xl font-bold text-red-600">
                  {deletedRequests.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <RotateCcw className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('deletedLeave.can-restore')}
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {deletedRequests.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('deletedLeave.delete-lately')}
                </h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    deletedRequests.filter((req) => {
                      const deletedDate = new Date(req.deletedAt);
                      const oneDayAgo = new Date(
                        Date.now() - 24 * 60 * 60 * 1000,
                      );
                      return deletedDate > oneDayAgo;
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('deletedLeave.list-of-delete')}
            </h2>
          </div>

          {deletedRequests.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('deletedLeave.no-deleted')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('deletedLeave.employee')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('deletedLeave.type')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('deletedLeave.time')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('deletedLeave.reason')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('deletedLeave.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('deletedLeave.deletedAt')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('deletedLeave.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deletedRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.user.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {t(`leaveTypes.${request.leaveType}`)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            {formatDate(request.startDate)} -{' '}
                            {formatDate(request.endDate)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {calculateDays(request.startDate, request.endDate)}{' '}
                            {t('deletedLeave.date')}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div
                          className="text-sm text-gray-900 max-w-xs truncate"
                          title={request.reason}
                        >
                          {request.reason}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
                        >
                          {t(`requestStatus.${request.status}`)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.deletedAt)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRestoreModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                            title={t('deletedLeave.restore')}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title={t('deletedLeave.deleteForever')}
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
        {showRestoreModal && selectedRequest && (
          <ConfirmModal
            title={t('deletedLeave.restoreLeaveRequest')}
            message={
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p>
                  <strong>{t('deletedLeave.employee')}:</strong>{' '}
                  {selectedRequest.user.fullName}
                </p>
                <p>
                  <strong>{t('deletedLeave.reason')}:</strong>{' '}
                  {selectedRequest.reason}
                </p>
                <p>
                  <strong>{t('deletedLeave.time')}:</strong>{' '}
                  {formatDate(selectedRequest.startDate)} -{' '}
                  {formatDate(selectedRequest.endDate)}
                </p>
              </div>
            }
            confirmText={t('common.restore')}
            confirmColor="bg-blue-600"
            onClose={() => {
              setShowRestoreModal(false);
              setSelectedRequest(null);
            }}
            onConfirm={() => handleRestore(selectedRequest.id)}
          />
        )}
        {/* Delete Modal */}
        {showDeleteModal && selectedRequest && (
          <ConfirmModal
            title={t('deletedLeave.deleteForever')}
            message={
              <div className="text-sm text-gray-600">
                {t('deletedLeave.confirmDelete')}
                <br />
                <strong>{selectedRequest.user.fullName}</strong> -{' '}
                {selectedRequest.reason}
              </div>
            }
            confirmText={t('common.delete')}
            confirmColor="bg-red-600"
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedRequest(null);
            }}
            onConfirm={() => handlePermanentDelete(selectedRequest.id)}
          />
        )}
      </div>
    </div>
  );
};

export default DeletedLeaveRequests;

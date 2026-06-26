'use client';

import React, { useState, useEffect, use } from 'react';
import { Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from '@/lib/axios';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { LeaveRequest } from '@/types/leave-request/leave-request.interface';
import { RequestStatus } from '@/enums/leaveRequest-RequestStatus.enum';
import { getDecodedToken } from '@/lib/getDecodedToken';
import Paginate from '@/components/leave-request/pagination';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import {
  getLeaveTypeColor,
  getLeaveTypeText,
  getStatusColor,
  getStatusText,
} from '@/components/leave-request/UiFunction';

const AttendanceManagementDashboard: React.FC = () => {
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'attendance' | 'leave-requests'>(
    'attendance',
  );
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null,
  );
  const router = useRouter();
  // pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const startYear = 2020;
  const endYear = 2030;
  const decoded = getDecodedToken();
  const { t } = useTranslation();

  // Fetch data from backend
  const fetchLeaveRequests = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axios.get<{
        data: { data: LeaveRequest[]; page: number; totalPages: number };
      }>(`/leave-request/summary`, {
        params: {
          page: pageNumber,
          pageSize: 10,
          month,
          year,
        },
      });
      setLeaveRequests(res.data.data.data);
      console.log('leave request data: ', res.data.data.data);
      setPage(res.data.data.page);
      setTotalPages(res.data.data.totalPages);
    } catch (error) {
      toast.error('Fail to fetch leave requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests(page);
  }, [page, month, year]);

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case RequestStatus.REJECTED:
        return <XCircle className="w-5 h-5 text-red-600" />;
      case RequestStatus.PENDING:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const handleDeleteButton = () => {
    router.push('/leave-requests-summary/deleted');
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t('leaveRequestStatus.manage_leave_requests')}
          </h1>

          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('leave-requests')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'leave-requests'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Calendar size={20} />
              {t('leaveRequestStatus.Leave_request_summary')}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-screen-2xl mx-auto px-8 py-6">
        <div>
          <div>
            <div className="mb-4 flex items-center">
              <div className="flex space-x-2">
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="border b border-gray-200 rounded-lg px-3 py-2"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {t(`leaveRequestStatus.month`)} {m}
                    </option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="border b border-gray-200 rounded-lg px-3 py-2"
                >
                  {Array.from(
                    { length: endYear - startYear + 1 },
                    (_, i) => startYear + i,
                  ).map((y) => (
                    <option key={y} value={y}>
                      {t(`leaveRequestStatus.year`)} {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ml-auto">
                <button
                  className="flex bg-red-400 px-4 py-2 text-white rounded-lg hover:bg-red-600"
                  onClick={handleDeleteButton}
                >
                  Deleted
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden w-full border b border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-gray-700">
                      {t('leaveRequestStatus.employee')}
                    </th>
                    <th className="text-left px-1 py-4 font-medium text-gray-700">
                      {t('leaveRequestStatus.type')}
                    </th>
                    <th className="text-center px-6 py-4 font-medium text-gray-700">
                      {t('leaveRequestStatus.time')}
                    </th>
                    <th className="text-center px-6 py-4 font-medium text-gray-700">
                      {t('leaveRequestStatus.reason')}
                    </th>
                    <th className="text-center px-6 py-4 font-medium text-gray-700">
                      {t('leaveRequestStatus.status')}
                    </th>
                    <th className="text-center px-1 py-4 font-medium text-gray-700">
                      {t('leaveRequestStatus.date_send')}
                    </th>
                    <th className="text-left px-6 py-4 font-medium text-gray-700">
                      {t('leaveRequestStatus.approver')}
                    </th>
                    <th className="text-left px-3 py-4 font-medium text-gray-700">
                      {t('leaveRequestStatus.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-4 text-gray-500"
                      >
                        {t('leaveRequestStatus.loading')}
                      </td>
                    </tr>
                  ) : leaveRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-4 text-gray-500"
                      >
                        {t('leaveRequestStatus.no_leave_request')}
                      </td>
                    </tr>
                  ) : (
                    leaveRequests.map((request) => (
                      <tr
                        onClick={() =>
                          router.push(`/leave-requests-summary/${request.id}`)
                        }
                        // onClick={() => setSelectedRequest(request)}
                        key={request.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          request.status === RequestStatus.PENDING
                            ? 'bg-yellow-50'
                            : 'opacity-90'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Image
                                src={
                                  request.sender.avatarUrl ||
                                  'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg'
                                }
                                alt="Avatar"
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            </div>
                            <span className="font-medium text-gray-800">
                              {request.sender.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(
                              Number(request.leaveType),
                            )}`}
                          >
                            {getLeaveTypeText(Number(request.leaveType))}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-center">
                          {new Date(request.startDate).toLocaleDateString(
                            'vi-VN',
                          )}
                          {request.startDate !== request.endDate && (
                            <>
                              {' '}
                              -{' '}
                              {new Date(request.endDate).toLocaleDateString(
                                'vi-VN',
                              )}
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {request.reason}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <span
                              className={`text-sm font-medium ${getStatusColor(request.status)}`}
                            >
                              {getStatusText(request.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(request.appliedDate).toLocaleDateString(
                            'vi-VN',
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {request.approvedBy
                            ? request.approvedBy.fullName
                            : t('leaveRequestStatus.no_leave_request')}
                        </td>
                        <td className="px-1 py-4 text-sm text-blue-500 cursor-pointer hover:underline">
                          <span onClick={() => setSelectedRequest(null)}>
                            {t('leaveRequestStatus.view_detail')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Paginate
              page={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagementDashboard;

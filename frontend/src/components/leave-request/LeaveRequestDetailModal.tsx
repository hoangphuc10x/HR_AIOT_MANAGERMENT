'use client';

import { RequestStatus } from '@/enums/leaveRequest-RequestStatus.enum';
import { LeaveRequestDetailModalProps } from '@/types/leave-request/leave-request.interface';
import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Mail,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ConfirmDeleteModal from './confirmDeleteLeaveRequestModal';

const LeaveRequestDetailModal: React.FC<LeaveRequestDetailModalProps> = ({
  selectedRequest,
  onClose,
  onApprove,
  onReject,
  getLeaveTypeText,
  getStatusText,
}) => {
  const { t } = useTranslation();
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [leaveRequestId, setLeaveRequestId] = useState<number>(0);
  if (!selectedRequest) return null;
  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED:
        return 'bg-green-100 text-green-800 border-green-200';
      case RequestStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      case RequestStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED:
        return <CheckCircle className="w-4 h-4" />;
      case RequestStatus.REJECTED:
        return <XCircle className="w-4 h-4" />;
      case RequestStatus.PENDING:
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getLeaveTypeColor = (leaveType: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
    ];
    return colors[leaveType % colors.length] || colors[0];
  };

  return (
    <div className="backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('leaveRequest.details')}
                </h2>
                <p className="text-sm text-gray-500">
                  {t('leaveRequest.code')}: #{selectedRequest.id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Employee Info Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              {t('leaveRequest.employee_info')}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {selectedRequest.sender.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedRequest.sender.fullName}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Mail className="w-3 h-3" />
                    {selectedRequest.sender.email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Details Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              {t('leaveRequest.leave_info')}
            </h3>
            <div className="space-y-4">
              {/* Leave Type */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">
                  {t('leaveRequest.leave_type')}:
                </span>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full border ${getLeaveTypeColor(Number(selectedRequest.leaveType))}`}
                >
                  {getLeaveTypeText(Number(selectedRequest.leaveType))}
                </span>
              </div>

              {/* Duration */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">
                  {t('leaveRequest.time')}:
                </span>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(selectedRequest.startDate).toLocaleDateString(
                      'vi-VN',
                    )}
                    {selectedRequest.startDate !== selectedRequest.endDate &&
                      ' - ' +
                        new Date(selectedRequest.endDate).toLocaleDateString(
                          'vi-VN',
                        )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedRequest.startDate === selectedRequest.endDate
                      ? '1 ' + t('leaveRequest.date')
                      : `${Math.ceil((new Date(selectedRequest.endDate).getTime() - new Date(selectedRequest.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} ${t('leaveRequest.date')}`}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600 block mb-2">
                  {t('leaveRequest.no_reason')}:
                </span>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {selectedRequest.reason || t('leaveRequest.no_reason')}
                  </p>
                </div>
              </div>

              {/* Applied Date */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">
                  {t('leaveRequest.date_send')}:
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(selectedRequest.appliedDate).toLocaleDateString(
                    'vi-VN',
                  )}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">
                  {t('leaveRequest.status')}:
                </span>
                <div
                  className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${getStatusColor(selectedRequest.status)}`}
                >
                  {getStatusIcon(selectedRequest.status)}
                  {getStatusText(selectedRequest.status)}
                </div>
              </div>

              {/* Approver */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-600">
                  {t('leaveRequest.approveBy')}:
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedRequest.approvedBy?.fullName ||
                    t('leaveRequest.no_reason')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {selectedRequest.status === RequestStatus.PENDING && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDelete(true);
                  setLeaveRequestId(selectedRequest.id);
                }}
                className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
              >
                <Trash2 className="w-4 h-4" />
                {t('leaveRequest.delete')}
              </button>
              <button
                onClick={() => onReject(selectedRequest.id)}
                className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2 font-medium"
              >
                <XCircle className="w-4 h-4" />
                {t('leaveRequest.reject')}
              </button>
              <button
                onClick={() => onApprove(selectedRequest.id)}
                className="px-6 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center gap-2 font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                {t('leaveRequest.approve')}
              </button>
            </div>
          </div>
        )}
      </div>
      {showDelete && (
        <ConfirmDeleteModal
          id={leaveRequestId}
          setShowModal={setShowDelete}
          onClose={onClose}
        />
      )}
    </div>
  );
};

export default LeaveRequestDetailModal;

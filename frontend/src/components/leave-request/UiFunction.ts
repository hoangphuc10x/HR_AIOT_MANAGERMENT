import {
  LeaveType,
  RequestStatus,
} from '@/enums/leaveRequest-RequestStatus.enum';
import { t } from 'i18next';
import { Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// color with type of leave
export const getLeaveTypeColor = (type: LeaveType) => {
  switch (type) {
    case 1:
      return 'bg-red-100 text-red-800';
    case 2:
      return 'bg-blue-100 text-blue-800';
    case 3:
      return 'bg-purple-100 text-purple-800';
    case 4:
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getLeaveTypeText = (type: LeaveType): string => {
  switch (type) {
    case LeaveType.Annual:
      return `${t('leaveRequest.annual')}`;
    case LeaveType.Sick:
      return `${t('leaveRequest.sick')}`;
    case LeaveType.Unpaid:
      return `${t('leaveRequest.unpaid')}`;
    case LeaveType.Other:
      return `${t('leaveRequest.other')}`;
    default:
      return 'Unknown';
  }
};

export const getStatusText = (status: RequestStatus) => {
  switch (status) {
    case RequestStatus.APPROVED:
      return `${t('leaveRequestStatus.APPROVED')}`;
    case RequestStatus.REJECTED:
      return `${t('leaveRequestStatus.REJECTED')}`;
    case RequestStatus.PENDING:
      return `${t('leaveRequestStatus.PENDING')}`;
    case RequestStatus.CANCELLED:
      return `${t('leaveRequestStatus.CANCELLED')}`;
    default:
      return '';
  }
};

export const getStatusColor = (status: RequestStatus) => {
  switch (status) {
    case RequestStatus.APPROVED:
      return 'text-green-600';
    case RequestStatus.REJECTED:
      return 'text-red-600';
    case RequestStatus.PENDING:
      return 'text-yellow-600';
    case RequestStatus.CANCELLED:
      return 'text-gray-500';
    default:
      return '';
  }
};

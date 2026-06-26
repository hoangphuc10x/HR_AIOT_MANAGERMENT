import {
  LeaveType,
  RequestStatus,
} from '@/enums/leaveRequest-RequestStatus.enum';

export interface User {
  code: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

export interface LeaveRequest {
  id: number;
  leaveType: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: RequestStatus;
  appliedDate: string;
  sender: User;
  approvedBy: User | null;
  approvedAt?: string | null;
}

export type LeaveRequestDelete = {
  id: number;
  user: {
    fullName: string;
    email: string;
  };
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: RequestStatus;
  deletedAt: string;
};

export interface LeaveRequestDetailModalProps {
  selectedRequest: LeaveRequest | null;
  onClose: () => void;
  onApprove: (requestId: number) => void;
  onReject: (requestId: number) => void;
  getLeaveTypeText: (type: LeaveType) => string;
  getStatusText: (status: RequestStatus) => string;
}

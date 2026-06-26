'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { LeaveRequest } from '@/types/leave-request/leave-request.interface';
import {
  RequestStatus,
  LeaveType,
} from '@/enums/leaveRequest-RequestStatus.enum';
import { getDecodedToken } from '@/lib/getDecodedToken';
import { toast } from 'react-toastify';
import LeaveRequestDetailModal from '@/components/leave-request/LeaveRequestDetailModal';
import { useTranslation } from 'react-i18next';
import {
  getLeaveTypeText,
  getStatusText,
} from '@/components/leave-request/UiFunction';

export default function LeaveRequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const decoded = getDecodedToken();
  const { t } = useTranslation();

  const [request, setRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get<{ data: LeaveRequest }>(
        `/leave-request/leaveId/${id}`,
      );
      setRequest(res.data.data);
    } catch (error) {
      toast.error('Fail to fetch leave request detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleApproval = async (
    status: RequestStatus,
    leaveRequestId: number,
  ) => {
    try {
      await axios.post(`leave-request/approval`, {
        userId: decoded?.userId,
        leaveRequestId,
        leaveRequestStatus: status,
      });
      toast.success(
        status === RequestStatus.APPROVED
          ? t('leaveRequest.approve_success')
          : status === RequestStatus.CANCELLED
            ? t('leaveRequest.cancel_success')
            : status === RequestStatus.REJECTED
              ? t('leaveRequest.reject_success')
              : 'Action success',
      );
      fetchDetail();
    } catch (error) {
      toast.error('Fail to approve/reject request');
    }
  };

  if (loading) return <div>{t('leaveRequestStatus.loading')}</div>;
  if (!request) return <div>{t('leaveRequestStatus.no_leave_request')}</div>;

  return (
    <LeaveRequestDetailModal
      selectedRequest={request}
      onClose={() => router.push('/leave-requests-summary')}
      onApprove={(id) => handleApproval(RequestStatus.APPROVED, id)}
      onReject={(id) => handleApproval(RequestStatus.REJECTED, id)}
      getLeaveTypeText={getLeaveTypeText}
      getStatusText={getStatusText}
    />
  );
}

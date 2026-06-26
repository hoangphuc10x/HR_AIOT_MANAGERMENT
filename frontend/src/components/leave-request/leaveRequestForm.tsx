'use client';
import axios from '@/lib/axios';
import { ApiResponse } from '@/types/department/api-response.interface';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getDecodedToken } from '@/lib/getDecodedToken';

enum LeaveType {
  Annual = 1,
  Sick = 2,
  Unpaid = 3,
  Other = 4,
}
interface LeaveRequestFormProps {
  setShowModal: (v: boolean) => void;
  fetchData: () => void;
}
export default function LeaveRequestForm({
  setShowModal,
  fetchData,
}: LeaveRequestFormProps) {
  const [leaveType, setLeaveType] = useState<LeaveType>(LeaveType.Annual);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { t } = useTranslation();

  const error = useMemo(() => {
    if (!startDate || !endDate) return '';
    if (new Date(endDate) < new Date(startDate)) {
      return t('leaveRequest.endDateMustAfterStart');
    }
    return '';
  }, [startDate, endDate]);
  const handleCancel = () => {
    setReason('');
    setStartDate('');
    setEndDate('');
    setShowModal(false);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    const decode = getDecodedToken();
    const userId = decode?.userId;
    e.preventDefault();
    if (error) return;

    const payload = {
      userId: userId,
      leaveType,
      reason: reason.trim(),
      startDate,
      endDate,
    };

    try {
      const res = await axios.post<ApiResponse<{ message: string }>>(
        `leave-request`,
        payload,
      );
      toast.success(res.data.data.message);
      fetchData();
    } catch (error) {
      toast.error('Send request fail');
    }
    handleCancel();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl space-y-6 rounded-2xl border p-6 shadow-sm bg-white"
      >
        <h2 className="text-xl font-semibold">{t('common.leaveRequest')}</h2>

        {/* Leave Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            {t('leaveRequest.leaveType')}
          </label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: t('leaveRequest.annual'), value: LeaveType.Annual },
              { label: t('leaveRequest.sick'), value: LeaveType.Sick },
              { label: t('leaveRequest.unpaid'), value: LeaveType.Unpaid },
              { label: t('leaveRequest.other'), value: LeaveType.Other },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded-xl border p-3 hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="leaveType"
                  value={opt.value}
                  checked={leaveType === opt.value}
                  onChange={() => setLeaveType(opt.value)}
                  className="h-4 w-4"
                />
                <span className="text-sm">
                  {opt.label} ({opt.value})
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <label htmlFor="reason" className="block text-sm font-medium">
            {t('leaveRequest.reason')}
          </label>
          <textarea
            id="reason"
            rows={4}
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2"
            placeholder={t('leaveRequest.enterLeaveReason')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="text-right text-xs text-gray-500">
            {reason.length}/500
          </div>
        </div>

        {/* Dates */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="startDate" className="block text-sm font-medium">
              {t('leaveRequest.startDate')}
            </label>
            <input
              id="startDate"
              type="date"
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2"
              value={startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="endDate" className="block text-sm font-medium">
              {t('leaveRequest.endDate')}
            </label>
            <input
              id="endDate"
              type="date"
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => handleCancel()}
            className="rounded-2xl px-4 py-2 font-medium shadow-sm border
               hover:bg-gray-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={!reason.trim() || !startDate || !endDate || !!error}
            className="rounded-2xl px-4 py-2 font-medium shadow-sm 
                     disabled:cursor-not-allowed disabled:opacity-50
                     border hover:bg-gray-50"
          >
            {t('common.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

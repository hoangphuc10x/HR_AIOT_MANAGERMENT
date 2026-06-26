'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Edit3,
} from 'lucide-react';
import axios from '@/lib/axios';
import { getStatusColor, getStatusText } from '@/lib/utils';
import { AttendanceRecord } from '@/types/attendance.type';
import { useSearchParams, useRouter } from 'next/navigation';
import { use } from 'react';
import { toast } from 'react-toastify';
import EditAttendanceModal from '@/components/attendance/EditAttendanceModal';
import ConfirmUpdateModal from '@/components/attendance/ConfirmUpdateModal';
import { useTranslation } from 'react-i18next';

const AttendanceDetailPage = ({
  params,
}: {
  params: Promise<{ code: string }>;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord>();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editData, setEditData] = useState({
    checkIn: '',
    checkOut: '',
  });
  const [updating, setUpdating] = useState(false);
  const { t } = useTranslation();
  const { code } = use(params);

  const isAllowEdit = (date: string) => {
    const targetDate = new Date(date);
    const today = new Date();
    const startCurrentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );
    const endToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999,
    );

    if (targetDate < startCurrentMonth || targetDate > endToday) {
      return false;
    }

    return true;
  };

  // Initialize selected date
  useEffect(() => {
    const dateFromParams = searchParams.get('date');
    if (dateFromParams) {
      setSelectedDate(dateFromParams);
    } else {
      // Default to today
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
    }
  }, [searchParams]);

  // Fetch data when date or code changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDate) return;

      try {
        setLoading(true);

        const fetchAttendanceData = await axios.get(
          `/attendances/detail/${code}`,
          {
            params: { date: selectedDate },
          },
        );

        setAttendanceData(fetchAttendanceData.data.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setAttendanceData(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code, selectedDate]);

  const handleBackClick = () => {
    router.back();
  };

  const handleEditClick = () => {
    if (attendanceData?.attendance) {
      const checkInTime = attendanceData.attendance.checkIn
        ? new Date(attendanceData.attendance.checkIn).toLocaleTimeString(
            'en-GB',
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          )
        : '';

      const checkOutTime = attendanceData.attendance.checkOut
        ? new Date(attendanceData.attendance.checkOut).toLocaleTimeString(
            'en-GB',
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          )
        : '';

      setEditData({
        checkIn: checkInTime,
        checkOut: checkOutTime,
      });
      setShowEditModal(true);
    }
  };

  const handleSaveClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = () => {
    setShowConfirmModal(false);
    handleUpdateAttendance();
  };

  const handleUpdateAttendance = async () => {
    try {
      setUpdating(true);

      const updateData = {
        checkIn: editData.checkIn
          ? `${selectedDate}T${editData.checkIn}:00`
          : null,
        checkOut: editData.checkOut
          ? `${selectedDate}T${editData.checkOut}:00`
          : null,
      };

      await axios.put(`/attendances/detail/${code}`, updateData, {
        params: { date: selectedDate },
      });

      // Refetch data after update
      const fetchAttendanceData = await axios.get(
        `/attendances/detail/${code}`,
        {
          params: { date: selectedDate },
        },
      );

      setAttendanceData(fetchAttendanceData.data.data.data);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('An error occurred while updated attendance');
    } finally {
      toast.success('Update attendance successfully');
      setUpdating(false);
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Cannot loading data</p>
        </div>
      </div>
    );
  }

  const { employee, attendance, onLeave } = attendanceData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {t('attendance.detail')}
              </h1>
              <p className="text-sm text-gray-500">
                {formatDate(attendance.date)}
              </p>
            </div>
          </div>
          {isAllowEdit(selectedDate) && (
            <button
              onClick={handleEditClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {t('attendance.edit')}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-4 space-y-6">
        {/* Employee Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {employee.name}
              </h2>
              <p className="text-gray-500">
                {t('employee.employeeCode')}: {employee.code}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {t('employee.email')}
              </p>
              <p className="font-medium">{employee.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {t('employee.phone')}
              </p>
              <p className="font-medium">{employee.phone}</p>
            </div>
          </div>
        </div>

        {/* Attendance Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              {t('attendance.information')}
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                {t('attendance.checkIn')}
              </p>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(attendance.checkIn)}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                {t('attendance.checkOut')}
              </p>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(attendance.checkOut)}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                {t('attendance.workingHours')}
              </p>
              <div className="text-2xl font-bold text-blue-600">
                {attendance.workingHours} h
              </div>
            </div>
          </div>
        </div>

        {/* Status & Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            {t('attendance.status')}
          </h3>

          <div className="mb-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(attendance.status)}`}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              {getStatusText(attendance.status)}
            </span>
          </div>

          {onLeave && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                {t('attendance.leavingInformation')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">
                    {t('attendance.leaveType')}
                  </span>
                  <span className="ml-2 text-blue-900">{onLeave.type}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">
                    {t('attendance.time')}:
                  </span>
                  <span className="ml-2 text-blue-900">
                    {onLeave.startDate} - {onLeave.endDate}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mt-3">
                <p className="text-sm text-gray-600">{onLeave.reason}</p>
              </div>

              <div className="mt-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      {t('attendance.approveBy')}:
                    </span>
                    <span className="font-medium">
                      {onLeave.approvedBy.fullName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditAttendanceModal
        show={showEditModal}
        editData={editData}
        updating={updating}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveClick}
        onChange={(field, value) =>
          setEditData((prev) => ({ ...prev, [field]: value }))
        }
        t={t}
      />

      {/* Confirmation Modal */}
      <ConfirmUpdateModal
        show={showConfirmModal}
        updating={updating}
        editData={editData}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmUpdate}
        t={t}
      />
    </div>
  );
};

export default AttendanceDetailPage;

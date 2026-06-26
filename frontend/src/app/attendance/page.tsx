'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Loader,
  AlertTriangle,
  CalendarX,
  LogOut,
  MinusCircle,
} from 'lucide-react';
import axios from '@/lib/axios';
import { getStatusText } from '@/components/attendance/getStatusText';
import { getDecodedToken } from '@/lib/getDecodedToken';
import { getStatusColor } from '@/components/attendance/getStatusColor';
import {
  AttendanceData,
  Employee,
  TodayAttendance,
} from '@/types/attendance.type';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/common/ui/ConfirmModal';
import ErrorState from '@/components/common/ui/ErrorState';

export default function PersonalAttendancePage() {
  const { t } = useTranslation();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance>({
    checkIn: null,
    checkOut: null,
    workingHours: 0,
    status: 'not_started',
    isCheckedIn: false,
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const decode = getDecodedToken();
  const currentUserId = decode?.userId;
  const userCode = decode?.code;

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `/attendances/summary/${userCode}?year=${selectedYear}&month=${selectedMonth}`,
      );

      if (res.data.success) {
        const employee = res.data.data.data.employee;
        const attendanceData = res.data.data.data.attendanceData || [];
        setEmployee(employee);
        setAttendanceData(attendanceData);
      } else {
        setEmployee(null);
        setAttendanceData([]);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const res = await axios.get(`/attendances/today/${userCode}`);

      if (res.data.success) {
        const todayRecord = res.data.data?.data?.attendance ?? null;

        if (todayRecord) {
          setTodayAttendance({
            checkIn: todayRecord.checkIn
              ? new Date(todayRecord.checkIn).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : null,
            checkOut: todayRecord.checkOut
              ? new Date(todayRecord.checkOut).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : null,
            workingHours: todayRecord.workingHours || 0,
            status: todayRecord.status || 'not_started',
            isCheckedIn: !!(todayRecord.checkIn && !todayRecord.checkOut),
          });
        } else {
          setTodayAttendance({
            checkIn: null,
            checkOut: null,
            workingHours: 0,
            status: 'not_started',
            isCheckedIn: false,
          });
        }
        setError(null);
      } else {
        setError('Failed to fetch today attendance');
      }
    } catch (err) {
      console.log('loi ở today:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    fetchAttendanceData();
    fetchTodayAttendance();
  }, [selectedMonth, selectedYear]);

  // Handle check-in
  const handleCheckIn = async () => {
    if (todayAttendance.isCheckedIn) {
      toast.error(t('alreadyCheckedIn'));
      return;
    }

    try {
      setActionLoading(true);
      const res = await axios.post(`/attendances/checkin/${currentUserId}`);

      if (res.data.success) {
        toast.success(t('checkInSuccess'));
        await fetchAttendanceData();
        await fetchTodayAttendance();
      } else {
        toast.error(t('checkInFailed'));
      }
    } catch (err) {
      console.error('Check-in error:', err);
      toast.error(t('checkInError'));
    } finally {
      setActionLoading(false);
    }
  };

  // Handle check-out with confirm
  const handleCheckOut = () => {
    if (!todayAttendance.isCheckedIn) {
      toast.error(t('attendance.needCheckInFirst'));
      return;
    }
    setShowConfirmModal(true);
  };

  const performCheckout = async () => {
    try {
      setActionLoading(true);
      const res = await axios.post(`/attendances/checkout/${currentUserId}`);

      if (res.data.success) {
        toast.success(t('attendance.checkOutSuccess'));
        await fetchAttendanceData();
        await fetchTodayAttendance();
        setShowConfirmModal(false);
      } else {
        toast.error(t('attendance.checkOutFailed'));
      }
    } catch (err) {
      console.error('Check-out error:', err);
      toast.error(t('attendance.checkOutError'));
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_time':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'late':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'early_leave':
        return <LogOut className="w-4 h-4 text-orange-600" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'on_leave':
        return <CalendarX className="w-4 h-4 text-blue-600" />;
      case 'late_and_early_leave':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <MinusCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Monthly status
  const monthlyStats = {
    workingDays: attendanceData.filter(
      (d) => !['on_leave'].includes(d.status) && d.checkIn,
    ).length,
    onTime: attendanceData.filter((d) => d.status === 'on_time').length,
    late: attendanceData.filter(
      (d) => d.status === 'late' || d.status === 'late_and_early_leave',
    ).length,
    absent: attendanceData.filter((d) => d.status === 'absent').length,
    totalHours: attendanceData.reduce(
      (sum, d) => sum + (d.workingHours || 0),
      0,
    ),
  };
  // priority of stt
  const statusPriority: Record<string, number> = {
    late: 1,
    early_leave: 2,
    absent: 3,
    on_leave: 4,
    late_and_early_leave: 5,
    on_time: 6,
  };

  const sortedAttendance = [...attendanceData].sort((a, b) => {
    const priorityA = statusPriority[a.status] || 99;
    const priorityB = statusPriority[b.status] || 99;

    // if same stt sort by date
    if (priorityA === priorityB) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }

    return priorityA - priorityB;
  });

  console.log('sorted attendance:', sortedAttendance);
  const formatTime = (dateString: string | null) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: (date.getMonth() + 1).toString().padStart(2, '0'),
      weekday: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">{t('loadingAttendance')}</p>
      </div>
    );
  }

  if (error) {
    <ErrorState
      error={error}
      onRetry={fetchAttendanceData}
      t={t}
      supportEmail="it-support@mycompany.com"
    />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('attendance.title')}
          </h1>
          <p className="text-gray-600">
            {t('attendance.greeting', { name: employee?.name })}
          </p>
        </div>

        {/* Current Time & Today's Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Clock & Check-in/out Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
                {currentTime.toLocaleTimeString('vi-VN')}
              </div>
              <div className="text-sm text-gray-500">
                {currentTime.toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            <div className="space-y-4">
              {!todayAttendance.checkIn ? (
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                  {actionLoading
                    ? t('attendance.processing')
                    : t('attendance.checkInButton')}
                </button>
              ) : !todayAttendance.checkOut ? (
                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                  {actionLoading
                    ? t('attendance.processing')
                    : t('attendance.checkOutButton')}
                </button>
              ) : (
                <div className="text-center text-green-600 font-medium">
                  {t('attendance.done')}
                </div>
              )}

              {/* Location indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{t('attendance.locationOfCompany')}</span>
              </div>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('attendance.todaySummary')}
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {t('attendance.checkInTime')}
                </span>
                <span className="font-medium">
                  {todayAttendance.checkIn || '--:--'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {t('attendance.checkOutTime')}
                </span>
                <span className="font-medium">
                  {todayAttendance.checkOut || '--:--'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {t('attendance.workingHours')}
                </span>
                <span className="font-medium">
                  {todayAttendance.workingHours > 0
                    ? `${todayAttendance.workingHours}h`
                    : '--h'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('attendance.status')}</span>
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(todayAttendance.status)}`}
                >
                  {getStatusIcon(todayAttendance.status)}
                  {getStatusText(todayAttendance.status, t)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {t('attendance.workingDays')}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {monthlyStats.workingDays}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {t('attendance.onTime')}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {monthlyStats.onTime}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('attendance.late')}</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {monthlyStats.late}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {t('attendance.totalHours')}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {monthlyStats.totalHours.toFixed(1)}h
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Monthly Attendance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('attendance.AttendanceTable')}
            </h3>
            <div className="flex items-center gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {t('attendance.month')} {i + 1}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
                <option value={2023}>2023</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('attendance.Date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('attendance.weekDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('attendance.comingTime')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('attendance.outTime')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('attendance.totalHours')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('attendance.status')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAttendance.map((record, index) => {
                  const dateInfo = formatDate(record.date);
                  const date = new Date(record.date);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  return (
                    <tr key={index} className={isWeekend ? 'bg-gray-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dateInfo.day}/{dateInfo.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dateInfo.weekday}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(record.checkIn)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(record.checkOut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.workingHours > 0
                          ? `${record.workingHours}h`
                          : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!isWeekend ? (
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}
                          >
                            {getStatusIcon(record.status)}
                            {getStatusText(record.status, t)}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {t('attendance.weekend')}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {attendanceData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('attendance.noDataInMonth')}</p>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        open={showConfirmModal}
        title={t('attendance.confirmCheckoutTitle')}
        message={t('attendance.confirmCheckoutMessage')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        loading={actionLoading}
        onConfirm={performCheckout}
        onCancel={() => setShowConfirmModal(false)}
        icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
      />
    </div>
  );
}

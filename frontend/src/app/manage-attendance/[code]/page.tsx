'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { formatTime, getStatusColor, getStatusText } from '@/lib/utils';
import {
  AttendanceCalendarParam,
  attendanceDetailData,
  EmployeeAttendanceDetail,
} from '@/types/attendance.type';
import axios from '@/lib/axios';
import { useTranslation } from 'react-i18next';

// Attendance Calendar Component
const AttendanceCalendar = ({
  employee,
  attendanceData,
  onBack,
  month,
  year,
  onMonthYearChange,
}: AttendanceCalendarParam & {
  onMonthYearChange: (month: number, year: number) => void;
}) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const currentDate = new Date();
  const currentMonth = month ? month - 1 : new Date().getMonth();
  const currentYear = year ?? new Date().getFullYear();

  // Get month names based on current language
  const getMonthNames = () => {
    if (i18n.language === 'vi') {
      return [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12',
      ];
    } else {
      return [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
    }
  };

  // Get day names based on current language
  const getDayNames = () => {
    if (i18n.language === 'vi') {
      return ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    } else {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    }
  };

  const monthNames = getMonthNames();
  const dayNames = getDayNames();

  // Generate months and years for selectors
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYearValue = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYearValue - 2 + i);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const getAttendanceForDate = (
    date: number,
  ): attendanceDetailData | undefined => {
    const dateObj = new Date(currentYear, currentMonth, date);
    dateObj.setDate(dateObj.getDate() + 1);

    const dateStr = dateObj.toISOString().split('T')[0];
    console.log('dateStr', dateStr);
    return attendanceData.find((record) => record.date === dateStr);
  };

  const handleClickDate = (date: number) => {
    const d = new Date(currentYear, currentMonth, date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    router.push(`/manage-attendance/detail/${employee.code}?date=${dateStr}`);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    onMonthYearChange(newMonth, currentYear);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    onMonthYearChange(month ?? new Date().getMonth() + 1, newYear);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
          {t('common.back')}
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{employee.name}</h2>
          <p className="text-gray-600">
            {t('common.employeeCode')}: {employee.code}
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-300">
          <h3 className="text-xl font-semibold text-gray-800">
            {t('attendance.AttendanceTable')} - {monthNames[currentMonth]}{' '}
            {currentYear}
          </h3>

          {/* Month and Year selectors */}
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={month ?? new Date().getMonth() + 1}
              onChange={handleMonthChange}
              className="border rounded px-2 py-1 text-sm border-gray-300"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {i18n.language === 'vi' ? `Tháng ${m}` : `Month ${m}`}
                </option>
              ))}
            </select>
            <select
              value={year ?? new Date().getFullYear()}
              onChange={handleYearChange}
              className="border rounded px-2 py-1 text-sm border-gray-300"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6">
          {/* Legend */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              {t('common.legend')}:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>{t('attendance.attendanceStatus.on_time')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                <span>{t('attendance.attendanceStatus.late')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                <span>{t('attendance.attendanceStatus.early_leave')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                <span>{t('attendance.attendanceStatus.absent')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
                <span>{t('attendance.attendanceStatus.on_leave')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>
                  {t('attendance.attendanceStatus.late_and_early_leave')}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          {attendanceData.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-green-800 text-sm font-medium">
                  {t('attendance.attendanceStatus.on_time')}
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {attendanceData.filter((a) => a.status === 'on_time').length}
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="text-yellow-800 text-sm font-medium">
                  {t('attendance.attendanceStatus.late')}
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    attendanceData.filter(
                      (a) =>
                        a.status === 'late' ||
                        a.status === 'late_and_early_leave',
                    ).length
                  }
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="text-red-800 text-sm font-medium">
                  {t('attendance.attendanceStatus.absent')}
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {attendanceData.filter((a) => a.status === 'absent').length}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-purple-800 text-sm font-medium">
                  {t('attendance.attendanceStatus.on_leave')}
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {attendanceData.filter((a) => a.status === 'on_leave').length}
                </div>
              </div>
            </div>
          )}

          {/* Header days */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-3 text-center font-semibold text-gray-700 bg-blue-100 rounded-lg"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar body */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for first week */}
            {Array.from({ length: firstDayOfMonth }, (_, i) => (
              <div key={`empty-${i}`} className="p-3 h-24"></div>
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const date = i + 1;
              const attendance = getAttendanceForDate(date);
              const dayObj = new Date(currentYear, currentMonth, date);
              const isWeekend = dayObj.getDay() === 0 || dayObj.getDay() === 6;
              const isFuture = dayObj > currentDate;

              return (
                <div
                  key={date}
                  onClick={() =>
                    !isFuture && !isWeekend && handleClickDate(date)
                  }
                  className={`p-3 h-28 border rounded-lg transition cursor-pointer border-gray-300 ${
                    isWeekend ? 'bg-gray-50' : 'bg-white'
                  } ${isFuture ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  <div className="font-semibold text-gray-800 mb-1">{date}</div>
                  {attendance && !isWeekend && (
                    <div className="space-y-1">
                      <div
                        className={`text-xs px-2 py-1 rounded border ${getStatusColor(
                          attendance.status,
                        )}`}
                      >
                        {getStatusText(attendance.status)}
                      </div>
                      {attendance.checkIn && (
                        <div className="text-xs text-gray-600">
                          {t('attendance.checkIn')}:{' '}
                          {formatTime(attendance.checkIn)}
                        </div>
                      )}
                      {attendance.checkOut && (
                        <div className="text-xs text-gray-600">
                          {t('attendance.checkOut')}:{' '}
                          {formatTime(attendance.checkOut)}
                        </div>
                      )}
                    </div>
                  )}
                  {isWeekend && (
                    <div className="text-xs text-gray-400 text-center mt-2">
                      {t('attendance.weekend')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AttendanceDetailPage() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const code = params.code;
  const initialMonth = searchParams.get('month')
    ? parseInt(searchParams.get('month')!)
    : new Date().getMonth() + 1;
  const initialYear = searchParams.get('year')
    ? parseInt(searchParams.get('year')!)
    : new Date().getFullYear();

  const [employee, setEmployee] = useState<EmployeeAttendanceDetail>();
  const [attendanceData, setAttendanceData] = useState<attendanceDetailData[]>(
    [],
  );
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`attendances/summary/${code}`, {
          params: { year: currentYear, month: currentMonth },
        });

        const data = res.data;
        if (data.success) {
          setEmployee(data.data.data.employee);
          setAttendanceData(data.data.data.attendanceData);
        } else {
          setError(data.message || t('attendance.errorLoading'));
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setError(t('attendance.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchData();
    }
  }, [code, currentMonth, currentYear, t]);

  const handleMonthYearChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);

    // Update URL params
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('month', month.toString());
    newSearchParams.set('year', year.toString());

    router.replace(`/manage-attendance/${code}?${newSearchParams.toString()}`, {
      scroll: false,
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">
            {t('attendance.loadingAttendance')}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="mx-auto h-16 w-16"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-800">
            {t('attendance.errorLoading')}
          </h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('attendance.retry')}
          </button>
        </div>
      </div>
    );
  }

  // No employee data
  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t('common.noData')}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <AttendanceCalendar
      employee={employee}
      attendanceData={attendanceData}
      onBack={() => router.back()}
      month={currentMonth}
      year={currentYear}
      onMonthYearChange={handleMonthYearChange}
    />
  );
}

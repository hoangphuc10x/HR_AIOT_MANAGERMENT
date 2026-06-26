'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  XCircle,
  ChevronUp,
  ChevronDown,
  Search,
  Download,
} from 'lucide-react';
import { ApiResponse, EmployeeAttendance } from '@/types/attendance.type';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/lib/axios';
import PaginationClient from '@/components/common/ui/pagination/PaginationClient';
import { useTranslation } from 'react-i18next';
import { handleExportAttendanceByMonth } from '@/lib/utils';

type SortField =
  | 'name'
  | 'code'
  | 'total_on_time'
  | 'total_late'
  | 'total_leave_early'
  | 'total_absent'
  | 'total_on_leave'
  | 'total_late_and_leave_early'
  | 'total_days';
type SortDirection = 'asc' | 'desc';

// Main Dashboard Component
const AttendanceManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'leave-requests'>(
    'attendance',
  );
  const [employees, setEmployees] = useState<EmployeeAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const month = searchParams.get('month')
    ? parseInt(searchParams.get('month')!)
    : new Date().getMonth() + 1;
  const year = searchParams.get('year')
    ? parseInt(searchParams.get('year')!)
    : new Date().getFullYear();

  // fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const res = await axios.get<ApiResponse>(`/attendances/summary`, {
          params: { month, year },
        });

        const apiResponse = res.data;

        if (!apiResponse.success) {
          throw new Error(apiResponse.message || t('attendance.errorLoading'));
        }

        // Transform API data to Employee format
        const transformedEmployees: EmployeeAttendance[] = apiResponse.data.map(
          (summary) => ({
            id: summary.user_id,
            name: summary.full_name,
            email: summary.email,
            code: summary.code,
            avatar: '',
            attendanceSummary: summary,
          }),
        );

        setEmployees(transformedEmployees);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t('attendance.errorLoading'),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [month, year, t]);

  const openDetailAttendance = (employee: EmployeeAttendance) => {
    const code = employee.code;
    router.push(`/manage-attendance/${code}?month=${month}&year=${year}`);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/manage-attendance?month=${e.target.value}&year=${year}`);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/manage-attendance?month=${month}&year=${e.target.value}`);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return null;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="inline w-4 h-4" />
    ) : (
      <ChevronDown className="inline w-4 h-4" />
    );
  };

  // Filter and sort employees
  const filteredAndSortedEmployees = employees
    .filter((employee) => {
      const matchSearch =
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.code.toLowerCase().includes(searchTerm.toLowerCase());

      if (!filterStatus) return matchSearch;

      const summary = employee.attendanceSummary;
      if (!summary) return false;

      switch (filterStatus) {
        case 'onTime':
          return parseInt(summary.total_on_time) > 0;
        case 'late':
          return (
            parseInt(summary.total_late) > 0 ||
            parseInt(summary.total_late_and_leave_early) > 0
          );
        case 'leaveEarly':
          return parseInt(summary.total_leave_early) > 0;
        case 'absent':
          return parseInt(summary.total_absent) > 0;
        case 'lateAndLeaveEarly':
          return parseInt(summary.total_late_and_leave_early) > 0;
        case 'onLeave':
          return parseInt(summary.total_on_leave) > 0;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'code':
          aValue = a.code;
          bValue = b.code;
          break;
        case 'total_days':
          aValue = a.attendanceSummary
            ? parseInt(a.attendanceSummary.total_on_time) +
              parseInt(a.attendanceSummary.total_late) +
              parseInt(a.attendanceSummary.total_leave_early) +
              parseInt(a.attendanceSummary.total_absent) +
              parseInt(a.attendanceSummary.total_on_leave) +
              parseInt(a.attendanceSummary.total_late_and_leave_early)
            : 0;
          bValue = b.attendanceSummary
            ? parseInt(b.attendanceSummary.total_on_time) +
              parseInt(b.attendanceSummary.total_late) +
              parseInt(b.attendanceSummary.total_leave_early) +
              parseInt(b.attendanceSummary.total_absent) +
              parseInt(b.attendanceSummary.total_on_leave) +
              parseInt(b.attendanceSummary.total_late_and_leave_early)
            : 0;
          break;
        default:
          aValue = a.attendanceSummary
            ? parseInt(
                a.attendanceSummary[
                  sortField as keyof typeof a.attendanceSummary
                ] as string,
              )
            : 0;
          bValue = b.attendanceSummary
            ? parseInt(
                b.attendanceSummary[
                  sortField as keyof typeof b.attendanceSummary
                ] as string,
              )
            : 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  const totalItems = filteredAndSortedEmployees.length;

  const paginatedEmployees = filteredAndSortedEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-600" />
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

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );

  // Calculate summary stats
  const summaryStats = {
    onTime: employees.filter(
      (e) =>
        e.attendanceSummary && parseInt(e.attendanceSummary.total_on_time) > 0,
    ).length,

    late: employees.filter(
      (e) =>
        e.attendanceSummary &&
        (parseInt(e.attendanceSummary.total_late) > 0 ||
          parseInt(e.attendanceSummary.total_late_and_leave_early) > 0),
    ).length,

    leaveEarly: employees.filter(
      (e) =>
        e.attendanceSummary &&
        parseInt(e.attendanceSummary.total_leave_early) > 0,
    ).length,

    absent: employees.filter(
      (e) =>
        e.attendanceSummary && parseInt(e.attendanceSummary.total_absent) > 0,
    ).length,

    lateAndLeaveEarly: employees.filter(
      (e) =>
        e.attendanceSummary &&
        parseInt(e.attendanceSummary.total_late_and_leave_early) > 0,
    ).length,

    onLeave: employees.filter(
      (e) =>
        e.attendanceSummary && parseInt(e.attendanceSummary.total_on_leave) > 0,
    ).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t('attendance.attendanceManagement')}
          </h1>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'attendance'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <UserCheck size={20} />
              {t('attendance.attendanceManagement')}
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <select
                value={month}
                onChange={handleMonthChange}
                className="border rounded px-2 py-1 text-sm border-gray-300"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {t('attendance.month')} {m}
                  </option>
                ))}
              </select>
              <select
                value={year}
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Pills */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() =>
              setFilterStatus(filterStatus === 'onTime' ? null : 'onTime')
            }
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === 'onTime'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {t('attendance.attendanceStatus.on_time')}: {summaryStats.onTime}
          </button>

          <button
            onClick={() =>
              setFilterStatus(filterStatus === 'late' ? null : 'late')
            }
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === 'late'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {t('attendance.attendanceStatus.late')}: {summaryStats.late}
          </button>

          <button
            onClick={() =>
              setFilterStatus(
                filterStatus === 'leaveEarly' ? null : 'leaveEarly',
              )
            }
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === 'leaveEarly'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-800'
            }`}
          >
            {t('attendance.attendanceStatus.early_leave')}:{' '}
            {summaryStats.leaveEarly}
          </button>

          <button
            onClick={() =>
              setFilterStatus(filterStatus === 'absent' ? null : 'absent')
            }
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === 'absent'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {t('attendance.attendanceStatus.absent')}: {summaryStats.absent}
          </button>

          <button
            onClick={() =>
              setFilterStatus(
                filterStatus === 'lateAndLeaveEarly'
                  ? null
                  : 'lateAndLeaveEarly',
              )
            }
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === 'lateAndLeaveEarly'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {t('attendance.attendanceStatus.late_and_early_leave')}:{' '}
            {summaryStats.lateAndLeaveEarly}
          </button>

          <button
            onClick={() =>
              setFilterStatus(filterStatus === 'onLeave' ? null : 'onLeave')
            }
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === 'onLeave'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-800'
            }`}
          >
            {t('attendance.attendanceStatus.on_leave')}: {summaryStats.onLeave}
          </button>

          {filterStatus && (
            <button
              onClick={() => setFilterStatus(null)}
              className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div>
          {/* Search Bar + Export Button */}
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 " />
              <input
                type="text"
                placeholder={t('attendance.employee')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full max-w-md border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
              />
            </div>

            <button
              onClick={() => handleExportAttendanceByMonth(month, year, true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              <Download className="w-4 h-4" />
              {t('attendance.exportReport')} ({t('attendance.date')})
            </button>
            <button
              onClick={() => handleExportAttendanceByMonth(month, year, false)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              <Download className="w-4 h-4" />
              {t('attendance.exportReport')} ({t('attendance.employee')})
            </button>
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          {t('common.showing')} {filteredAndSortedEmployees.length}{' '}
          {t('attendance.employee').toLowerCase()}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden border-gray-300">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="w-46 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      {t('attendance.employee')} {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('total_on_time')}
                      className="flex items-center gap-1 hover:text-gray-700 mx-auto"
                    >
                      {t('attendance.attendanceStatus.on_time')}{' '}
                      {getSortIcon('total_on_time')}
                    </button>
                  </th>
                  <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('total_late')}
                      className="flex items-center gap-1 hover:text-gray-700 mx-auto"
                    >
                      {t('attendance.attendanceStatus.late')}{' '}
                      {getSortIcon('total_late')}
                    </button>
                  </th>
                  <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('total_leave_early')}
                      className="flex items-center gap-1 hover:text-gray-700 mx-auto"
                    >
                      {t('attendance.attendanceStatus.early_leave')}{' '}
                      {getSortIcon('total_leave_early')}
                    </button>
                  </th>
                  <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('total_absent')}
                      className="flex items-center gap-1 hover:text-gray-700 mx-auto"
                    >
                      {t('attendance.attendanceStatus.absent')}{' '}
                      {getSortIcon('total_absent')}
                    </button>
                  </th>
                  <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('total_on_leave')}
                      className="flex items-center gap-1 hover:text-gray-700 mx-auto"
                    >
                      {t('attendance.attendanceStatus.on_leave')}{' '}
                      {getSortIcon('total_on_leave')}
                    </button>
                  </th>
                  <th className="w-28 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('total_late_and_leave_early')}
                      className="flex items-center gap-1 hover:text-gray-700 mx-auto"
                    >
                      {t('attendance.attendanceStatus.late_and_early_leave')}{' '}
                      {getSortIcon('total_late_and_leave_early')}
                    </button>
                  </th>
                  <th className="w-28 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((employee) => {
                    const summary = employee.attendanceSummary;
                    if (!summary) return null;

                    return (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-semibold text-sm">
                                {employee.name.charAt(0)}
                              </span>
                            </div>
                            <div className="truncate">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {employee.name}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {employee.code}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-green-600 font-medium text-center">
                          {summary.total_on_time}
                        </td>
                        <td className="px-6 py-4 text-sm text-yellow-600 font-medium text-center">
                          {summary.total_late}
                        </td>
                        <td className="px-6 py-4 text-sm text-orange-600 font-medium text-center">
                          {summary.total_leave_early}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600 font-medium text-center">
                          {summary.total_absent}
                        </td>
                        <td className="px-6 py-4 text-sm text-blue-600 font-medium text-center">
                          {summary.total_on_leave}
                        </td>
                        <td className="px-6 py-4 text-sm text-purple-600 font-medium text-center">
                          {summary.total_late_and_leave_early}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openDetailAttendance(employee)}
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1 shadow-sm"
                            >
                              {t('attendance.detail')}
                            </button>
                            <button
                              onClick={() =>
                                handleExportAttendanceByMonth(
                                  month,
                                  year,
                                  true,
                                  employee.code,
                                )
                              }
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors flex items-center gap-1 shadow-sm"
                            >
                              Export
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {searchTerm
                        ? `No employees found matching "${searchTerm}"`
                        : t('attendance.noDataInMonth')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PaginationClient
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            t={t}
          />
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagementDashboard;

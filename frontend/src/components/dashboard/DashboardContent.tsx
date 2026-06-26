'use client';

import axios from '@/lib/axios';
import {
  getEmployeeStatusClass,
  getEmployeeStatusText,
  getRankingBadgeClass,
} from '@/lib/utils';
import { COLORS } from '@/types/common/common';
import {
  Building2,
  Calendar,
  FileText,
  TrendingDown,
  User,
  Users,
} from '@/types/common/icon';
import {
  ApiResponse,
  DepartmentStats,
  DepartmentWithRate,
  MonthlyAbsence,
  OverviewData,
  TopAbsentEmployee,
} from '@/types/dashboard.type';
import { AlertTriangle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  PieLabelRenderProps,
} from 'recharts';
import { CustomBarTooltip, CustomLineTooltip } from '../common/ui/tooltip';
import { useTranslation } from 'react-i18next';

// service functions with proper typing
const apiService = {
  async fetchOverview(): Promise<OverviewData> {
    const res: { data: ApiResponse<OverviewData> } = await axios.get(
      '/dashboard/overview',
    );
    return res.data.data;
  },

  async fetchDepartmentStats(): Promise<DepartmentStats[]> {
    const res: { data: ApiResponse<DepartmentStats[]> } = await axios.get(
      '/dashboard/department-stats',
    );
    return res.data.data;
  },

  async fetchTopAbsentEmployees(): Promise<TopAbsentEmployee[]> {
    const res: { data: ApiResponse<TopAbsentEmployee[]> } = await axios.get(
      '/dashboard/top-absent-employees',
    );
    return res.data.data;
  },

  async fetchMonthlyAbsences(): Promise<MonthlyAbsence[]> {
    const res: { data: ApiResponse<MonthlyAbsence[]> } = await axios.get(
      '/dashboard/monthly-absences',
    );
    return res.data.data;
  },
};

// Main Dashboard component
export default function DashboardContent() {
  const { t } = useTranslation();

  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentStats[]>([]);
  const [topEmployeesData, setTopEmployeesData] = useState<TopAbsentEmployee[]>(
    [],
  );
  const [monthlyData, setMonthlyData] = useState<MonthlyAbsence[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [overview, departments, topEmployees, monthly]: [
          OverviewData,
          DepartmentStats[],
          TopAbsentEmployee[],
          MonthlyAbsence[],
        ] = await Promise.all([
          apiService.fetchOverview(),
          apiService.fetchDepartmentStats(),
          apiService.fetchTopAbsentEmployees(),
          apiService.fetchMonthlyAbsences(),
        ]);

        setOverviewData(overview);
        setDepartmentData(departments);
        setTopEmployeesData(topEmployees);
        setMonthlyData(monthly);
      } catch (err: unknown) {
        console.error('Error fetching dashboard data:', err);
        const errorMessage =
          err instanceof Error ? err.message : t('dashboard.unknownError');
        setError(`${t('dashboard.loadError')} ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [t]);

  const handleRetry = (): void => {
    window.location.reload();
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('dashboard.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!overviewData) {
    return <DashboardSkeleton />;
  }

  // Calculate department rates
  const departmentWithRate: DepartmentWithRate[] = departmentData.map(
    (dept: DepartmentStats) => ({
      ...dept,
      rate:
        dept.employees > 0
          ? Number((((dept.absences / dept.employees) * 100) / 250).toFixed(1))
          : 0.0,
    }),
  );

  // Find monthly statistics
  const monthsWithData: MonthlyAbsence[] = monthlyData.filter(
    (month: MonthlyAbsence) => month.absences > 0,
  );

  const maxAbsenceMonth: MonthlyAbsence | null =
    monthsWithData.length > 0
      ? monthsWithData.reduce((max: MonthlyAbsence, month: MonthlyAbsence) =>
          month.absences > max.absences ? month : max,
        )
      : null;

  const minAbsenceMonth: MonthlyAbsence | null =
    monthsWithData.length > 0
      ? monthsWithData.reduce((min: MonthlyAbsence, month: MonthlyAbsence) =>
          month.absences < min.absences ? month : min,
        )
      : null;

  const avgMonthlyAbsences: string =
    monthsWithData.length > 0
      ? (
          monthsWithData.reduce(
            (sum: number, month: MonthlyAbsence) => sum + month.absences,
            0,
          ) / monthsWithData.length
        ).toFixed(1)
      : '0';

  const totalWorkDays: number = monthlyData.reduce(
    (sum: number, month: MonthlyAbsence) => sum + month.workDays,
    0,
  );

  const totalAbsences: number = monthlyData.reduce(
    (sum: number, month: MonthlyAbsence) => sum + month.absences,
    0,
  );

  const avgAbsenceRate: string =
    totalWorkDays > 0
      ? (
          (totalAbsences / (overviewData.totalEmployees * totalWorkDays)) *
          100
        ).toFixed(1)
      : '0';

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('dashboard.title')}</h1>
            <p className="text-blue-100">{t('dashboard.subtitle')}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100">{t('dashboard.today')}</p>
            <p className="text-2xl font-bold">
              {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('dashboard.stats.totalEmployees')}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {overviewData.totalEmployees}
              </p>
              <p className="text-sm text-blue-600">
                {t('dashboard.stats.currentEmployees')}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('dashboard.stats.absentToday')}
              </p>
              <p className="text-3xl font-bold text-red-600">
                {overviewData.absentToday}
              </p>
              <p className="text-sm text-red-600">
                {overviewData.totalEmployees > 0
                  ? (
                      (overviewData.absentToday / overviewData.totalEmployees) *
                      100
                    ).toFixed(1)
                  : '0'}
                % {t('dashboard.stats.ofTotalEmployees')}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('dashboard.stats.absentThisMonth')}
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {overviewData.absentThisMonth}
              </p>
              <p className="text-sm text-orange-600">
                {t('dashboard.stats.totalAbsenceDaysMonth')}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('dashboard.stats.avgAbsenceRate')}
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {overviewData.averageAbsenceRate.toFixed(1)}%
              </p>
              <p className="text-sm text-green-600">
                {overviewData.averageAbsenceRate < 5
                  ? t('dashboard.stats.normalLevel')
                  : t('dashboard.stats.needMonitoring')}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Department Absence Statistics */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            {t('dashboard.departmentStats.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={departmentWithRate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                />
                <YAxis />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="absences" fill="#3B82F6" name="absences" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div>
            <ResponsiveContainer width="100%" height={500}>
              <PieChart>
                <Pie
                  data={departmentWithRate}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value, payload }: PieLabelRenderProps) => {
                    const { name } = payload as DepartmentWithRate;
                    return `${name}: ${value}`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="absences"
                >
                  {departmentWithRate.map(
                    (entry: DepartmentWithRate, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ),
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Rankings */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">
            {t('dashboard.departmentStats.ranking')}
          </h3>
          <div className="space-y-3">
            {departmentWithRate
              .sort(
                (a: DepartmentWithRate, b: DepartmentWithRate) =>
                  b.absences - a.absences,
              )
              .slice(0, 5)
              .map((dept: DepartmentWithRate, index: number) => (
                <div
                  key={dept.name}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${getRankingBadgeClass(index)}`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{dept.name}</p>
                      <p className="text-sm text-gray-600">
                        {dept.employees}{' '}
                        {t('dashboard.departmentStats.employees')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      {dept.absences} {t('dashboard.departmentStats.days')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('dashboard.departmentStats.rate')}: {dept.rate}%
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Top Absent Employees */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-300">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          {t('dashboard.topEmployees.title')}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">
                  {t('dashboard.topEmployees.ranking')}
                </th>
                <th className="text-left py-3 px-4">
                  {t('dashboard.topEmployees.fullName')}
                </th>
                <th className="text-left py-3 px-4">
                  {t('dashboard.topEmployees.department')}
                </th>
                <th className="text-left py-3 px-4">
                  {t('dashboard.topEmployees.position')}
                </th>
                <th className="text-left py-3 px-4">
                  {t('dashboard.topEmployees.absenceDays')}
                </th>
                <th className="text-left py-3 px-4">
                  {t('dashboard.topEmployees.status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {topEmployeesData
                .slice(0, 10)
                .map((employee: TopAbsentEmployee, index: number) => (
                  <tr
                    key={employee.userId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${getRankingBadgeClass(index)}`}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold">{employee.name}</td>
                    <td className="py-3 px-4">{employee.department}</td>
                    <td className="py-3 px-4">#{employee.position}</td>
                    <td className="py-3 px-4">
                      <span className="text-red-600 font-semibold">
                        {employee.absences}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getEmployeeStatusClass(employee.absences)}`}
                      >
                        {getEmployeeStatusText(employee.absences, t)}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Absence Trends */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-300">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          {t('dashboard.monthlyTrends.title')}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomLineTooltip />} />
                <Line
                  type="monotone"
                  dataKey="absences"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                  name="absences"
                />
                <Line
                  type="monotone"
                  dataKey="workDays"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="workDays"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {maxAbsenceMonth && (
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                <h4 className="font-semibold text-red-800">
                  {t('dashboard.monthlyTrends.maxAbsenceMonth')}
                </h4>
                <p className="text-2xl font-bold text-red-600">
                  {maxAbsenceMonth.month}
                </p>
                <p className="text-sm text-red-600">
                  {maxAbsenceMonth.absences}{' '}
                  {t('dashboard.monthlyTrends.absenceDays')}
                </p>
              </div>
            )}
            {minAbsenceMonth && (
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <h4 className="font-semibold text-green-800">
                  {t('dashboard.monthlyTrends.minAbsenceMonth')}
                </h4>
                <p className="text-2xl font-bold text-green-600">
                  {minAbsenceMonth.month}
                </p>
                <p className="text-sm text-green-600">
                  {minAbsenceMonth.absences}{' '}
                  {t('dashboard.monthlyTrends.absenceDays')}
                </p>
              </div>
            )}
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <h4 className="font-semibold text-blue-800">
                {t('dashboard.monthlyTrends.avgPerMonth')}
              </h4>
              <p className="text-2xl font-bold text-blue-600">
                {avgMonthlyAbsences}
              </p>
              <p className="text-sm text-blue-600">
                {t('dashboard.monthlyTrends.absenceDays')}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
              <h4 className="font-semibold text-purple-800">
                {t('dashboard.monthlyTrends.avgAbsenceRate')}
              </h4>
              <p className="text-2xl font-bold text-purple-600">
                {avgAbsenceRate}%
              </p>
              <p className="text-sm text-purple-600">
                {t('dashboard.monthlyTrends.ofTotalWorkDays')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome Section Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-blue-500 rounded w-64 mb-2"></div>
            <div className="h-4 bg-blue-500 rounded w-96"></div>
          </div>
          <div>
            <div className="h-4 bg-blue-500 rounded w-20 mb-2"></div>
            <div className="h-6 bg-blue-500 rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="h-6 bg-gray-200 rounded w-64 mb-6"></div>
        <div className="h-80 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

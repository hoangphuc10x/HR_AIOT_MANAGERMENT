'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';

export default function AttendanceContent() {
  const { t, i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && i18n.isInitialized) {
      setIsReady(true);
    }
  }, [i18n.isInitialized]);

  const attendanceData = [
    {
      id: 1,
      name: 'Marshall Nichols',
      date: '2024-01-15',
      checkIn: '09:00',
      checkOut: '17:30',
      status: 'Present',
    },
    {
      id: 2,
      name: 'John Doe',
      date: '2024-01-15',
      checkIn: '08:45',
      checkOut: '17:15',
      status: 'Present',
    },
    {
      id: 3,
      name: 'Jane Smith',
      date: '2024-01-15',
      checkIn: '09:30',
      checkOut: '17:00',
      status: 'Late',
    },
    {
      id: 4,
      name: 'Mike Johnson',
      date: '2024-01-15',
      checkIn: '-',
      checkOut: '-',
      status: 'Absent',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isReady) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('attendance.attendanceManagement')}
          </h1>
          <p className="text-gray-600">{t('attendance.description')}</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          {t('attendance.exportReport')}
        </Button>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('attendance.todayAttendance')}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('attendance.employee')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('attendance.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('attendance.checkIn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('attendance.checkOut')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('attendance.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.checkIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.checkOut}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(record.status)}>
                      {t(`attendance.${record.status.toLowerCase()}`)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="outline" size="sm">
                      {t('common.edit')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

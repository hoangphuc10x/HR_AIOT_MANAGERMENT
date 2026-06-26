/* global Blob */

import { UserStatus } from '@/enums/user-status.enum';
import { SexEnum } from '@/types/common/common';
import { clsx, type ClassValue } from 'clsx';
import i18n, { t } from 'i18next';
import { twMerge } from 'tailwind-merge';
import axios from './axios';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertRoleEnumKey(enumRole: number): string {
  const roleDict: Record<number, string> = {
    1: i18n.t('common.admin'),
    2: i18n.t('common.staff'),
  };
  return roleDict[enumRole] || i18n.t('common.unknown');
}

// export function flattenStringArray(arr: string[] | undefined): string {
//   return arr ? arr.join(', ') : '';
// }

export function flattenStringArray(arr: number[] | undefined): string[] {
  return arr ? arr.map((role) => convertRoleEnumKey(role)) : [];
}

export function convertSexEnumKey(enumSex: number): string {
  return SexEnum[enumSex] || 'OTHER';
}

// export function shortenUUID(uuid: string): string {
//   if (!uuid || uuid.length < 10) return uuid;

//   const first5 = uuid.slice(0, 5);
//   const last5 = uuid.slice(-5);
//   return `${first5}...${last5}`;
// }

export const statusKeyMap: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'active',
  [UserStatus.INACTIVE]: 'inactive',
  [UserStatus.SUSPENDED]: 'suspended',
};

export function formatDateUTC(isoString: string): string {
  if (!isoString) return '';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}

export function formatSex(sexEnum: number) {
  switch (sexEnum) {
    case 1:
      return i18n.t('employee.male');
    case 2:
      return i18n.t('employee.female');
    default:
      return i18n.t('employee.other');
  }
}
// Extract name parts
export function getNameParts(fullName: string) {
  if (!fullName) return { firstName: '', lastName: '' };
  const parts = fullName.trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
}

export function formatTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'on_time':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'absent':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'late':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'early_leave':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'on_leave':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'late_and_early_leave':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusText = (status: string) => {
  return t(`attendance.attendanceStatus.${status}`);
};

export const handleExportAttendanceByMonth = async (
  month: number,
  year: number,
  isByDate: boolean,
  code?: string,
) => {
  try {
    const params: Record<string, string | number | boolean> = {
      month,
      year,
      isByDate,
    };

    if (code) {
      params.code = code;
    }

    const response = await axios.get<Blob>(`/attendances/export`, {
      params,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    const contentDisposition = response.headers['content-disposition'];
    let fileName = `attendance_${year}_${String(month).padStart(2, '0')}.csv`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) fileName = match[1];
    }

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Export CSV failed:', error);
  }
};

import { useTranslation } from 'react-i18next';

// Get employee status text by absence count
export const getEmployeeStatusText = (
  absences: number,
  t: ReturnType<typeof useTranslation>['t'],
): string => {
  return absences > 5
    ? t('dashboard.employee.status.warning') // e.g. "Warning"
    : absences > 3
      ? t('dashboard.employee.status.monitor') // e.g. "Under monitoring"
      : t('dashboard.employee.status.normal'); // e.g. "Normal"
};

// Get CSS classes for employee status badge
export const getEmployeeStatusClass = (absences: number): string => {
  return absences > 5
    ? 'bg-red-100 text-red-800'
    : absences > 3
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-green-100 text-green-800';
};

// Get CSS classes for ranking badge by index
export const getRankingBadgeClass = (index: number): string => {
  return index === 0
    ? 'bg-red-500'
    : index === 1
      ? 'bg-orange-500'
      : index === 2
        ? 'bg-yellow-500'
        : 'bg-gray-500';
};

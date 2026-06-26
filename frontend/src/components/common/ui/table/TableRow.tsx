'use client';

import Image from 'next/image';
import { TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { flattenStringArray, formatSex } from '@/lib/utils';
import { Employee } from '@/types/common/common.type';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { fetchUserPermissions } from '@/api/user-permission';
import { toast } from 'react-toastify';
import { PermissionEnum } from '@/enums/permission.enum';
import { getDecodedToken } from '@/lib/getDecodedToken';

export default function TableRow({
  no,
  fullName,
  email,
  id,
  phone,
  roles,
  avatarUrl,
  status,
  sex,
}: Employee) {
  const router = useRouter();
  const { t } = useTranslation();
  const [userPermissions, setUserPermissions] = useState<number[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number>();

  useEffect(() => {
    const decoded = getDecodedToken();
    const userId = decoded?.userId;

    const fetchData = async () => {
      setCurrentUserId(userId);

      if (userId) {
        try {
          const permissions = await fetchUserPermissions(userId);
          setUserPermissions(permissions);
          console.log('permission employee', permissions);
        } catch (err) {
          toast.error(t('common.failToFetchPermissions'));
        }
      }
    };
    fetchData();
  }, [t]);

  const deleteUser = async () => {
    const confirmName = window.prompt(t('delete.confirmMessage', { fullName }));

    if (confirmName !== fullName) {
      alert(t('delete.nameMismatch'));
      return;
    }

    try {
      const res = await axios.delete(`/users/${id}`);

      if (!(res.status === 200)) {
        throw new Error('Failed to delete user');
      }

      alert(t('delete.success'));
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(t('delete.error'));
    }
  };

  // check permission
  const canViewAll = userPermissions.includes(PermissionEnum.VIEW_ALL_EMPLOYEE);
  const canDelete = userPermissions.includes(PermissionEnum.DELETE_EMPLOYEE);

  // if don't have permission view all then user just see only them
  const canViewThis = canViewAll || String(currentUserId) === String(id);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
        <span className="font-medium">{no}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <Image
              src={
                avatarUrl ||
                'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg'
              }
              alt="Avatar"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{fullName}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
        {phone}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            status === 1
              ? 'bg-green-100 text-green-800'
              : status === 2
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-300 text-gray-800'
          }`}
        >
          {status === 1
            ? t('employee.statusTypes.active')
            : status === 2
              ? t('employee.statusTypes.inactive')
              : t('employee.statusTypes.suspended')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
        {formatSex(sex || 0)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
        {flattenStringArray(roles)?.join(', ')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center justify-center space-x-3">
          {canViewThis && (
            <button
              onClick={() => router.push('employee/profile/' + id)}
              className="p-2 rounded-full text-blue-600 hover:text-blue-900 hover:bg-blue-100 transition"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={deleteUser}
              className="p-2 rounded-full text-red-600 hover:text-red-900 hover:bg-red-100 transition"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

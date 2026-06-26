'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Settings, Loader2 } from 'lucide-react';
import axios from '@/lib/axios';
import {
  ApiResponse,
  UserWithPermissions,
} from '@/types/employee/userWithPermissions.interface';
import { PermissionEditModal } from '@/components/permission/UserPermissionEditModal';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import PaginationClient from '@/components/common/ui/pagination/PaginationClient';

const UsersPermissionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;
  const router = useRouter();

  // Fetch data (replace with actual API call)
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/users/all/permissions');
      const sortedUsers = [...response.data.data].sort((a, b) => b.id - a.id);
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };
  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle permission save
  const handleSavePermissions = (userId: number, permissions: number[]) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, permissionCount: permissions.length }
          : user,
      ),
    );
    fetchUsers();
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={24} />
          <span className="text-gray-600">{t('userPermissions.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t('userPermissions.title')}
          </h1>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder={t('userPermissions.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-16 px-6 py-4 text-sm font-medium text-gray-700 text-left">
                    {t('userPermissions.stt')}
                  </th>
                  <th className="w-48 px-6 py-4 text-sm font-medium text-gray-700 text-left truncate">
                    {t('userPermissions.name')}
                  </th>
                  <th className="w-64 px-6 py-4 text-sm font-medium text-gray-700 text-left truncate">
                    {t('userPermissions.email')}
                  </th>
                  <th className="w-40 px-6 py-4 text-sm font-medium text-gray-700 text-center">
                    {t('userPermissions.permissionCount', { count: 0 }).replace(
                      '0 ',
                      '',
                    )}
                  </th>
                  <th className="w-40 px-6 py-4 text-sm font-medium text-gray-700 text-center">
                    {t('userPermissions.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    onClick={() => router.push(`/employee/${user.id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 truncate">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 truncate">
                      <div className="text-sm text-gray-600 truncate">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {t('userPermissions.permissionCount', {
                          count: user.permissionCount,
                        })}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => router.push(`/permissions/${user.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Settings size={16} />
                        {t('userPermissions.editPermission')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Empty State */}
          {paginatedUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('userPermissions.empty')}</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <PaginationClient
              currentPage={currentPage}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              t={t}
            />
          )}
        </div>

        {/* Permission Edit Modal */}
        {selectedUser && (
          <PermissionEditModal
            user={selectedUser}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSavePermissions}
          />
        )}
      </div>
    </div>
  );
};

export default UsersPermissionsPage;

'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Shield } from 'lucide-react';
import {
  PermissionGroup,
  UserWithPermissions,
} from '@/types/employee/userWithPermissions.interface';
import axios from '@/lib/axios';
import { getPermissionGroups } from './ListOfDescriptionsPermissions';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { getDecodedToken } from '@/lib/getDecodedToken';

export const PermissionEditModal: React.FC<{
  user: UserWithPermissions;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: number, permissions: number[]) => void;
}> = ({ user, isOpen, onClose, onSave }) => {
  const [userPermissions, setUserPermissions] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { t, i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && i18n.isInitialized) {
      setIsReady(true);
    }
  }, [i18n.isInitialized]);
  // Fetch user permissions from API
  useEffect(() => {
    if (isOpen && user?.id) {
      fetchUserPermissions();
    }
  }, [isOpen, user?.id]);
  const PERMISSION_GROUPS = getPermissionGroups(t);
  const fetchUserPermissions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/permissions/${user.id}`);
      console.log('Fetched user permissions:', response.data);

      // API response number array [1,2,3,...]
      const permissionIds: number[] = response.data.data || [];
      console.log('Extracted permission IDs:', permissionIds);

      setUserPermissions(permissionIds);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      setUserPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setUserPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSelectAllInGroup = (group: PermissionGroup) => {
    const groupPermissionIds = group.permissions.map((p) => p.id);
    const allSelected = groupPermissionIds.every((id) =>
      userPermissions.includes(id),
    );

    if (allSelected) {
      // Deselect all in group
      setUserPermissions((prev) =>
        prev.filter((id) => !groupPermissionIds.includes(id)),
      );
    } else {
      // Select all in group
      setUserPermissions((prev) => {
        const newPermissions = [...prev];
        groupPermissionIds.forEach((id) => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
        return newPermissions;
      });
    }
  };

  const handleSave = async () => {
    const decode = getDecodedToken();
    const userId = decode?.userId;

    setIsSaving(true);
    try {
      const actionId = userId;
      const response = await axios.patch(`/permissions/UpdatePermission`, {
        adminId: actionId,
        userId: user.id,
        listOfUserPermissionId: userPermissions,
      });
      console.log('Save permissions response:', response);
      console.log('Save permissions listOfUserPermissionId:', userPermissions);

      if (response.status === 200) {
        toast.success(t('permission.saveSuccess'));
        onSave(user.id, userPermissions);
        onClose();
      } else {
        toast.error(t('permission.saveFailed'));
        console.error('Failed to save permissions');
      }
    } catch (error) {
      toast.error(t('permission.saveError'));
      console.error('Error saving permissions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !isReady) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {t('permission.userPermission')}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {user.fullName} - {user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600 mr-2" size={24} />
              <span className="text-gray-600">
                {t('permission.loadingPermission')}
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              {PERMISSION_GROUPS.map((group) => {
                const groupPermissionIds = group.permissions.map((p) => p.id);
                const selectedInGroup = groupPermissionIds.filter((id) =>
                  userPermissions.includes(id),
                );
                const allSelected =
                  selectedInGroup.length === group.permissions.length;
                const someSelected =
                  selectedInGroup.length > 0 &&
                  selectedInGroup.length < group.permissions.length;

                return (
                  <div
                    key={group.title}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    {/* Group Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {group.icon}
                        <h3 className="font-semibold text-gray-800">
                          {group.title}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({selectedInGroup.length}/{group.permissions.length})
                        </span>
                      </div>
                      <button
                        onClick={() => handleSelectAllInGroup(group)}
                        className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {allSelected
                          ? t('permission.deselectAll')
                          : t('permission.selectAll')}
                      </button>
                    </div>

                    {/* Group Permissions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start gap-3 p-3 border border-gray-100 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            id={`permission-${permission.id}`}
                            checked={userPermissions.includes(permission.id)}
                            onChange={() =>
                              handlePermissionToggle(permission.id)
                            }
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`permission-${permission.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium text-gray-800 text-sm">
                              {permission.name}
                            </div>
                            {permission.description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {permission.description}
                              </div>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Shield size={16} />
                  <span className="font-medium">
                    {t('permission.overviewTitle')}
                  </span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  {t('permission.overviewDescription', {
                    count: userPermissions.length,
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {t('permission.saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
};

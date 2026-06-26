'use client';

import { useState } from 'react';

export default function PermissionSection({
  availablePermissions,
  formData,
  handlePermissionChange,
  t,
}: {
  availablePermissions: { id: number; key: string }[];
  formData: { userPermissions?: number[] };
  handlePermissionChange: (id: number) => void;
  t: (key: string) => string;
}) {
  const [showPermissions, setShowPermissions] = useState(false);

  const groupPermissions = (from: number, to?: number) =>
    availablePermissions.filter(
      (p) => p.id >= from && (to ? p.id <= to : true),
    );

  // === NEW: full permissions
  const handleSelectAll = () => {
    const allIds = availablePermissions.map((p) => p.id);
    allIds.forEach((id) => {
      if (!formData.userPermissions?.includes(id)) {
        handlePermissionChange(id);
      }
    });
  };

  // === NEW: clear all permissions
  const handleClearAll = () => {
    formData.userPermissions?.forEach((id) => {
      handlePermissionChange(id);
    });
  };

  return (
    <div className="mb-6">
      {/* Button toggle */}
      <button
        type="button"
        onClick={() => setShowPermissions(!showPermissions)}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
      >
        {showPermissions
          ? t('employee.hidePermissions')
          : t('employee.showPermissions')}
      </button>

      {/* Permissions box */}
      {showPermissions && (
        <div className="mt-4 border rounded-xl p-4 bg-gray-50 space-y-6">
          {/* Header action buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              {t('employee.selectAll')}
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition"
            >
              {t('employee.clearAll')}
            </button>
          </div>

          {/* Group 1 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              {t('permissions.permissions')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupPermissions(1, 1).map((permission) => {
                const isChecked =
                  formData.userPermissions?.includes(permission.id) || false;
                return (
                  <label
                    key={permission.id}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition 
                      ${
                        isChecked
                          ? 'bg-blue-50 border-blue-400'
                          : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handlePermissionChange(permission.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-3"
                    />
                    <span
                      className={`text-sm ${
                        isChecked
                          ? 'text-blue-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {t(`${permission.key}.name`)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Group 2–4 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              {t('permissions.employee')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupPermissions(2, 4).map((permission) => {
                const isChecked =
                  formData.userPermissions?.includes(permission.id) || false;
                return (
                  <label
                    key={permission.id}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition 
                      ${
                        isChecked
                          ? 'bg-blue-50 border-blue-400'
                          : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handlePermissionChange(permission.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-3"
                    />
                    <span
                      className={`text-sm ${
                        isChecked
                          ? 'text-blue-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {t(`${permission.key}.name`)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Group 5–11 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              {t('permissions.department')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupPermissions(5, 11).map((permission) => {
                const isChecked =
                  formData.userPermissions?.includes(permission.id) || false;
                return (
                  <label
                    key={permission.id}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition 
                      ${
                        isChecked
                          ? 'bg-blue-50 border-blue-400'
                          : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handlePermissionChange(permission.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-3"
                    />
                    <span
                      className={`text-sm ${
                        isChecked
                          ? 'text-blue-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {t(`${permission.key}.name`)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Group 12–14 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              {t('permissions.leaveRequest')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupPermissions(12, 14).map((permission) => {
                const isChecked =
                  formData.userPermissions?.includes(permission.id) || false;
                return (
                  <label
                    key={permission.id}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition 
                      ${
                        isChecked
                          ? 'bg-blue-50 border-blue-400'
                          : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handlePermissionChange(permission.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-3"
                    />
                    <span
                      className={`text-sm ${
                        isChecked
                          ? 'text-blue-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {t(`${permission.key}.name`)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

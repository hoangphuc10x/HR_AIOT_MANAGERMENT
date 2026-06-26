'use client';

import { PermissionEnum } from '@/enums/permission.enum';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

interface HeadPermissionModalProps {
  selectedPermissions?: number[];
  onClose: () => void;
  onSave: (selected: number[]) => void;
  setPermissionChanged?: (changed: boolean) => void;
}

export default function HeadPermissionModal({
  selectedPermissions,
  onClose,
  onSave,
  setPermissionChanged,
}: HeadPermissionModalProps) {
  const [selectedPermission, setSelectedPermission] = useState<number[]>([]);
  const { t, i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [initialPermissions, setInitialPermissions] = useState<number[]>([]);

  const togglePermission = (value: number) => {
    setSelectedPermission((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value],
    );
  };

  useEffect(() => {
    let initial: number[];
    if (selectedPermissions && selectedPermissions.length > 0) {
      initial = selectedPermissions;
    } else {
      initial = Object.values(PermissionEnum).filter(
        (v) => typeof v === 'number',
      ) as number[];
    }
    setSelectedPermission(initial);
    setInitialPermissions(initial);
  }, [selectedPermissions]);

  useEffect(() => {
    if (typeof window !== 'undefined' && i18n.isInitialized) {
      setIsReady(true);
    }
  }, [i18n.isInitialized]);

  const hasChanges =
    JSON.stringify(selectedPermission) !== JSON.stringify(initialPermissions);

  const handleSave = () => {
    if (selectedPermission.length === 0) {
      toast.error(t('department.atLeastOnePermission'));
      return;
    }
    onSave(selectedPermission);
    if (setPermissionChanged) {
      setPermissionChanged(hasChanges);
    }
    onClose();
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = window.confirm(t('common.confirmCloseWithoutSave'));
      if (!confirmClose) return;
    }
    onClose();
  };

  if (!isReady) return null;

  return (
    <div className="inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-[12vw] h-full max-h-[53vh] flex flex-col justify-between items-center">
        <h2 className="text-lg font-semibold mb-4">
          {t(`department.selectRole`)}
        </h2>

        {/* PERMISSION LIST */}
        <div className="h-full overflow-y-auto flex flex-col justify-around mt-4 mb-4">
          {Object.values(PermissionEnum)
            .filter((v) => typeof v === 'number')
            .map((value) => (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPermission.includes(value as number)}
                  onChange={() => togglePermission(value as number)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span>{t(`department.permission.${value}`)}</span>
              </label>
            ))}
        </div>

        {/* BUTTON */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            {t(`common.cancel`)}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t(`common.save`)}
          </button>
        </div>
      </div>
    </div>
  );
}

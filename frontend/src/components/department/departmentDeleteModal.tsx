'use client';

import axios from '@/lib/axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';
import { getDecodedToken } from '@/lib/getDecodedToken';

interface DepartmentDeleteModalProps {
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  departmentId: number;
  onDelete: () => void;
  onReload: () => void;
}

export function DepartmentDeleteModal({
  showModal,
  setShowModal,
  departmentId,
  onDelete,
  onReload,
}: DepartmentDeleteModalProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    const decode = getDecodedToken();
    const userId = decode?.userId;

    setIsLoading(true);
    try {
      const actorId = userId;
      const res = await axios.delete(`/departments/`, {
        data: { user_id: actorId, dep_id: departmentId },
      });
      if (res.data.success) {
        toast.success(t('department.deleted'));
        onDelete();
        onReload();
        setShowModal(false);
      } else {
        throw new Error(res.data.message || 'Failed to delete department');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error(t('department.failToDelete'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={() => setShowModal(false)}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">
          {t('department.deleteConfirmTitle')}
        </h2>
        <p className="mb-4">{t('department.deleteConfirmMessage')}</p>
        <p className="mb-6 text-sm text-gray-600">
          {t('department.deleteConfirmWarning')}
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => setShowModal(false)}
            disabled={isLoading}
          >
            {t('department.cancel')}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 flex items-center"
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isLoading ? t('department.deleting') : t('department.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

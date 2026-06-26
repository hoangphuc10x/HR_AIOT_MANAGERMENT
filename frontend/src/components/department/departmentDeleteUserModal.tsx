'use client';

import axios from '@/lib/axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';
import { getDecodedToken } from '@/lib/getDecodedToken';

interface RemoveMemberModalProps {
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  memberId: number | null;
  departmentId: number;
  onRemove: () => void;
}

const RemoveMemberModal: React.FC<RemoveMemberModalProps> = ({
  showModal,
  setShowModal,
  memberId,
  departmentId,
  onRemove,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const handleRemove = async () => {
    console.log(
      'handleRemove called with memberId:',
      memberId,
      'departmentId:',
      departmentId,
    ); // Debugging
    if (!memberId) return;
    setIsLoading(true);
    try {
      const decode = getDecodedToken();
      const actorId = decode?.userId;
      console.log('id actor', actorId);

      const res = await axios.delete('/departments/user', {
        data: {
          user_actor_id: actorId,
          user_id: memberId,
          dep_id: departmentId,
        },
      });

      if (res.data.success) {
        toast.success(t('department.memberRemoved'));
        onRemove();
        setShowModal(false);
      } else {
        throw new Error(res.data.message || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(t('department.failToRemoveMember'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!showModal || !memberId) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={() => setShowModal(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">
          {t('department.removeMemberConfirmTitle')}
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          {t('department.removeMemberConfirmWarning')}
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => setShowModal(false)}
          >
            {t('department.cancel')}
          </button>
          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isLoading ? t('department.removing') : t('department.remove')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveMemberModal;

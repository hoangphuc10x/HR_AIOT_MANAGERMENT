import axios from '@/lib/axios';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

interface ConfirmDeleteModalProps {
  id: number;
  setShowModal: (v: boolean) => void;
  onClose: () => void;
}
export default function ConfirmDeleteModal({
  id,
  setShowModal,
  onClose,
}: ConfirmDeleteModalProps) {
  const { t } = useTranslation();
  const handleDelete = async () => {
    try {
      const res = await axios.delete<{ data: { message: string } }>(
        `leave-request/${id}`,
      );
      toast.success(res.data.data.message);
      setShowModal(false);
      onClose();
    } catch (error) {
      toast.error('fail to delete leave request');
    }
  };

  return (
    <div
      className="fixed inset-0  z-50 flex items-center justify-center p-4"
      onClick={() => setShowModal(false)}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">
          {t('leaveRequest.delete_leave_request_confirm')}
        </h2>
        <p className="mb-4">{t('leaveRequest.delete_leave_request_warning')}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => setShowModal(false)}
          >
            {t('department.cancel')}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 flex items-center"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('department.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

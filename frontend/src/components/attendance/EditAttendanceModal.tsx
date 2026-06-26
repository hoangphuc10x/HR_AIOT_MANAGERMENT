'use client';

import React from 'react';
import { X, Save } from 'lucide-react';

interface EditAttendanceModalProps {
  show: boolean;
  editData: { checkIn: string; checkOut: string };
  updating: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: 'checkIn' | 'checkOut', value: string) => void;
  t: (key: string) => string;
}

const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({
  show,
  editData,
  updating,
  onClose,
  onSave,
  onChange,
  t,
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('attendance.updateTitle')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('attendance.checkIn')}
            </label>
            <input
              type="time"
              value={editData.checkIn}
              onChange={(e) => onChange('checkIn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('attendance.checkOut')}
            </label>
            <input
              type="time"
              value={editData.checkOut}
              onChange={(e) => onChange('checkOut', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={updating}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onSave}
            disabled={updating}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {t('common.update')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAttendanceModal;

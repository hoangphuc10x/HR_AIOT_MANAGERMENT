'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string; // bg-red-600 / bg-blue-600 ...
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onClose,
  confirmText,
  cancelText,
  confirmColor = 'bg-blue-600',
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-6">{message}</p>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            {cancelText || t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-colors ${confirmColor}`}
          >
            {confirmText || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

type ConfirmDialogProps = {
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {title || t('logout.title')}
        </h2>
        <p className="text-gray-600 mb-4">{message || t('logout.message')}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            {t('logout.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            {t('logout.ok')}
          </button>
        </div>
      </div>
    </div>
  );
}

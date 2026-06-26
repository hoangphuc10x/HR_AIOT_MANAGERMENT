'use client';

import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ConfirmUpdateModalProps {
  show: boolean;
  updating: boolean;
  editData: { checkIn: string; checkOut: string };
  onClose: () => void;
  onConfirm: () => void;
  t: (key: string) => string;
}

const ConfirmUpdateModal: React.FC<ConfirmUpdateModalProps> = ({
  show,
  updating,
  editData,
  onClose,
  onConfirm,
  t,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center p-4 z-60">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-yellow-100 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('attendance.confirmTitle')}
            </h3>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">{t('attendance.time')}</p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t('attendance.checkIn')}:
                </span>
                <span className="font-medium text-gray-900">
                  {editData.checkIn || '--:--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t('attendance.checkOut')}:
                </span>
                <span className="font-medium text-gray-900">
                  {editData.checkOut || '--:--'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={updating}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={onConfirm}
              disabled={updating}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center disabled:opacity-50"
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('common.confirm')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmUpdateModal;

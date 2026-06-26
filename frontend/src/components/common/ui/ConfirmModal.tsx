'use client';
import { ReactNode } from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: ReactNode;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
  icon,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Modal panel */}
      <div className="relative z-50 w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* icon */}
            {icon && (
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                  {icon}
                </div>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h3
                id="confirm-modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{message}</p>
            </div>
          </div>

          {/* action buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              ) : null}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { XCircle } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  t: (key: string, options?: Record<string, unknown>) => string;
  supportEmail?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  t,
  supportEmail = 'support@company.com',
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {/* Error Icon with Animation */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <XCircle className="h-12 w-12 text-red-500 animate-pulse" />
          </div>
          <div className="absolute inset-0 w-20 h-20 bg-red-100 rounded-full mx-auto animate-ping opacity-20"></div>
        </div>

        {/* Error Message */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {t('common.errorLoading')}
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm leading-relaxed">{error}</p>
          </div>
          <p className="text-gray-500 text-sm">
            {t('attendance.somethingWentWrong')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t('retry')}
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200"
          >
            {t('common.reloadPage')}
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 mb-2">
            {t('common.contactSupport')}
          </p>
          <a
            href={`mailto:${supportEmail}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {supportEmail}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;

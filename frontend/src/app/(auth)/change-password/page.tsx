'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from '@/lib/axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { getDecodedToken } from '@/lib/getDecodedToken';
import { ChangePasswordFormData } from '@/types/employee/users.interface';

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [errors, setErrors] = useState<Partial<ChangePasswordFormData>>({});
  const { t } = useTranslation();
  const router = useRouter();

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<ChangePasswordFormData> = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Old password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.oldPassword === formData.newPassword) {
      newErrors.newPassword =
        'New password must be different from old password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (
    field: keyof ChangePasswordFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Clear message when user starts typing
    if (message) {
      setMessage(null);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('access_token') || '';
      if (!token) {
        toast.error(t('changePassword.tokenExpired'));
        router.push('/login');
        return;
      }
      const decoded = getDecodedToken();
      const userId = decoded?.userId;

      const res = await axios.post(
        '/auth/change-password',
        {
          oldPassword: formData.oldPassword.trim(),
          newPassword: formData.newPassword.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to change password');
      }

      toast.success(
        res.data.data.message || 'Password changed successfully ✅',
      );

      // Reset form
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswords({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
      router.push(`employee/${userId}`);
    } catch (error) {
      if (isAxiosError(error)) {
        const msg = error.response?.data?.message || t('changePassword.failed');
        toast.error(msg);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('unexpectedError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <Lock className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">
          {t('changePassword.title')}
        </h2>
        <button
          onClick={() => router.back()}
          className="ml-auto p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Old Password */}
        <div>
          <label
            htmlFor="oldPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('changePassword.currentPassword')}
          </label>
          <div className="relative">
            <input
              id="oldPassword"
              type={showPasswords.oldPassword ? 'text' : 'password'}
              value={formData.oldPassword}
              onChange={(e) => handleInputChange('oldPassword', e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.oldPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('forgot_password.enter_password')}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('oldPassword')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.oldPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
          {errors.oldPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.oldPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('changePassword.newPassword')}
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showPasswords.newPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('forgot_password.enter-new_password')}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('newPassword')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.newPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('changePassword.confirmPassword')}
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showPasswords.confirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange('confirmPassword', e.target.value)
              }
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('forgot_password.confirm_new_password')}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirmPassword')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirmPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          } text-white`}
        >
          {isLoading ? t('common.submitLoading') : t('common.submitLoading')}
        </button>
      </form>

      {/* Password Requirements */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          {t('changePassword.requirements.title')}
        </h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• {t('changePassword.requirements.length')}</li>
          <li>• {t('changePassword.requirements.different')}</li>
          <li>• {t('changePassword.requirements.mix')}</li>
        </ul>
      </div>
    </div>
  );
}

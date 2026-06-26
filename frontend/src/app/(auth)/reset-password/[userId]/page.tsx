'use client';
import React, { useState } from 'react';
import axios from '@/lib/axios';
import { Loading } from '@/components/common/ui/loading';
import { useParams, useRouter } from 'next/navigation';
import { BackgroundAiot } from '@/components/common/ui/background-aiot';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const AIOTResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { userId } = useParams();

  const validatePassword = (input: string): string | null => {
    if (!input.trim()) return 'Password is required';
    if (input.length < 8 || input.length > 255) {
      return 'Password must be 8 to 255 characters long';
    }

    return null;
  };

  const validateConfirmPassword = (input: string): string | null => {
    if (!input.trim()) return 'Confirm password is required';
    if (input !== password) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // Clear confirm password error if passwords now match
    if (confirmPassword && value === confirmPassword) {
      setConfirmPasswordError('');
    }
    // Re-validate confirm password if it has been entered
    if (confirmPassword) {
      const confirmError = validateConfirmPassword(confirmPassword);
      setConfirmPasswordError(confirmError || '');
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    // Validate immediately when typing
    const confirmError = validateConfirmPassword(value);
    setConfirmPasswordError(confirmError || '');
  };

  const handleResetPassword = async () => {
    setIsLoading(true);

    const passwordError = validatePassword(password);
    const confirmError = validateConfirmPassword(confirmPassword);

    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (confirmError) {
      setConfirmPasswordError(confirmError);
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(`/auth/reset-password/${userId}`, {
        newPassword: password.trim(),
      });
      if (res.status === 200 || res.status === 201) {
        localStorage.removeItem('email');
        router.push('/login');
        toast.success(t('confirm_code.reset_success'));
      }
    } catch (error) {
      console.log('error', error);
      setError('An error occurred while resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading == true) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-200 flex p-40">
      <BackgroundAiot />

      <div className="w-96 bg-white shadow-2xl flex flex-col justify-center p-8 rounded-2xl">
        {/* Logo */}
        {/* ... */}

        <div className="mt-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            {t('forgot_password.welcome_back')}
          </h2>
          <p className="text-gray-600 mb-8 text-center">
            {t('forgot_password.enter_details')}
          </p>

          <div className="space-y-6">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('forgot_password.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('forgot_password.confirm_password')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                    confirmPasswordError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="mt-1 text-sm text-red-600">
                  {confirmPasswordError}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            {/* Button */}
            <button
              onClick={handleResetPassword}
              disabled={!!confirmPasswordError}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors cursor-pointer ${
                confirmPasswordError
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {t('confirm_code.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOTResetPasswordPage;

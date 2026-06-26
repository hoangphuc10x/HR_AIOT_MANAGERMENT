'use client';
import React, { useState } from 'react';
import axios from '@/lib/axios';
import { Loading } from '@/components/common/ui/loading';
import { useParams, useRouter } from 'next/navigation';
import { BackgroundAiot } from '@/components/common/ui/background-aiot';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const AIOTLoginPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const { userId } = useParams();

  const validatePassword = (input: string): string | null => {
    if (!input.trim()) return 'Password is required';
    if (input.length < 8 || input.length > 255) {
      return 'Password must be 8 to 255 characters long';
    }
    return null;
  };

  const validateConfirmNewPassword = (input: string): string | null => {
    if (!input.trim()) return 'Confirm password is required';
    if (input !== newPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    // Clear confirm password error if passwords now match
    if (confirmNewPassword && value === confirmNewPassword) {
      setConfirmNewPasswordError('');
    }
    // Re-validate confirm password if it has been entered
    if (confirmNewPassword) {
      const confirmError = validateConfirmNewPassword(confirmNewPassword);
      setConfirmNewPasswordError(confirmError || '');
    }
  };

  const handleConfirmNewPasswordChange = (value: string) => {
    setConfirmNewPassword(value);
    // Validate immediately when typing
    const confirmError = validateConfirmNewPassword(value);
    setConfirmNewPasswordError(confirmError || '');
  };

  const handleActiveAccount = async () => {
    setIsLoading(true);

    const passwordError = validatePassword(newPassword);
    const confirmError = validateConfirmNewPassword(confirmNewPassword);

    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (confirmError) {
      setConfirmNewPasswordError(confirmError);
      setIsLoading(false);
      return;
    }

    try {
      if (userId) {
        const res = await axios.post(`/auth/active-account/${userId}`, {
          newPassword: newPassword.trim(),
        });
        if (res.status === 200 || res.status === 201) {
          toast.success('Account activated successfully');
          router.push('/login');
        }
      }
    } catch (err) {
      console.error('error', err);
      setError('An error occurred while processing request');
      toast.error('An error occurred while processing request');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading == true) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-200 flex p-40">
      {/* Left Side - Marketing Content */}
      <BackgroundAiot />

      {/* Right Side - Login Form */}
      <div className="w-96 bg-white shadow-2xl flex flex-col justify-center p-8 rounded-2xl">
        {/* Logo in top right */}
        <div className="top-6 right-6">
          <div className="flex items-center space-x-2">
            <div className="flex">
              <span className="text-lg font-bold text-blue-600">A</span>
              <span className="text-lg font-bold text-red-500">I</span>
              <span className="text-lg font-bold text-yellow-500">O</span>
              <span className="text-lg font-bold text-green-500">T</span>
            </div>
            <div className="text-xs text-gray-600">
              <div>AIoT株式会社・AIOT Inc</div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            {t('active_account.welcome_back')}
          </h2>
          <p className="text-gray-600 mb-8 text-center">
            {t('active_account.enter_details')}
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('active_account.newPassword')}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('active_account.verifyPassword')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) =>
                    handleConfirmNewPasswordChange(e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                    confirmNewPasswordError
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmNewPassword(!showConfirmNewPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmNewPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {confirmNewPasswordError && (
                <p className="mt-1 text-sm text-red-600">
                  {confirmNewPasswordError}
                </p>
              )}
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <button
              onClick={handleActiveAccount}
              disabled={!!confirmNewPasswordError}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors cursor-pointer ${
                confirmNewPasswordError
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {t('active_account.confirm')}
            </button>

            <div className="text-center text-sm text-gray-600">
              {t('active_account.go_to_login')}{' '}
              <Link href="/login" passHref>
                <button className="text-sm text-blue-600 hover:text-blue-700 bg-transparent border-none cursor-pointer">
                  {t('login.login')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOTLoginPage;

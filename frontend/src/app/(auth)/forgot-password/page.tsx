'use client';
import React, { useState } from 'react';
import { Loading } from '@/components/common/ui/loading';
import { useRouter } from 'next/navigation';
import { BackgroundAiot } from '@/components/common/ui/background-aiot';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const AIOTLoginPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const router = useRouter();

  const validateEmail = (input: string): string | null => {
    const usernameRegex =
      /^(?:[a-zA-Z0-9._-]{6,255}|[^\s@]+@[^\s@]+\.[^\s@]+)$/;

    if (!input.trim()) return 'User name is required';
    if (!usernameRegex.test(input)) {
      return 'Username must not contain spaces or accented characters';
    }
    return null;
  };

  const handleForgotPassword = async () => {
    setIsLoading(true);
    setError('');

    const usernameError = validateEmail(email);

    if (usernameError) {
      setError(usernameError);
      toast.error(usernameError);
      setIsLoading(false);
      return;
    }

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const res = await fetch(`${API_URL}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        toast.success(t('confirm_code.access_email_to_reset_password'));
        router.push('/login');
      } else {
        const message =
          data?.message || 'Something went wrong. Please try again.';
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      console.error('Network error', err);
      const message = 'Network error. Please check your connection.';
      setError(message);
      toast.error(message);
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
            {t('forgot_password.verify_email')}
          </h2>
          <p className="text-gray-600 mb-8 text-center">
            {t('forgot_password.enter_email')}
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('forgot_password.email')}
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
                  error
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder=""
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            <button
              onClick={handleForgotPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              {t('forgot_password.verify_email')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOTLoginPage;

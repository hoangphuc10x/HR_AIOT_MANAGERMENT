'use client';
import React, { useState } from 'react';
import axios from '@/lib/axios';
import { Loading } from '@/components/common/ui/loading';
import { useRouter } from 'next/navigation';
import { BackgroundAiot } from '@/components/common/ui/background-aiot';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/common/jwt.interface';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const AIOTLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

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

  const validatePassword = (input: string): string | null => {
    if (!input.trim()) return 'Password is required';
    if (input.length < 8 || input.length > 255) {
      return 'Password must be 8 to 255 characters long';
    }

    return null;
  };

  const handleLogin = async () => {
    setIsLoading(true);

    const passwordError = validatePassword(password);
    const emailError = validateEmail(email);

    if (emailError) {
      setError(emailError);
      setIsLoading(false);
      return;
    }

    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post('/auth/login', {
        email: email.trim(),
        password: password.trim(),
      });

      const fullName = res.data?.data?.data?.user?.fullName;
      const token = res.data?.data?.data?.access_token;
      const decoded: JwtPayload = jwtDecode(token);
      const role = decoded.role;
      const userId = decoded.userId;

      if (!userId) {
        setError('Invalid server response');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('access_token', token);
      localStorage.setItem('userFullName', fullName);

      console.log('userId login:', userId);
      console.log('role:', role);

      if (Array.isArray(role)) {
        if (role.includes(1)) {
          router.push('/');
          toast.success(t('login.login_success'));
          return;
        }

        if (role.includes(2)) {
          router.push('/');
          toast.success(t('login.login_success'));
          return;
        }

        setError('Role is not recognized.');
        setIsLoading(false);
      } else {
        switch (role) {
          case 1:
            router.push('/');
            toast.success(t('login.login_success'));
            break;
          case 2:
            router.push('/');
            toast.success(t('login.login_success'));
            break;
          default:
            setError('Role is not recognized.');
            break;
        }
      }
    } catch (error) {
      console.log('error', error);
      if (isAxiosError(error)) {
        const message =
          error.response?.data?.message || 'Login failed. Please try again';
        setError(message);
      } else {
        setError('Login failed. Please try again');
      }
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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {t('login.welcome_back')}
          </h2>
          <p className="text-gray-600 mb-8">{t('login.enter_details')}</p>
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.email')}
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder=""
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('forgot_password.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="text-right">
              <Link href="/forgot-password" passHref>
                <button className="text-sm text-blue-600 hover:text-blue-700 bg-transparent border-none cursor-pointer">
                  {t('login.forgot_password')}
                </button>
              </Link>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              {t('login.login')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOTLoginPage;

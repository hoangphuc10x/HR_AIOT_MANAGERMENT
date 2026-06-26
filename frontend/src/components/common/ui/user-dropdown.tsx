'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, Loader2, Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import ConfirmDialog from './confirmDialog';
import AvatarCropModal from '@/components/employee/PreviewAvatarModal';
import { toast } from 'react-toastify';
import { useLogoStore } from '../stores/logoStore';
import { getDecodedToken } from '@/lib/getDecodedToken';

const UserDropdown = () => {
  const setLogoUrl = useLogoStore((state) => state.setLogoUrl);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userId, setUserId] = useState<number>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (typeof window !== 'undefined' && i18n.isInitialized) {
      const decode = getDecodedToken();
      const userId = decode?.userId;
      setUserId(userId);
      setIsReady(true);
    }
  }, [i18n.isInitialized]);

  const currentUserFullname = localStorage.getItem('userFullName');

  const handleLogout = () => setShowConfirm(true);

  const confirmLogout = async () => {
    setShowConfirm(false);
    setIsLoggingOut(true);
    try {
      await axios.post(`/auth/logout/${userId}`);
      localStorage.removeItem('access_token');
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      alert('Logout error');
    }
  };

  const cancelLogout = () => setShowConfirm(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  if (!isReady) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setOpenPreview(true);
      e.target.value = '';
    }
  };
  const handleSaveImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`/upload/logo/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLogoUrl(res.data.data.logoUrl);
      toast.success(res.data.data.message);
      setOpenPreview(false);
      setPreviewUrl(null);
    } catch (error) {
      toast.error('Fail to update avatar');
    }
  };
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full border border-gray-200"
      >
        <User className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                {currentUserFullname?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {t('common.hello')}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {currentUserFullname}
                </p>
              </div>
            </div>
          </div>

          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push(`/employee/profile/${userId}`);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
            >
              <Settings size={16} className="text-gray-500" />
              {t('common.editProfile')}
            </button>

            {/* <button
              onClick={() => {
                setIsOpen(false);
                router.push('/profile/avatar');
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
            >
              <Image size={16} className="text-gray-500" />
              {t('common.updateAvatar')}
            </button> */}
            <button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
            >
              <Image size={16} className="text-gray-500" />
              {t('common.updateLogo')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={16} />
              {t('auth.logout')}
            </button>
          </div>
        </div>
      )}
      {showConfirm && (
        <ConfirmDialog
          title={t('logout.title')}
          message={t('logout.message')}
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />
      )}

      {isLoggingOut && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      )}
      <AvatarCropModal
        open={openPreview}
        previewUrl={previewUrl}
        crop={crop}
        zoom={zoom}
        setCrop={setCrop}
        setZoom={setZoom}
        onClose={() => {
          setOpenPreview(false);
          setPreviewUrl(null);
          console.log(openPreview);
        }}
        onSave={(file: File) => handleSaveImage(file)}
      />
    </div>
  );
};

export default UserDropdown;

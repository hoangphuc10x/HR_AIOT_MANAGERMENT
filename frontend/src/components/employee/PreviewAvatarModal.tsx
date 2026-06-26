'use client';

import Cropper, { Area } from 'react-easy-crop';
import { useEffect, useState } from 'react';
import { getCroppedImg } from '@/lib/cropImage';
import { useTranslation } from 'react-i18next';

interface AvatarCropModalProps {
  open: boolean;
  previewUrl: string | null;
  crop: { x: number; y: number };
  zoom: number;
  setCrop: (crop: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  onClose: () => void;
  onSave: (file: File) => void;
}

export default function AvatarCropModal({
  open,
  previewUrl,
  crop,
  zoom,
  setCrop,
  setZoom,
  onClose,
  onSave,
}: AvatarCropModalProps) {
  useEffect(() => {
    // prevent background scroll when modal is open
    if (open) {
      document.body.style.overflow = 'hidden';
      setCroppedAreaPixels(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } else document.body.style.overflow = 'auto';
  }, [open]);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const { t } = useTranslation();
  if (!open) return null;
  const handleSave = async () => {
    if (!previewUrl || !croppedAreaPixels) return;
    try {
      const croppedFile = await getCroppedImg(previewUrl, croppedAreaPixels);
      onSave(croppedFile); // send file to parent
      onClose();
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-xl shadow-lg w-[90vw] max-w-md h-[400px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">{t('common.cropAvatar')}</h2>
        </div>

        {/* Body */}
        <div className="relative flex-1 bg-black">
          {previewUrl && (
            <Cropper
              image={previewUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedAreaPixels) =>
                setCroppedAreaPixels(croppedAreaPixels)
              }
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose}>{t('common.cancel')}</button>
          <button onClick={handleSave}>{t('common.save')}</button>
        </div>
      </div>
    </div>
  );
}

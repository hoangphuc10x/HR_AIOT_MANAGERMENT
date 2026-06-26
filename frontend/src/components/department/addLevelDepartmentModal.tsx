'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AddLevelDepartmentModalProps {
  selectedLevel: number;
  setSelectedLevel: (v: number) => void;
  setShowDialog: (v: boolean) => void;
}

type Level = {
  id: number;
  name: string;
  description: string;
  permissions: string[];
};

export default function AddLevelDepartmentModal({
  selectedLevel,
  setSelectedLevel,
  setShowDialog,
}: AddLevelDepartmentModalProps) {
  const { t } = useTranslation();

  const levels: Level[] = [1, 2, 3].map((id) => ({
    id,
    name: t(`department.levels.${id}.name`) as string,
    description: t(`department.levels.${id}.description`) as string,
    permissions: t(`department.levels.${id}.permissions`, {
      returnObjects: true,
    }) as string[],
  }));

  const [tempLevel, setTempLevel] = useState(selectedLevel);

  const handleConfirm = () => {
    setSelectedLevel(tempLevel);
    setShowDialog(false);
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  return (
    <div className="flex gap-5">
      <div className="inset-0 flex items-center justify-center z-50">
        <div
          className={`bg-white rounded-lg shadow-2xl h-auto max-h-[62vh] flex flex-col w-[35vw]`}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-blue-600 rounded-t-lg">
            <h2 className="text-lg font-semibold text-white">
              {t('department.levelList')}
            </h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 text-xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ul className="space-y-3">
              {levels.map((level) => (
                <li
                  key={level.id}
                  className={`p-4 rounded-lg border transition cursor-pointer ${
                    tempLevel === level.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  onClick={() => setSelectedLevel(level.id)}
                >
                  <label className="flex items-start gap-3 w-full cursor-pointer">
                    <input
                      type="radio"
                      name="selectedLevel"
                      checked={tempLevel === level.id}
                      onChange={() => setTempLevel(level.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {level.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {level.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {level.permissions.map((perm: string) => (
                          <span
                            key={perm}
                            className="px-2 py-1 bg-gray-100 rounded-full text-gray-700"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
            <button
              onClick={handleClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              {t('common.close')}
            </button>
            <button
              onClick={handleConfirm}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition"
            >
              {t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

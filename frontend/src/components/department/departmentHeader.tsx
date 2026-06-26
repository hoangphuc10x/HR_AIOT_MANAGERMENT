'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../common/ui/button';
import { Plus } from 'lucide-react';

type departmentHeaderProps = {
  onAddDepartment: () => void;
  canCreateDepartment: boolean;
};

export default function DepartmentHeader({
  onAddDepartment,
  canCreateDepartment,
}: departmentHeaderProps) {
  const { t, i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && i18n.isInitialized) {
      setIsReady(true);
    }
  }, [i18n.isInitialized]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('common.departments')}
        </h1>
        <p className="text-gray-600">{t('department.description')}</p>
      </div>
      {canCreateDepartment && (
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={onAddDepartment}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('department.addNewDepartment')}
        </Button>
      )}
    </div>
  );
}

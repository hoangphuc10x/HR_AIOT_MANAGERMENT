'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface Member {
  id: number;
  fullName: string;
}

interface MembersDisplayProps {
  selectedMembers: Member[];
  onClearAll: () => void;
  onRemoveMember: (memberId: number) => void;
}

export default function MembersDisplay({
  selectedMembers,
  onClearAll,
  onRemoveMember,
}: MembersDisplayProps) {
  const { t } = useTranslation();

  if (selectedMembers.length === 0) {
    return (
      <div className="text-gray-500 italic py-2">
        {t('department.noMembersSelected')}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-300 rounded-md p-3 max-h-32 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {t('department.selectedMembers')} ({selectedMembers.length})
        </span>
        {selectedMembers.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-red-500 hover:text-red-700 text-xs"
          >
            {t('common.clearAll')}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedMembers.map((member) => (
          <div
            key={member.id}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-blue-200 hover:bg-blue-200 transition-colors"
          >
            <span className="truncate max-w-[120px]">{member.fullName}</span>
            <button
              onClick={() => onRemoveMember(member.id)}
              className="text-blue-600 hover:text-red-500 font-bold text-xs ml-1"
              title={t('common.remove')}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

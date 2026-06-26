'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { Header } from '@/components/common/ui/Headers';
import { User } from '@/types/employee/users.interface';
import { useTranslation } from 'react-i18next';

interface DepartmentMembersListProps {
  members: User[];
  onClose: () => void;
}

export default function DepartmentMemberList({
  members,
  onClose,
}: DepartmentMembersListProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [errorAvatars, setErrorAvatars] = useState<Record<string, boolean>>({});

  const filteredMember = members.filter((member) =>
    `${member.fullName} ${member.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-[35vw] flex flex-col flex-1 h-full">
        <Header
          name={
            t(`common.list`) + ' ' + t(`department.members`).toLocaleLowerCase()
          }
        />

        {/* Search Input */}
        <div className="relative w-full mb-4 mt-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t(`department.searchByNameOrEmail`)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table Header */}
        {filteredMember.length > 0 && (
          <div className="grid grid-cols-7 px-2 py-2 font-semibold text-gray-600 border-b border-gray-300">
            <p className="col-span-4 uppercase pl-10.5">{t(`employee.name`)}</p>
            <p className="col-span-3">EMAIL</p>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto mt-1">
          <ul className="w-full">
            {filteredMember.length > 0 ? (
              filteredMember.map((member, index) => (
                <li
                  key={member.userId}
                  className={`grid grid-cols-7 items-center px-2 py-3 w-full ${
                    index % 2 === 0 ? 'bg-[#e4e4e4]' : 'bg-white'
                  }`}
                >
                  {/* Avatar + Name */}
                  <div className="col-span-4 flex items-center gap-3">
                    {errorAvatars[member.userId] ? (
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold">
                        {member.fullName
                          .trim()
                          .split(' ')
                          .slice(-1)[0]
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    ) : (
                      <Image
                        src={'/images/logo.png'}
                        alt={`${member.fullName}'s avatar`}
                        width={50}
                        height={50}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={() =>
                          setErrorAvatars((prev) => ({
                            ...prev,
                            [member.userId]: true,
                          }))
                        }
                      />
                    )}
                    <span className="text-sm text-gray-800">
                      {member.fullName}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="col-span-3 text-sm text-gray-700">
                    {member.email}
                  </div>
                </li>
              ))
            ) : (
              <li className="text-center text-gray-500 py-4">
                {t(`department.noMembersFound`)}
              </li>
            )}
          </ul>
        </div>

        {/* Cancel Button */}
        <div className="text-center mt-5">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md transition"
          >
            {t(`common.cancel`)}
          </button>
        </div>
      </div>
    </div>
  );
}
